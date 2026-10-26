import { Router } from 'express';
import { z } from 'zod';
import { getBuilderIngredients, previewCustomPizzaPrice } from '../controllers/builderController.js';
import { validateRequest } from '../middlewares/validationMiddleware.js';

const router = Router();

const previewPriceSchema = z.object({
  body: z.object({
    baseId: z.string().min(1, 'Base ID is required'),
    sauceId: z.string().min(1, 'Sauce ID is required'),
    cheeseId: z.string().min(1, 'Cheese ID is required'),
    veggieIds: z.array(z.string()).optional(),
  }),
});

router.get('/ingredients', getBuilderIngredients);
router.post('/preview-price', validateRequest(previewPriceSchema), previewCustomPizzaPrice);

export default router;
