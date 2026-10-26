import { describe, it, expect, beforeEach } from 'vitest';
import { Inventory } from '../models/Inventory.js';
import { InventoryAlert } from '../models/InventoryAlert.js';
import { checkAndAlertLowStock } from '../services/cronService.js';

describe('Inventory Low-Stock Scheduled Alert Logic Suite', () => {
  let lowItem: any;
  let healthyItem: any;

  beforeEach(async () => {
    // 1. Create item currently below threshold (low stock: 2 <= 5)
    lowItem = await Inventory.create({
      name: 'Oregano Flakes',
      category: 'veggie',
      availableQuantity: 2,
      unit: 'grams',
      lowStockThreshold: 5,
      priceModifier: 10,
      isAvailable: true,
    });

    // 2. Create item with healthy stock (20 > 5)
    healthyItem = await Inventory.create({
      name: 'Parmesan Shreds',
      category: 'cheese',
      availableQuantity: 20,
      unit: 'grams',
      lowStockThreshold: 5,
      priceModifier: 30,
      isAvailable: true,
    });
  });

  it('should detect low stock item and generate a new InventoryAlert', async () => {
    const result = await checkAndAlertLowStock();

    expect(result.newAlertsSent).toBe(1);

    const alerts = await InventoryAlert.find({ inventoryId: lowItem._id });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].ingredientName).toBe('Oregano Flakes');
    expect(alerts[0].resolved).toBe(false);
  });

  it('should deduplicate alerts and avoid sending repeated alerts for the same unresolved breach', async () => {
    // First run creates alert
    const firstRun = await checkAndAlertLowStock();
    expect(firstRun.newAlertsSent).toBe(1);

    // Second run should recognize the unresolved alert and NOT send another
    const secondRun = await checkAndAlertLowStock();
    expect(secondRun.newAlertsSent).toBe(0);

    const alerts = await InventoryAlert.find({ inventoryId: lowItem._id });
    expect(alerts).toHaveLength(1); // Still only 1 alert recorded!
  });

  it('should automatically mark alert as resolved when stock is replenished above threshold', async () => {
    // Initial breach
    await checkAndAlertLowStock();

    // Restock the item above threshold (from 2 to 15, threshold is 5)
    await Inventory.findByIdAndUpdate(lowItem._id, { availableQuantity: 15 });

    // Next scheduler run
    const result = await checkAndAlertLowStock();
    expect(result.resolvedCount).toBe(1);

    // Verify alert is marked resolved
    const alert = await InventoryAlert.findOne({ inventoryId: lowItem._id });
    expect(alert!.resolved).toBe(true);
    expect(alert!.resolvedAt).toBeDefined();

    // If stock drops below threshold AGAIN later, a new alert is generated
    await Inventory.findByIdAndUpdate(lowItem._id, { availableQuantity: 1 });
    const subsequentRun = await checkAndAlertLowStock();
    expect(subsequentRun.newAlertsSent).toBe(1);

    const totalAlerts = await InventoryAlert.find({ inventoryId: lowItem._id });
    expect(totalAlerts).toHaveLength(2); // One resolved, one new active!
  });
});
