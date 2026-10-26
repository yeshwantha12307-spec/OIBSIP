import { describe, it, expect } from 'vitest';
import { runSeed } from '../scripts/seed.js';
import { User } from '../models/User.js';
import { Inventory } from '../models/Inventory.js';
import { Pizza } from '../models/Pizza.js';
import { InventoryLog } from '../models/InventoryLog.js';

describe('Safe Idempotent Database Seed Suite', () => {
  it('should seed missing demo users, inventory, and craft pizzas on initial run', async () => {
    const initialResult = await runSeed();

    expect(initialResult.usersAdded).toBe(2);
    expect(initialResult.inventoryAdded).toBe(23);
    expect(initialResult.pizzasAdded).toBe(6);

    const admin = await User.findOne({ email: 'admin@oasispizza.com' });
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('admin');
    expect(admin?.isVerified).toBe(true);

    const customer = await User.findOne({ email: 'customer@oasispizza.com' });
    expect(customer).toBeDefined();
    expect(customer?.role).toBe('customer');

    const totalInventory = await Inventory.countDocuments();
    expect(totalInventory).toBe(23);

    const totalPizzas = await Pizza.countDocuments();
    expect(totalPizzas).toBe(6);

    const logs = await InventoryLog.countDocuments({ reason: 'initial_seed' });
    expect(logs).toBe(23);
  });

  it('should be completely idempotent on repeated runs without overwriting or duplicating data', async () => {
    // 1. Initial seed run
    await runSeed();

    // 2. Modify an existing user and inventory item to test that existing data is NEVER overwritten
    const admin = await User.findOne({ email: 'admin@oasispizza.com' });
    expect(admin).toBeDefined();
    admin!.name = 'Custom Admin Name Modified';
    await admin!.save();

    // Change an inventory stock level to simulate active inventory depletion
    const cheese = await Inventory.findOne({ name: 'Whole Milk Mozzarella' });
    expect(cheese).toBeDefined();
    cheese!.availableQuantity = 12; // lower quantity
    await cheese!.save();

    // Also add a custom customer to verify custom users are never touched or dropped
    await User.create({
      name: 'Custom Registered User',
      email: 'custom.user@example.com',
      passwordHash: 'dummyhash',
      role: 'customer',
      isVerified: true,
    });

    // 3. Second seed run on same database
    const secondRunResult = await runSeed();

    // Idempotency assertions: 0 new items added, all existing preserved
    expect(secondRunResult.usersAdded).toBe(0);
    expect(secondRunResult.usersPreserved).toBe(2);
    expect(secondRunResult.inventoryAdded).toBe(0);
    expect(secondRunResult.inventoryPreserved).toBe(23);
    expect(secondRunResult.pizzasAdded).toBe(0);
    expect(secondRunResult.pizzasPreserved).toBe(6);

    // Verify modified user was preserved and not overwritten
    const adminRefetched = await User.findOne({ email: 'admin@oasispizza.com' });
    expect(adminRefetched?.name).toBe('Custom Admin Name Modified');

    // Verify custom user was not deleted
    const customUser = await User.findOne({ email: 'custom.user@example.com' });
    expect(customUser).toBeDefined();

    // Verify inventory stock level was NOT reset to initial seed
    const cheeseRefetched = await Inventory.findOne({ name: 'Whole Milk Mozzarella' });
    expect(cheeseRefetched?.availableQuantity).toBe(12);

    // Total counts remain consistent
    const totalUsers = await User.countDocuments();
    expect(totalUsers).toBe(3); // 2 demo + 1 custom
    const totalInventory = await Inventory.countDocuments();
    expect(totalInventory).toBe(23);
    const totalPizzas = await Pizza.countDocuments();
    expect(totalPizzas).toBe(6);
  });
});
