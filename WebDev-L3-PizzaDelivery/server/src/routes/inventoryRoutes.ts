import { Router } from 'express';
import { z } from 'zod';
import {
  getInventoryItems,
  adjustStock,
  createInventoryItem,
  updateInventoryItem,
  getInventoryLogs,
  getInventoryAlerts,
  triggerManualStockCheck,
} from '../controllers/inventoryController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';

const router = Router();

const adjustStockSchema = z.object({
  body: z.object({
    newQuantity: z.number().min(0, 'Quantity cannot be negative'),
    reason: z.enum([
      'order_deduction',
      'manual_restock',
      'spoilage_adjustment',
      'initial_seed',
      'order_cancellation_restore',
    ]),
    notes: z.string().optional(),
  }),
});

// Admin-only endpoints for inventory management
router.use(authenticate, requireAdmin);

router.get('/', getInventoryItems);
router.post('/adjust/:id', validateRequest(adjustStockSchema), adjustStock);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.get('/logs', getInventoryLogs);
router.get('/alerts', getInventoryAlerts);
router.post('/check-alerts', triggerManualStockCheck);

export default router;
