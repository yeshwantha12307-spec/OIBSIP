import { Router } from 'express';
import { z } from 'zod';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';

const router = Router();

const createOrderSchema = z.object({
  body: z.object({
    rawItems: z.array(z.any()).min(1, 'At least one item is required in the order'),
    deliveryAddress: z.object({
      street: z.string().min(2, 'Street address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      postalCode: z.string().min(3, 'Postal code is required'),
      phone: z.string().min(7, 'Contact phone number is required'),
      instructions: z.string().optional(),
    }),
    notes: z.string().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'PENDING_PAYMENT',
      'PLACED',
      'PREPARING',
      'BAKING',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ]),
    note: z.string().optional(),
  }),
});

// Customer protected routes
router.post('/', authenticate, validateRequest(createOrderSchema), createOrder);
router.get('/my', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, getAllOrdersAdmin);
router.patch('/admin/status/:id', authenticate, requireAdmin, validateRequest(updateStatusSchema), updateOrderStatus);

export default router;
