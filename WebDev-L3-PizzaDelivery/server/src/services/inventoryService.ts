import mongoose from 'mongoose';
import { Inventory } from '../models/Inventory.js';
import { InventoryLog, InventoryLogReason } from '../models/InventoryLog.js';
import { IOrder, IOrderItem } from '../models/Order.js';

export interface IIngredientRequirement {
  inventoryId: string;
  name: string;
  requiredQuantity: number;
}

/**
 * Aggregates all required ingredient quantities across all pizzas in an order
 */
export const aggregateIngredients = (items: IOrderItem[]): Map<string, { id: string; name: string; quantity: number }> => {
  const map = new Map<string, { id: string; name: string; quantity: number }>();

  for (const item of items) {
    const qty = item.quantity || 1;

    // Helper to add ingredient
    const add = (id: any, name: string) => {
      const idStr = id.toString();
      const existing = map.get(idStr);
      if (existing) {
        existing.quantity += qty;
      } else {
        map.set(idStr, { id: idStr, name, quantity: qty });
      }
    };

    if (item.base && item.base.id) add(item.base.id, item.base.name);
    if (item.sauce && item.sauce.id) add(item.sauce.id, item.sauce.name);
    if (item.cheese && item.cheese.id) add(item.cheese.id, item.cheese.name);
    if (Array.isArray(item.veggies)) {
      for (const v of item.veggies) {
        if (v && v.id) add(v.id, v.name);
      }
    }
  }

  return map;
};

/**
 * Validates whether all ingredients in the order have sufficient available quantity
 */
export const checkStockAvailability = async (
  items: IOrderItem[]
): Promise<{
  available: boolean;
  insufficient: Array<{ id: string; name: string; required: number; available: number }>;
}> => {
  const aggregated = aggregateIngredients(items);
  const insufficient: Array<{ id: string; name: string; required: number; available: number }> = [];

  const inventoryIds = Array.from(aggregated.keys());
  const inventoryItems = await Inventory.find({ _id: { $in: inventoryIds } });

  const inventoryMap = new Map(inventoryItems.map((item) => [item._id.toString(), item]));

  for (const [id, req] of aggregated.entries()) {
    const stockItem = inventoryMap.get(id);
    if (!stockItem || !stockItem.isAvailable || stockItem.availableQuantity < req.quantity) {
      insufficient.push({
        id,
        name: req.name || stockItem?.name || 'Unknown Ingredient',
        required: req.quantity,
        available: stockItem ? stockItem.availableQuantity : 0,
      });
    }
  }

  return {
    available: insufficient.length === 0,
    insufficient,
  };
};

/**
 * Atomically deducts ingredients for a paid order and creates audit logs.
 * Guarantees idempotency via order.inventoryDeducted flag.
 */
export const deductInventoryForOrder = async (order: IOrder): Promise<{ success: boolean; error?: string }> => {
  if (order.inventoryDeducted) {
    console.warn(`[Inventory] Order ${order.orderNumber} has already deducted inventory. Skipping duplicate deduction.`);
    return { success: true };
  }

  const aggregated = aggregateIngredients(order.items);
  const stockCheck = await checkStockAvailability(order.items);

  if (!stockCheck.available) {
    const details = stockCheck.insufficient.map((i) => `${i.name} (Need: ${i.required}, Have: ${i.available})`).join(', ');
    return {
      success: false,
      error: `Insufficient inventory for fulfillment: ${details}`,
    };
  }

  // Atomic deduction with rollback capability if any single item fails
  const deductionsApplied: Array<{ id: string; amount: number; name: string }> = [];

  try {
    for (const [id, req] of aggregated.entries()) {
      // Find and atomically decrement only if quantity is sufficient
      const updated = await Inventory.findOneAndUpdate(
        {
          _id: id,
          availableQuantity: { $gte: req.quantity },
        },
        {
          $inc: { availableQuantity: -req.quantity },
        },
        { new: false } // return previous state to log exact previousQuantity
      );

      if (!updated) {
        throw new Error(`Race condition detected: Insufficient stock for ${req.name}`);
      }

      deductionsApplied.push({ id, amount: req.quantity, name: req.name });

      // Create inventory audit log
      await InventoryLog.create({
        inventoryId: updated._id,
        ingredientName: updated.name,
        changeAmount: -req.quantity,
        previousQuantity: updated.availableQuantity,
        newQuantity: updated.availableQuantity - req.quantity,
        reason: 'order_deduction',
        orderId: order._id,
        performedBy: 'SYSTEM',
        notes: `Deducted for verified order #${order.orderNumber}`,
      });
    }

    // Mark order as inventory deducted
    order.inventoryDeducted = true;
    await order.save();

    console.log(`[Inventory] Successfully deducted ingredients for order #${order.orderNumber}`);
    return { success: true };
  } catch (error) {
    console.error(`[Inventory Error] Deduction failed for order #${order.orderNumber}:`, error);

    // Rollback any partial deductions applied so far
    for (const rolled of deductionsApplied) {
      await Inventory.findByIdAndUpdate(rolled.id, {
        $inc: { availableQuantity: rolled.amount },
      });
      console.warn(`[Inventory Rollback] Reverted deduction of ${rolled.amount} for ${rolled.name}`);
    }

    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Manually adjusts inventory stock (admin action) with audit logging
 */
export const adjustInventoryStock = async (
  inventoryId: string,
  newQuantity: number,
  reason: InventoryLogReason,
  performedBy: string,
  notes?: string
) => {
  const item = await Inventory.findById(inventoryId);
  if (!item) {
    throw new Error('Inventory ingredient not found');
  }

  const previousQuantity = item.availableQuantity;
  const changeAmount = newQuantity - previousQuantity;

  item.availableQuantity = Math.max(0, newQuantity);
  // Auto-enable availability if stock > 0
  if (item.availableQuantity > 0 && !item.isAvailable) {
    item.isAvailable = true;
  }
  await item.save();

  // Create audit log
  const log = await InventoryLog.create({
    inventoryId: item._id,
    ingredientName: item.name,
    changeAmount,
    previousQuantity,
    newQuantity: item.availableQuantity,
    reason,
    performedBy,
    notes: notes || `Stock updated to ${item.availableQuantity} ${item.unit}`,
  });

  return { item, log };
};
