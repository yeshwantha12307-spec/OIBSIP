import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../app.js';
import { User } from '../models/User.js';
import { Inventory } from '../models/Inventory.js';
import { Order } from '../models/Order.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { generateTestSignature } from '../services/razorpayService.js';
import { env } from '../config/env.js';

const app = createApp();

describe('Order & Razorpay Payment Integration Suite', () => {
  let customerToken: string;
  let adminToken: string;
  let customerId: string;
  let base: any;
  let sauce: any;
  let cheese: any;
  let veggie: any;

  beforeEach(async () => {
    // 1. Create customer
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      passwordHash: await bcrypt.hash('Password123!', 10),
      role: 'customer',
      isVerified: true,
    });
    customerId = customer._id.toString();

    const custLogin = await request(app).post('/api/auth/login').send({
      email: 'customer@test.com',
      password: 'Password123!',
    });
    customerToken = custLogin.body.token;

    // 2. Create admin
    await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      passwordHash: await bcrypt.hash('Password123!', 10),
      role: 'admin',
      isVerified: true,
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'Password123!',
    });
    adminToken = adminLogin.body.token;

    // 3. Create ingredients
    base = await Inventory.create({
      name: 'Hand Tossed Crust',
      category: 'base',
      availableQuantity: 10,
      unit: 'pieces',
      lowStockThreshold: 3,
      priceModifier: 0,
      isAvailable: true,
    });

    sauce = await Inventory.create({
      name: 'San Marzano Marinara',
      category: 'sauce',
      availableQuantity: 10,
      unit: 'ml',
      lowStockThreshold: 3,
      priceModifier: 0,
      isAvailable: true,
    });

    cheese = await Inventory.create({
      name: 'Fresh Mozzarella',
      category: 'cheese',
      availableQuantity: 10,
      unit: 'grams',
      lowStockThreshold: 3,
      priceModifier: 40,
      isAvailable: true,
    });

    veggie = await Inventory.create({
      name: 'Bell Peppers',
      category: 'veggie',
      availableQuantity: 10,
      unit: 'grams',
      lowStockThreshold: 3,
      priceModifier: 25,
      isAvailable: true,
    });
  });

  it('should create an order, calculate server pricing, and generate Razorpay order ID', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        rawItems: [
          {
            type: 'custom',
            name: 'My Custom Pizza',
            baseId: base._id.toString(),
            sauceId: sauce._id.toString(),
            cheeseId: cheese._id.toString(),
            veggieIds: [veggie._id.toString()],
            quantity: 2,
          },
        ],
        deliveryAddress: {
          street: '123 Pizza Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          phone: '9876543210',
          instructions: 'Ring doorbell twice',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.status).toBe('PENDING_PAYMENT');
    expect(res.body.order.paymentStatus).toBe('unpaid');
    expect(res.body.razorpay.orderId).toBeDefined();
    expect(res.body.razorpay.keyId).toBe(env.RAZORPAY_KEY_ID);
    expect(res.body.order.inventoryDeducted).toBe(false);
  });

  it('should reject order creation if ingredient stock is insufficient', async () => {
    // Reduce base quantity to 1
    await Inventory.findByIdAndUpdate(base._id, { availableQuantity: 1 });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        rawItems: [
          {
            type: 'custom',
            baseId: base._id.toString(),
            sauceId: sauce._id.toString(),
            cheeseId: cheese._id.toString(),
            veggieIds: [veggie._id.toString()],
            quantity: 5, // Requires 5, only 1 available
          },
        ],
        deliveryAddress: {
          street: '123 Pizza Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          phone: '9876543210',
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('out of stock');
    expect(res.body.insufficient).toBeDefined();
  });

  it('should verify valid Razorpay payment signature, transition status to PLACED, and atomically deduct inventory', async () => {
    // 1. Create order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        rawItems: [
          {
            type: 'custom',
            baseId: base._id.toString(),
            sauceId: sauce._id.toString(),
            cheeseId: cheese._id.toString(),
            veggieIds: [veggie._id.toString()],
            quantity: 2,
          },
        ],
        deliveryAddress: {
          street: '123 Pizza Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          phone: '9876543210',
        },
      });

    const orderId = orderRes.body.order._id;
    const razorpayOrderId = orderRes.body.razorpay.orderId;
    const razorpayPaymentId = `pay_test_${Date.now()}`;
    const validSignature = generateTestSignature(razorpayOrderId, razorpayPaymentId);

    // Initial stock check
    const initialBase = await Inventory.findById(base._id);
    expect(initialBase!.availableQuantity).toBe(10);

    // 2. Submit payment verification
    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: validSignature,
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.order.status).toBe('PLACED');
    expect(verifyRes.body.order.paymentStatus).toBe('paid');
    expect(verifyRes.body.order.inventoryDeducted).toBe(true);

    // 3. Verify database state: Stock should be reduced by 2
    const updatedBase = await Inventory.findById(base._id);
    expect(updatedBase!.availableQuantity).toBe(8);

    const updatedCheese = await Inventory.findById(cheese._id);
    expect(updatedCheese!.availableQuantity).toBe(8);

    // 4. Verify InventoryLog was recorded
    const logs = await InventoryLog.find({ orderId });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].reason).toBe('order_deduction');
    expect(logs[0].changeAmount).toBe(-2);
  });

  it('should reject payment verification if cryptographic signature is forged or invalid', async () => {
    // 1. Create order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        rawItems: [
          {
            type: 'custom',
            baseId: base._id.toString(),
            sauceId: sauce._id.toString(),
            cheeseId: cheese._id.toString(),
            veggieIds: [],
            quantity: 1,
          },
        ],
        deliveryAddress: {
          street: '123 Pizza Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          phone: '9876543210',
        },
      });

    const orderId = orderRes.body.order._id;
    const razorpayOrderId = orderRes.body.razorpay.orderId;

    // 2. Submit forged signature
    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId: 'pay_test_hacker',
        razorpaySignature: 'forged_fake_signature_hash',
      });

    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.success).toBe(false);
    expect(verifyRes.body.message).toContain('verification failed');

    // Ensure inventory was NOT deducted
    const currentBase = await Inventory.findById(base._id);
    expect(currentBase!.availableQuantity).toBe(10);
  });

  it('should handle duplicate payment callbacks idempotently and prevent duplicate inventory deduction', async () => {
    // 1. Create order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        rawItems: [
          {
            type: 'custom',
            baseId: base._id.toString(),
            sauceId: sauce._id.toString(),
            cheeseId: cheese._id.toString(),
            veggieIds: [],
            quantity: 1,
          },
        ],
        deliveryAddress: {
          street: '123 Pizza Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          phone: '9876543210',
        },
      });

    const orderId = orderRes.body.order._id;
    const razorpayOrderId = orderRes.body.razorpay.orderId;
    const razorpayPaymentId = `pay_test_idempotent_${Date.now()}`;
    const validSignature = generateTestSignature(razorpayOrderId, razorpayPaymentId);

    // First callback
    const res1 = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature: validSignature });

    expect(res1.status).toBe(200);

    const stockAfterFirst = (await Inventory.findById(base._id))!.availableQuantity;
    expect(stockAfterFirst).toBe(9); // Deducted 1

    // Duplicate callback with same parameters
    const res2 = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature: validSignature });

    expect(res2.status).toBe(200);
    expect(res2.body.message).toContain('already been verified');

    // Stock MUST still be 9 (not deducted twice!)
    const stockAfterSecond = (await Inventory.findById(base._id))!.availableQuantity;
    expect(stockAfterSecond).toBe(9);
  });

  it('should allow admin to update order status through lifecycle', async () => {
    const order = await Order.create({
      orderNumber: 'OP-TEST-LIFECYCLE',
      user: customerId,
      items: [
        {
          name: 'Classic Margherita',
          type: 'preset',
          base: { id: base._id, name: base.name, category: 'base', price: 0 },
          sauce: { id: sauce._id, name: sauce.name, category: 'sauce', price: 0 },
          cheese: { id: cheese._id, name: cheese.name, category: 'cheese', price: 40 },
          veggies: [],
          quantity: 1,
          unitPrice: 299,
          itemTotalPrice: 299,
        },
      ],
      subtotal: 299,
      tax: 15,
      deliveryFee: 40,
      totalAmount: 354,
      status: 'PLACED',
      statusTimeline: [{ status: 'PLACED', timestamp: new Date() }],
      deliveryAddress: {
        street: '123 Test Ave',
        city: 'Mumbai',
        state: 'MH',
        postalCode: '400001',
        phone: '9876543210',
      },
      paymentStatus: 'paid',
      inventoryDeducted: true,
    });

    // Admin updates status to PREPARING
    const res = await request(app)
      .patch(`/api/orders/admin/status/${order._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'PREPARING',
        note: 'Pizza is being rolled and sauced by chef',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PREPARING');
    expect(res.body.data.statusTimeline).toHaveLength(2);
  });
});
