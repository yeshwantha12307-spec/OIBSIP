import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env.js';

let razorpayInstance: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

export interface IRazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number | string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes?: Record<string, any>;
  created_at: number;
}

/**
 * Creates a Razorpay Order in paise (1 INR = 100 paise)
 */
export const createRazorpayOrder = async (
  amountInInr: number,
  receipt: string,
  notes: Record<string, any> = {}
): Promise<IRazorpayOrderResponse> => {
  const amountInPaise = Math.round(amountInInr * 100);

  // If running with placeholder keys in development/tests and Razorpay fails to connect,
  // we provide a fallback test order object so developers can test the full flow without real keys!
  try {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes,
    });
    return order as IRazorpayOrderResponse;
  } catch (error) {
    if (
      env.NODE_ENV !== 'production' &&
      (env.RAZORPAY_KEY_ID.includes('placeholder') || (error as Error).message.includes('Authentication failed'))
    ) {
      console.warn(
        `[Razorpay Dev Mode] Real API authentication unavailable with placeholder keys. Generating mock test order ID for offline development.`
      );
      const mockOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        id: mockOrderId,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt,
        status: 'created',
        attempts: 0,
        notes,
        created_at: Math.floor(Date.now() / 1000),
      };
    }
    throw error;
  }
};

/**
 * Verifies Razorpay HMAC-SHA256 signature
 */
export const verifyRazorpaySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  // Developer mock bypass ONLY when specifically marked and placeholder key is in use
  if (
    env.NODE_ENV !== 'production' &&
    env.RAZORPAY_KEY_SECRET.includes('placeholder') &&
    razorpayOrderId.startsWith('order_test_') &&
    razorpaySignature.startsWith('mock_sig_')
  ) {
    return true;
  }

  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  // Constant-time string comparison to prevent timing attacks
  try {
    const a = Buffer.from(expectedSignature, 'utf8');
    const b = Buffer.from(razorpaySignature, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

/**
 * Helper to generate valid mock signature for integration tests
 */
export const generateTestSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  secret: string = env.RAZORPAY_KEY_SECRET
): string => {
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};
