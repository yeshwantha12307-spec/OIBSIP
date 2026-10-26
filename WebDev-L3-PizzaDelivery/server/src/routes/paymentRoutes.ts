import { Router } from 'express';
import { z } from 'zod';
import { verifyPayment, handlePaymentFailure } from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';

const router = Router();

const verifyPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().optional(),
    razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
    razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
    razorpaySignature: z.string().min(1, 'Razorpay Signature is required'),
  }),
});

router.post('/verify', authenticate, validateRequest(verifyPaymentSchema), verifyPayment);
router.post('/failed', authenticate, handlePaymentFailure);

export default router;
