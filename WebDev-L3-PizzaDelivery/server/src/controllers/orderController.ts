import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, IOrder, IOrderItem, OrderStatus } from '../models/Order.js';
import { Pizza } from '../models/Pizza.js';
import { Inventory } from '../models/Inventory.js';
import { Payment } from '../models/Payment.js';
import { checkStockAvailability, deductInventoryForOrder } from '../services/inventoryService.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { env } from '../config/env.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { BASE_CUSTOM_PIZZA_PRICE } from './builderController.js';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const { rawItems, deliveryAddress, notes } = req.body;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    res.status(400).json({ success: false, message: 'Order must contain at least one pizza' });
    return;
  }

  // 1. Resolve and validate all ingredients & pizzas from DB
  const resolvedItems: IOrderItem[] = [];
  let subtotal = 0;

  for (const raw of rawItems) {
    const qty = Math.max(1, parseInt(raw.quantity, 10) || 1);

    if (raw.type === 'preset' && raw.pizzaId) {
      const pizza = await Pizza.findById(raw.pizzaId)
        .populate('defaultBase')
        .populate('defaultSauce')
        .populate('defaultCheese')
        .populate('defaultVeggies');

      if (!pizza || !pizza.isAvailable) {
        res.status(400).json({ success: false, message: `Menu pizza "${raw.name || 'Selected'}" is unavailable` });
        return;
      }

      const baseItem = pizza.defaultBase as any;
      const sauceItem = pizza.defaultSauce as any;
      const cheeseItem = pizza.defaultCheese as any;
      const veggieItems = (pizza.defaultVeggies || []) as any[];

      const unitPrice = pizza.basePrice;
      const itemTotalPrice = unitPrice * qty;
      subtotal += itemTotalPrice;

      resolvedItems.push({
        name: pizza.name,
        type: 'preset',
        pizzaId: pizza._id,
        base: {
          id: baseItem._id,
          name: baseItem.name,
          category: 'base',
          price: baseItem.priceModifier || 0,
        },
        sauce: {
          id: sauceItem._id,
          name: sauceItem.name,
          category: 'sauce',
          price: sauceItem.priceModifier || 0,
        },
        cheese: {
          id: cheeseItem._id,
          name: cheeseItem.name,
          category: 'cheese',
          price: cheeseItem.priceModifier || 0,
        },
        veggies: veggieItems.map((v) => ({
          id: v._id,
          name: v.name,
          category: 'veggie',
          price: v.priceModifier || 0,
        })),
        quantity: qty,
        unitPrice,
        itemTotalPrice,
      });
    } else {
      // Custom pizza builder item
      const ingredientIds = [raw.baseId, raw.sauceId, raw.cheeseId, ...(raw.veggieIds || [])].filter(Boolean);
      const inventoryDocs = await Inventory.find({ _id: { $in: ingredientIds } });
      const invMap = new Map(inventoryDocs.map((i) => [i._id.toString(), i]));

      const baseDoc = invMap.get(raw.baseId);
      const sauceDoc = invMap.get(raw.sauceId);
      const cheeseDoc = invMap.get(raw.cheeseId);

      if (!baseDoc || baseDoc.category !== 'base') {
        res.status(400).json({ success: false, message: 'Invalid crust base selection' });
        return;
      }
      if (!sauceDoc || sauceDoc.category !== 'sauce') {
        res.status(400).json({ success: false, message: 'Invalid sauce selection' });
        return;
      }
      if (!cheeseDoc || cheeseDoc.category !== 'cheese') {
        res.status(400).json({ success: false, message: 'Invalid cheese selection' });
        return;
      }

      const veggieDocs: any[] = [];
      if (Array.isArray(raw.veggieIds)) {
        for (const vid of raw.veggieIds) {
          const v = invMap.get(vid);
          if (v && v.category === 'veggie') {
            veggieDocs.push(v);
          }
        }
      }

      const unitPrice =
        BASE_CUSTOM_PIZZA_PRICE +
        (baseDoc.priceModifier || 0) +
        (sauceDoc.priceModifier || 0) +
        (cheeseDoc.priceModifier || 0) +
        veggieDocs.reduce((acc, v) => acc + (v.priceModifier || 0), 0);

      const itemTotalPrice = unitPrice * qty;
      subtotal += itemTotalPrice;

      resolvedItems.push({
        name: raw.name || 'Custom Artisan Pizza',
        type: 'custom',
        base: {
          id: baseDoc._id,
          name: baseDoc.name,
          category: 'base',
          price: baseDoc.priceModifier || 0,
        },
        sauce: {
          id: sauceDoc._id,
          name: sauceDoc.name,
          category: 'sauce',
          price: sauceDoc.priceModifier || 0,
        },
        cheese: {
          id: cheeseDoc._id,
          name: cheeseDoc.name,
          category: 'cheese',
          price: cheeseDoc.priceModifier || 0,
        },
        veggies: veggieDocs.map((v) => ({
          id: v._id,
          name: v.name,
          category: 'veggie',
          price: v.priceModifier || 0,
        })),
        quantity: qty,
        unitPrice,
        itemTotalPrice,
      });
    }
  }

  // 2. Authoritative check for current stock availability
  const stockCheck = await checkStockAvailability(resolvedItems);
  if (!stockCheck.available) {
    const details = stockCheck.insufficient
      .map((i) => `${i.name} (only ${i.available} left, needed ${i.required})`)
      .join(', ');
    res.status(400).json({
      success: false,
      message: `Some ingredients are currently out of stock: ${details}`,
      insufficient: stockCheck.insufficient,
    });
    return;
  }

  // 3. Calculate taxes and delivery fee
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
  const deliveryFee = subtotal >= 500 ? 0 : 40; // Free delivery over ₹500
  const totalAmount = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  // 4. Create unique order number
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderNumber = `OP-${timestampPart}-${randomPart}`;

  // 5. Create Razorpay Test Order
  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder(totalAmount, orderNumber, {
      userId: userId.toString(),
      orderNumber,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: `Failed to initialize Razorpay payment order: ${(error as Error).message}`,
    });
    return;
  }

  // 6. Save Order record in database
  const order = await Order.create({
    orderNumber,
    user: userId,
    items: resolvedItems,
    subtotal,
    tax,
    deliveryFee,
    totalAmount,
    currency: 'INR',
    status: 'PENDING_PAYMENT',
    statusTimeline: [
      {
        status: 'PENDING_PAYMENT',
        timestamp: new Date(),
        note: 'Order created, awaiting Razorpay payment authorization',
      },
    ],
    deliveryAddress,
    razorpayOrderId: razorpayOrder.id,
    paymentStatus: 'unpaid',
    inventoryDeducted: false,
    notes,
  });

  // 7. Save Payment record
  await Payment.create({
    orderId: order._id,
    userId,
    razorpayOrderId: razorpayOrder.id,
    amount: totalAmount,
    currency: 'INR',
    status: 'created',
    metadata: {
      orderNumber,
      clientReceipt: razorpayOrder.receipt,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully. Proceed to payment.',
    order,
    razorpay: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: env.RAZORPAY_KEY_ID, // Only public key provided to frontend!
      customerName: req.user!.name,
      customerEmail: req.user!.email,
      customerPhone: deliveryAddress.phone,
    },
  });
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await Order.find({ user: req.user!._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // Allow lookup by Mongo _id OR orderNumber
  const query = mongoose.isValidObjectId(id)
    ? { _id: id }
    : { orderNumber: id };

  const order = await Order.findOne(query).populate('user', 'name email');

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  // Verify authorization: only the order owner or admin can view
  if (req.user!.role !== 'admin' && order.user._id.toString() !== req.user!._id.toString()) {
    res.status(403).json({ success: false, message: 'Unauthorized to view this order' });
    return;
  }

  res.status(200).json({
    success: true,
    data: order,
  });
};

// Admin: Get all orders with filtering and pagination
export const getAllOrdersAdmin = async (req: Request, res: Response): Promise<void> => {
  const { status, search } = req.query;

  const query: any = {};
  if (status && status !== 'ALL') {
    query.status = status;
  }
  if (search) {
    query.orderNumber = { $regex: search, $options: 'i' };
  }

  const orders = await Order.find(query).sort({ createdAt: -1 }).populate('user', 'name email');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
};

// Admin: Update order status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, note } = req.body;

  const validStatuses: OrderStatus[] = [
    'PENDING_PAYMENT',
    'PLACED',
    'PREPARING',
    'BAKING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid order status transition' });
    return;
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  order.status = status;
  order.statusTimeline.push({
    status,
    timestamp: new Date(),
    note: note || `Status updated to ${status} by administrator`,
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order,
  });
};
