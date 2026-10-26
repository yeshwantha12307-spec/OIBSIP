import { Router } from 'express';
import { getAllPizzas, getPizzaById, createPizza, updatePizza } from '../controllers/pizzaController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', getAllPizzas);
router.get('/:id', getPizzaById);

// Admin-only endpoints
router.post('/', authenticate, requireAdmin, createPizza);
router.put('/:id', authenticate, requireAdmin, updatePizza);

export default router;
