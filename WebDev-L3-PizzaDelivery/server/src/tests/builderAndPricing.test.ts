import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { Inventory } from '../models/Inventory.js';
import { BASE_CUSTOM_PIZZA_PRICE } from '../controllers/builderController.js';

const app = createApp();

describe('Pizza Customizer & Server-Side Pricing Suite', () => {
  let baseId: string;
  let sauceId: string;
  let cheeseId: string;
  let veggie1Id: string;
  let veggie2Id: string;

  beforeEach(async () => {
    const base = await Inventory.create({
      name: 'Thin Crust',
      category: 'base',
      availableQuantity: 20,
      unit: 'pieces',
      lowStockThreshold: 5,
      priceModifier: 25,
      isAvailable: true,
    });
    baseId = base._id.toString();

    const sauce = await Inventory.create({
      name: 'Marinara',
      category: 'sauce',
      availableQuantity: 30,
      unit: 'ml',
      lowStockThreshold: 5,
      priceModifier: 15,
      isAvailable: true,
    });
    sauceId = sauce._id.toString();

    const cheese = await Inventory.create({
      name: 'Mozzarella',
      category: 'cheese',
      availableQuantity: 25,
      unit: 'grams',
      lowStockThreshold: 5,
      priceModifier: 40,
      isAvailable: true,
    });
    cheeseId = cheese._id.toString();

    const v1 = await Inventory.create({
      name: 'Mushrooms',
      category: 'veggie',
      availableQuantity: 15,
      unit: 'grams',
      lowStockThreshold: 5,
      priceModifier: 30,
      isAvailable: true,
    });
    veggie1Id = v1._id.toString();

    const v2 = await Inventory.create({
      name: 'Olives',
      category: 'veggie',
      availableQuantity: 10,
      unit: 'grams',
      lowStockThreshold: 5,
      priceModifier: 20,
      isAvailable: true,
    });
    veggie2Id = v2._id.toString();
  });

  it('should calculate custom pizza pricing accurately on server-side', async () => {
    const expectedPrice = BASE_CUSTOM_PIZZA_PRICE + 25 + 15 + 40 + 30 + 20;

    const res = await request(app)
      .post('/api/builder/preview-price')
      .send({
        baseId,
        sauceId,
        cheeseId,
        veggieIds: [veggie1Id, veggie2Id],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.unitPrice).toBe(expectedPrice);
    expect(res.body.data.allAvailable).toBe(true);
    expect(res.body.data.breakdown.veggies).toHaveLength(2);
  });

  it('should reject calculation if base is missing or invalid', async () => {
    const res = await request(app)
      .post('/api/builder/preview-price')
      .send({
        baseId: '65f123456789012345678901', // Non-existent base
        sauceId,
        cheeseId,
        veggieIds: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('base');
  });

  it('should detect when an ingredient is out of stock', async () => {
    // Set mushrooms out of stock
    await Inventory.findByIdAndUpdate(veggie1Id, { availableQuantity: 0 });

    const res = await request(app)
      .post('/api/builder/preview-price')
      .send({
        baseId,
        sauceId,
        cheeseId,
        veggieIds: [veggie1Id],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.allAvailable).toBe(false);
    expect(res.body.data.breakdown.veggies[0].inStock).toBe(false);
  });
});
