import cron from 'node-cron';
import { Inventory } from '../models/Inventory.js';
import { InventoryAlert } from '../models/InventoryAlert.js';
import { sendLowStockAlertEmail } from './emailService.js';
import { env } from '../config/env.js';

let cronTask: cron.ScheduledTask | null = null;

/**
 * Checks all inventory items against thresholds:
 * 1. Dispatches alerts for newly breached thresholds (deduplicated against existing unresolved alerts).
 * 2. Marks previous alerts as resolved if stock has been replenished above threshold.
 */
export const checkAndAlertLowStock = async (): Promise<{
  newAlertsSent: number;
  resolvedCount: number;
}> => {
  console.log('[Inventory Cron] Scanning stock levels against low-stock thresholds...');

  // 1. Find all items currently at or below their threshold
  const lowStockItems = await Inventory.find({
    $expr: { $lte: ['$availableQuantity', '$lowStockThreshold'] },
  });

  const newlyBreachedItems: Array<{
    name: string;
    category: string;
    quantity: number;
    threshold: number;
    unit: string;
    inventoryId: any;
  }> = [];

  for (const item of lowStockItems) {
    // Check if there is an active, unresolved alert already recorded
    const existingUnresolvedAlert = await InventoryAlert.findOne({
      inventoryId: item._id,
      resolved: false,
    });

    if (!existingUnresolvedAlert) {
      newlyBreachedItems.push({
        name: item.name,
        category: item.category,
        quantity: item.availableQuantity,
        threshold: item.lowStockThreshold,
        unit: item.unit,
        inventoryId: item._id,
      });
    }
  }

  let newAlertsSent = 0;
  if (newlyBreachedItems.length > 0) {
    console.log(`[Inventory Cron] Found ${newlyBreachedItems.length} new low-stock breach(es). Sending alert...`);
    const emailSuccess = await sendLowStockAlertEmail(env.ADMIN_ALERT_EMAIL, newlyBreachedItems);

    for (const item of newlyBreachedItems) {
      await InventoryAlert.create({
        inventoryId: item.inventoryId,
        ingredientName: item.name,
        category: item.category,
        currentQuantity: item.quantity,
        lowStockThreshold: item.threshold,
        unit: item.unit,
        sentToEmail: env.ADMIN_ALERT_EMAIL,
        status: emailSuccess ? 'sent' : 'failed',
        resolved: false,
      });
      newAlertsSent++;
    }
  } else {
    console.log('[Inventory Cron] No new unresolved low-stock breaches found.');
  }

  // 2. Check healthy items: If any item is now ABOVE threshold, resolve any open alerts for it
  const healthyItems = await Inventory.find({
    $expr: { $gt: ['$availableQuantity', '$lowStockThreshold'] },
  });

  let resolvedCount = 0;
  for (const item of healthyItems) {
    const unresolvedAlerts = await InventoryAlert.find({
      inventoryId: item._id,
      resolved: false,
    });

    if (unresolvedAlerts.length > 0) {
      await InventoryAlert.updateMany(
        { inventoryId: item._id, resolved: false },
        { resolved: true, resolvedAt: new Date() }
      );
      resolvedCount += unresolvedAlerts.length;
      console.log(`[Inventory Cron] Stock replenished for ${item.name} (${item.availableQuantity} ${item.unit}). Marked ${unresolvedAlerts.length} alert(s) as resolved.`);
    }
  }

  return { newAlertsSent, resolvedCount };
};

/**
 * Initializes the node-cron scheduler
 */
export const startInventoryScheduler = (): void => {
  if (cronTask) {
    cronTask.stop();
  }

  console.log(`[Scheduler] Initializing inventory check with cron schedule: "${env.INVENTORY_CRON_SCHEDULE}"`);

  cronTask = cron.schedule(env.INVENTORY_CRON_SCHEDULE, async () => {
    try {
      await checkAndAlertLowStock();
    } catch (error) {
      console.error('[Scheduler Error] Inventory check cron failed:', error);
    }
  });
};

export const stopInventoryScheduler = (): void => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('[Scheduler] Inventory cron stopped.');
  }
};
