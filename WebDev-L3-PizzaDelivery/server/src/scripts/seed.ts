import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Inventory, IInventory } from '../models/Inventory.js';
import { Pizza } from '../models/Pizza.js';
import { InventoryLog } from '../models/InventoryLog.js';

interface SeedResult {
  usersAdded: number;
  usersPreserved: number;
  inventoryAdded: number;
  inventoryPreserved: number;
  pizzasAdded: number;
  pizzasPreserved: number;
}

/**
 * Safe, idempotent database seeder.
 * - Never drops or deletes collections.
 * - Never overwrites existing user passwords, roles, or custom accounts.
 * - Preserves existing inventory quantities and thresholds.
 * - Inserts only missing demo accounts, ingredients, and craft menu pizzas.
 */
export const runSeed = async (): Promise<SeedResult> => {
  console.log('\n[Seed] Starting safe, idempotent database seed...');

  const result: SeedResult = {
    usersAdded: 0,
    usersPreserved: 0,
    inventoryAdded: 0,
    inventoryPreserved: 0,
    pizzasAdded: 0,
    pizzasPreserved: 0,
  };

  // 1. Safe Demo Users Upsert (Never overwrite existing user passwords or data)
  const demoUsers = [
    {
      name: 'Oasis Administrator',
      email: 'admin@oasispizza.com',
      rawPassword: 'AdminPassword@123',
      role: 'admin' as const,
      isVerified: true,
    },
    {
      name: 'Sophia Rossi',
      email: 'customer@oasispizza.com',
      rawPassword: 'CustomerPassword@123',
      role: 'customer' as const,
      isVerified: true,
    },
  ];

  for (const demoUser of demoUsers) {
    const existingUser = await User.findOne({ email: demoUser.email.toLowerCase() });
    if (!existingUser) {
      const passwordHash = await bcrypt.hash(demoUser.rawPassword, 12);
      await User.create({
        name: demoUser.name,
        email: demoUser.email.toLowerCase(),
        passwordHash,
        role: demoUser.role,
        isVerified: demoUser.isVerified,
      });
      console.log(`[Seed] Inserted missing demo ${demoUser.role}: ${demoUser.email}`);
      result.usersAdded++;
    } else {
      console.log(`[Seed] Preserved existing user account: ${demoUser.email} (Untouched)`);
      result.usersPreserved++;
    }
  }

  // Helper for inventory insertion without overwriting existing stock levels
  const ensureInventoryItem = async (itemData: Partial<IInventory>): Promise<IInventory> => {
    let item = await Inventory.findOne({ name: itemData.name });
    if (!item) {
      item = await Inventory.create(itemData);
      await InventoryLog.create({
        inventoryId: item._id,
        ingredientName: item.name,
        changeAmount: item.availableQuantity,
        previousQuantity: 0,
        newQuantity: item.availableQuantity,
        reason: 'initial_seed',
        performedBy: 'SYSTEM',
        notes: `Initial stock seeded at ${item.availableQuantity} ${item.unit}`,
      });
      console.log(`[Seed] Inserted missing inventory item: ${item.name} (${item.availableQuantity} ${item.unit})`);
      result.inventoryAdded++;
    } else {
      console.log(`[Seed] Preserved existing inventory item: ${item.name} (${item.availableQuantity} ${item.unit})`);
      result.inventoryPreserved++;
    }
    return item;
  };

  // 2. Pizza Bases (5 Items)
  const basesData: Partial<IInventory>[] = [
    {
      name: 'Classic Hand-Tossed',
      category: 'base',
      availableQuantity: 50,
      unit: 'pieces',
      lowStockThreshold: 15,
      priceModifier: 0,
      isAvailable: true,
      description: 'Traditional slow-fermented Neapolitan dough with a pillowy, airy crust.',
      isVegetarian: true,
    },
    {
      name: 'Italian Thin Crust',
      category: 'base',
      availableQuantity: 45,
      unit: 'pieces',
      lowStockThreshold: 15,
      priceModifier: 20,
      isAvailable: true,
      description: 'Crisp and delicate Roman-style thin crust that lets the toppings shine.',
      isVegetarian: true,
    },
    {
      name: 'Double Cheese Burst',
      category: 'base',
      availableQuantity: 30,
      unit: 'pieces',
      lowStockThreshold: 10,
      priceModifier: 80,
      isAvailable: true,
      description: 'Decadent crust loaded and stuffed with molten aged cheddar and mozzarella.',
      isVegetarian: true,
    },
    {
      name: 'Rustic Whole Wheat',
      category: 'base',
      availableQuantity: 40,
      unit: 'pieces',
      lowStockThreshold: 12,
      priceModifier: 30,
      isAvailable: true,
      description: 'Wholesome stoneground wheat base with a nutty flavor and rich fiber.',
      isVegetarian: true,
    },
    {
      name: 'Gluten-Free Cauliflower Crust',
      category: 'base',
      availableQuantity: 25,
      unit: 'pieces',
      lowStockThreshold: 8,
      priceModifier: 60,
      isAvailable: true,
      description: 'Light, naturally gluten-free cauliflower crust baked to golden perfection.',
      isVegetarian: true,
    },
  ];

  const bases: IInventory[] = [];
  for (const baseData of basesData) {
    bases.push(await ensureInventoryItem(baseData));
  }

  // 3. Pizza Sauces (5 Items)
  const saucesData: Partial<IInventory>[] = [
    {
      name: 'Zesty San Marzano Marinara',
      category: 'sauce',
      availableQuantity: 60,
      unit: 'ml',
      lowStockThreshold: 15,
      priceModifier: 0,
      isAvailable: true,
      description: 'Imported San Marzano tomatoes simmered with fresh garlic, oregano, and basil.',
      isVegetarian: true,
    },
    {
      name: 'Creamy Garlic Alfredo',
      category: 'sauce',
      availableQuantity: 45,
      unit: 'ml',
      lowStockThreshold: 15,
      priceModifier: 30,
      isAvailable: true,
      description: 'Velvety cream sauce infused with roasted garlic cloves and parmesan.',
      isVegetarian: true,
    },
    {
      name: 'Smoky Chipotle BBQ',
      category: 'sauce',
      availableQuantity: 40,
      unit: 'ml',
      lowStockThreshold: 12,
      priceModifier: 30,
      isAvailable: true,
      description: 'Tangy barbecue sauce with hickory smoke and subtle chipotle pepper warmth.',
      isVegetarian: true,
    },
    {
      name: 'Ligurian Basil Pesto',
      category: 'sauce',
      availableQuantity: 35,
      unit: 'ml',
      lowStockThreshold: 10,
      priceModifier: 40,
      isAvailable: true,
      description: 'Fragrant sweet basil, toasted pine nuts, extra virgin olive oil, and pecorino.',
      isVegetarian: true,
    },
    {
      name: 'Fiery Calabrian Peri-Peri',
      category: 'sauce',
      availableQuantity: 50,
      unit: 'ml',
      lowStockThreshold: 15,
      priceModifier: 25,
      isAvailable: true,
      description: 'Spicy chili fusion sauce offering a bold kick and bright citrus undertones.',
      isVegetarian: true,
    },
  ];

  const sauces: IInventory[] = [];
  for (const sauceData of saucesData) {
    sauces.push(await ensureInventoryItem(sauceData));
  }

  // 4. Cheeses (4 Items)
  const cheesesData: Partial<IInventory>[] = [
    {
      name: 'Whole Milk Mozzarella',
      category: 'cheese',
      availableQuantity: 70,
      unit: 'grams',
      lowStockThreshold: 20,
      priceModifier: 40,
      isAvailable: true,
      description: 'Classic creamy stretchy mozzarella that caramelizes with signature golden blister spots.',
      isVegetarian: true,
    },
    {
      name: 'Sharp Cheddar Blend',
      category: 'cheese',
      availableQuantity: 45,
      unit: 'grams',
      lowStockThreshold: 15,
      priceModifier: 50,
      isAvailable: true,
      description: 'Aged Wisconsin white and yellow cheddar for a punchy, savory depth.',
      isVegetarian: true,
    },
    {
      name: 'Fresh Bocconcini',
      category: 'cheese',
      availableQuantity: 30,
      unit: 'grams',
      lowStockThreshold: 10,
      priceModifier: 65,
      isAvailable: true,
      description: 'Hand-pulled soft porcelain balls of fresh mozzarella offering delicate milky sweetness.',
      isVegetarian: true,
    },
    {
      name: 'Artisan Vegan Cashew Cheese',
      category: 'cheese',
      availableQuantity: 25,
      unit: 'grams',
      lowStockThreshold: 8,
      priceModifier: 60,
      isAvailable: true,
      description: 'Cultured cashew nut cheese with a smooth melt, 100% dairy-free and plant-based.',
      isVegetarian: true,
    },
  ];

  const cheeses: IInventory[] = [];
  for (const cheeseData of cheesesData) {
    cheeses.push(await ensureInventoryItem(cheeseData));
  }

  // 5. Veggies & Toppings (9 Items)
  const veggiesData: Partial<IInventory>[] = [
    {
      name: 'Roasted Bell Peppers',
      category: 'veggie',
      availableQuantity: 55,
      unit: 'grams',
      lowStockThreshold: 15,
      priceModifier: 25,
      isAvailable: true,
      description: 'Flame-roasted tricolor bell peppers with crisp sweetness.',
      isVegetarian: true,
    },
    {
      name: 'Caramelized Red Onions',
      category: 'veggie',
      availableQuantity: 60,
      unit: 'grams',
      lowStockThreshold: 15,
      priceModifier: 20,
      isAvailable: true,
      description: 'Slow-cooked Spanish onions with balsamic glaze.',
      isVegetarian: true,
    },
    {
      name: 'Cremini Wild Mushrooms',
      category: 'veggie',
      availableQuantity: 40,
      unit: 'grams',
      lowStockThreshold: 12,
      priceModifier: 35,
      isAvailable: true,
      description: 'Earthy baby bella mushrooms sautéed in herb olive oil.',
      isVegetarian: true,
    },
    {
      name: 'Kalamata Black Olives',
      category: 'veggie',
      availableQuantity: 45,
      unit: 'grams',
      lowStockThreshold: 12,
      priceModifier: 30,
      isAvailable: true,
      description: 'Sun-ripened Greek black olives sliced to perfection.',
      isVegetarian: true,
    },
    {
      name: 'Pickled Jalapeños',
      category: 'veggie',
      availableQuantity: 50,
      unit: 'grams',
      lowStockThreshold: 15,
      priceModifier: 25,
      isAvailable: true,
      description: 'Spicy pepper rings with a tangy pickle crunch.',
      isVegetarian: true,
    },
    {
      name: 'Sweet Golden Corn',
      category: 'veggie',
      availableQuantity: 50,
      unit: 'grams',
      lowStockThreshold: 15,
      priceModifier: 20,
      isAvailable: true,
      description: 'Plump and juicy sweet corn kernels.',
      isVegetarian: true,
    },
    {
      name: 'Fresh Baby Spinach',
      category: 'veggie',
      availableQuantity: 40,
      unit: 'grams',
      lowStockThreshold: 12,
      priceModifier: 25,
      isAvailable: true,
      description: 'Tender baby spinach leaves wilted on the hot oven stone.',
      isVegetarian: true,
    },
    {
      name: 'Sun-dried Tomatoes',
      category: 'veggie',
      availableQuantity: 30,
      unit: 'grams',
      lowStockThreshold: 10,
      priceModifier: 35,
      isAvailable: true,
      description: 'Intense sweet and tart Italian sun-dried tomato strips.',
      isVegetarian: true,
    },
    {
      name: 'Marinated Herbed Paneer',
      category: 'veggie',
      availableQuantity: 35,
      unit: 'grams',
      lowStockThreshold: 10,
      priceModifier: 45,
      isAvailable: true,
      description: 'Soft cottage cheese cubes marinated in aromatic spices.',
      isVegetarian: true,
    },
  ];

  const veggies: IInventory[] = [];
  for (const veggieData of veggiesData) {
    veggies.push(await ensureInventoryItem(veggieData));
  }

  // Lookup helper references for craft pizzas
  const classicBase = bases.find((b) => b.name === 'Classic Hand-Tossed')!;
  const thinBase = bases.find((b) => b.name === 'Italian Thin Crust')!;
  const burstBase = bases.find((b) => b.name === 'Double Cheese Burst')!;
  const wheatBase = bases.find((b) => b.name === 'Rustic Whole Wheat')!;

  const marinara = sauces.find((s) => s.name.includes('Marinara'))!;
  const alfredo = sauces.find((s) => s.name.includes('Alfredo'))!;
  const periPeri = sauces.find((s) => s.name.includes('Peri-Peri'))!;
  const pesto = sauces.find((s) => s.name.includes('Pesto'))!;
  const bbq = sauces.find((s) => s.name.includes('BBQ'))!;

  const mozzarella = cheeses.find((c) => c.name.includes('Mozzarella'))!;
  const bocconcini = cheeses.find((c) => c.name.includes('Bocconcini'))!;
  const cheddar = cheeses.find((c) => c.name.includes('Cheddar'))!;

  const bellPepper = veggies.find((v) => v.name.includes('Bell Peppers'))!;
  const mushrooms = veggies.find((v) => v.name.includes('Mushrooms'))!;
  const olives = veggies.find((v) => v.name.includes('Olives'))!;
  const jalapenos = veggies.find((v) => v.name.includes('Jalapeños'))!;
  const corn = veggies.find((v) => v.name.includes('Corn'))!;
  const spinach = veggies.find((v) => v.name.includes('Spinach'))!;
  const sundried = veggies.find((v) => v.name.includes('Sun-dried'))!;
  const paneer = veggies.find((v) => v.name.includes('Paneer'))!;
  const onion = veggies.find((v) => v.name.includes('Onions'))!;

  // 6. Safe Craft Menu Pizzas (6 Items)
  const craftPizzas = [
    {
      name: 'Margherita Superiore',
      description: 'Wood-fired sourdough crust topped with sweet San Marzano marinara, fresh Bocconcini mozzarella, aromatic basil, and sun-dried tomatoes.',
      imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
      basePrice: 349,
      defaultBase: classicBase._id,
      defaultSauce: marinara._id,
      defaultCheese: bocconcini._id,
      defaultVeggies: [sundried._id],
      isVegetarian: true,
      isAvailable: true,
      tags: ['Chef Special', 'Italian Classic', 'Vegetarian'],
    },
    {
      name: 'Truffle Cremini Melt',
      description: 'Crisp Roman thin crust brushed with creamy garlic alfredo, layered with whole milk mozzarella, sautéed cremini wild mushrooms, baby spinach, and sweet onions.',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      basePrice: 429,
      defaultBase: thinBase._id,
      defaultSauce: alfredo._id,
      defaultCheese: mozzarella._id,
      defaultVeggies: [mushrooms._id, spinach._id, onion._id],
      isVegetarian: true,
      isAvailable: true,
      tags: ['Gourmet White', 'Vegetarian', 'Bestseller'],
    },
    {
      name: 'Fiery Peri-Peri Paneer',
      description: 'Molten cheese burst crust topped with spicy Calabrian peri-peri sauce, sharp cheddar blend, spiced paneer cubes, fire-roasted peppers, and crunchy jalapenos.',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      basePrice: 479,
      defaultBase: burstBase._id,
      defaultSauce: periPeri._id,
      defaultCheese: cheddar._id,
      defaultVeggies: [paneer._id, bellPepper._id, jalapenos._id],
      isVegetarian: true,
      isAvailable: true,
      tags: ['Spicy', 'Cheese Burst', 'Fusion'],
    },
    {
      name: 'Verde Pesto Genovese',
      description: 'Hearty stoneground whole wheat crust layered with fragrant Ligurian basil pesto, melted mozzarella, bell peppers, Kalamata olives, and tender baby spinach.',
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
      basePrice: 399,
      defaultBase: wheatBase._id,
      defaultSauce: pesto._id,
      defaultCheese: mozzarella._id,
      defaultVeggies: [bellPepper._id, olives._id, spinach._id],
      isVegetarian: true,
      isAvailable: true,
      tags: ['Healthy Choice', 'Herbaceous', 'Vegetarian'],
    },
    {
      name: 'Rustic Farmhouse Garden',
      description: 'Hand-tossed classic crust featuring San Marzano marinara, mozzarella, crisp golden corn, cremini mushrooms, bell peppers, and caramelized onions.',
      imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
      basePrice: 379,
      defaultBase: classicBase._id,
      defaultSauce: marinara._id,
      defaultCheese: mozzarella._id,
      defaultVeggies: [corn._id, mushrooms._id, bellPepper._id, onion._id],
      isVegetarian: true,
      isAvailable: true,
      tags: ['Garden Fresh', 'Family Favorite'],
    },
    {
      name: 'Smoky Chipotle BBQ Fiesta',
      description: 'Classic crust smothered with bold smoky chipotle BBQ sauce, sharp cheddar, marinated herbed paneer, pickled jalapenos, and caramelized red onions.',
      imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80',
      basePrice: 449,
      defaultBase: classicBase._id,
      defaultSauce: bbq._id,
      defaultCheese: cheddar._id,
      defaultVeggies: [paneer._id, jalapenos._id, onion._id],
      isVegetarian: true,
      isAvailable: true,
      tags: ['Smoky BBQ', 'Spicy'],
    },
  ];

  for (const pizzaData of craftPizzas) {
    const existingPizza = await Pizza.findOne({ name: pizzaData.name });
    if (!existingPizza) {
      await Pizza.create(pizzaData);
      console.log(`[Seed] Inserted missing craft pizza: ${pizzaData.name}`);
      result.pizzasAdded++;
    } else {
      console.log(`[Seed] Preserved existing craft pizza: ${pizzaData.name}`);
      result.pizzasPreserved++;
    }
  }

  console.log(`\n[Seed Summary] Users: +${result.usersAdded} new / ${result.usersPreserved} preserved | Inventory: +${result.inventoryAdded} new / ${result.inventoryPreserved} preserved | Pizzas: +${result.pizzasAdded} new / ${result.pizzasPreserved} preserved.`);
  return result;
};

if (process.argv[1]?.includes('seed')) {
  connectDB()
    .then(runSeed)
    .then(() => {
      console.log('[Seed] Database seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error] Database seeding failed:', err);
      process.exit(1);
    });
}
