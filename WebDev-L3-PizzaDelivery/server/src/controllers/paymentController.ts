import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { verifyRazorpaySignature } from '../services/razorpayService.js';
import { deductInventoryForOrder } from '../services/inventoryService.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400).json({
      success: false,
      message: 'Payment verification parameters missing (order ID, payment ID, or signature)',
    });
    return;
  }

  // 1. Locate the Order in the database
  const order = await Order.findOne({
    $or: [{ _id: orderId }, { razorpayOrderId }],
  }).populate('user', 'name email');

  if (!order) {
    res.status(404).json({
      success: false,
      message: 'Corresponding order not found',
    });
    return;
  }

  // 2. Prevent duplicate order fulfillment and duplicate inventory deduction
  if (order.paymentStatus === 'paid' && order.inventoryDeducted) {
    console.log(`[Payment] Idempotent callback: Order ${order.orderNumber} already marked as paid.`);
    res.status(200).json({
      success: true,
      message: 'Payment has already been verified and processed',
      order,
    });
    return;
  }

  // 3. Find or create payment record
  let payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) {
    payment = new Payment({
      orderId: order._id,
      userId: req.user!._id,
      razorpayOrderId,
      amount: order.totalAmount,
      currency: order.currency,
      status: 'created',
    });
  }

  // 4. Verify cryptographic signature HMAC SHA-256
  const isValidSignature = verifyRazorpaySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isValidSignature) {
    payment.status = 'failed';
    payment.errorDescription = 'Signature verification failed';
    await payment.save();

    order.paymentStatus = 'failed';
    order.statusTimeline.push({
      status: order.status,
      timestamp: new Date(),
      note: 'Payment signature verification failed',
    });
    await order.save();

    res.status(400).json({
      success: false,
      message: 'Cryptographic signature verification failed. Payment cannot be verified.',
    });
    return;
  }

  // 5. Update Payment record to captured/verified
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = 'captured';
  payment.verifiedAt = new Date();
  await payment.save();

  // 6. Deduct inventory safely and atomically
  const deductionResult = await deductInventoryForOrder(order);

  if (!deductionResult.success) {
    // Inventory deduction failed (e.g. stock exhausted between order creation and payment)
    console.error(`[Fulfillment Warning] Stock deduction failed for paid order ${order.orderNumber}: ${deductionResult.error}`);
    order.paymentStatus = 'paid';
    order.paymentId = payment._id;
    order.status = 'PLACED';
    order.statusTimeline.push({
      status: 'PLACED',
      timestamp: new Date(),
      note: `Payment verified. Inventory fulfillment alert: ${deductionResult.error}`,
    });
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified, but stock level requires manual fulfillment.',
      order,
      payment,
    });
    return;
  }

  // 7. Update Order status to PLACED
  order.paymentStatus = 'paid';
  order.paymentId = payment._id;
  order.status = 'PLACED';
  order.statusTimeline.push({
    status: 'PLACED',
    timestamp: new Date(),
    note: `Payment of ₹${order.totalAmount} verified successfully via Razorpay (Payment ID: ${razorpayPaymentId})`,
  });
  await order.save();

  // 8. Asynchronously send order confirmation email
  const userEmail = (order.user as any)?.email || req.user!.email;
  sendOrderConfirmationEmail(userEmail, order.orderNumber, order.totalAmount, order.items.length).catch((err) =>
    console.error('Failed to send order confirmation email:', err)
  );

  res.status(200).json({
    success: true,
    message: 'Payment successfully verified and order confirmed!',
    order,
    payment,
  });
};

export const handlePaymentFailure = async (req: AuthRequest, res: Response): Promise<void> => {
  const { razorpayOrderId, error } = req.body;

  if (razorpayOrderId) {
    const payment = await Payment.findOne({ razorpayOrderId });
    if (payment && payment.status !== 'captured') {
      payment.status = 'failed';
      payment.errorDescription = typeof error === 'string' ? error : JSON.stringify(error);
      await payment.save();
    }

    const order = await Order.findOne({ razorpayOrderId });
    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'failed';
      order.statusTimeline.push({
        status: order.status,
        timestamp: new Date(),
        note: `Payment cancelled or failed: ${payment?.errorDescription || 'User cancelled checkout'}`,
      });
      await order.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Payment failure recorded',
  });
};
