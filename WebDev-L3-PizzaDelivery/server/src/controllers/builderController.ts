import { Request, Response } from 'express';
import { Inventory, IInventory } from '../models/Inventory.js';

export const BASE_CUSTOM_PIZZA_PRICE = 199; // Standard base preparation price in INR

export interface ICalculatePricePayload {
  baseId: string;
  sauceId: string;
  cheeseId: string;
  veggieIds: string[];
}

/**
 * Calculates official server-side price and validates item availability
 */
export const calculateCustomPizzaPricing = async (
  payload: ICalculatePricePayload
): Promise<{
  unitPrice: number;
  breakdown: {
    basePrice: number;
    base: { id: string; name: string; price: number; inStock: boolean };
    sauce: { id: string; name: string; price: number; inStock: boolean };
    cheese: { id: string; name: string; price: number; inStock: boolean };
    veggies: Array<{ id: string; name: string; price: number; inStock: boolean }>;
  };
  allAvailable: boolean;
}> => {
  const allIds = [payload.baseId, payload.sauceId, payload.cheeseId, ...(payload.veggieIds || [])].filter(Boolean);

  const inventoryItems = await Inventory.find({ _id: { $in: allIds } });
  const itemMap = new Map<string, IInventory>(inventoryItems.map((i) => [i._id.toString(), i]));

  const base = itemMap.get(payload.baseId);
  const sauce = itemMap.get(payload.sauceId);
  const cheese = itemMap.get(payload.cheeseId);

  if (!base || base.category !== 'base') {
    throw new Error('Invalid or missing pizza crust base selection');
  }
  if (!sauce || sauce.category !== 'sauce') {
    throw new Error('Invalid or missing sauce selection');
  }
  if (!cheese || cheese.category !== 'cheese') {
    throw new Error('Invalid or missing cheese selection');
  }

  const veggies: IInventory[] = [];
  if (Array.isArray(payload.veggieIds)) {
    for (const vId of payload.veggieIds) {
      const v = itemMap.get(vId);
      if (v && v.category === 'veggie') {
        veggies.push(v);
      }
    }
  }

  const basePriceMod = base.priceModifier || 0;
  const saucePriceMod = sauce.priceModifier || 0;
  const cheesePriceMod = cheese.priceModifier || 0;
  const veggiesPriceMod = veggies.reduce((acc, v) => acc + (v.priceModifier || 0), 0);

  const unitPrice = BASE_CUSTOM_PIZZA_PRICE + basePriceMod + saucePriceMod + cheesePriceMod + veggiesPriceMod;

  const baseInStock = base.isAvailable && base.availableQuantity > 0;
  const sauceInStock = sauce.isAvailable && sauce.availableQuantity > 0;
  const cheeseInStock = cheese.isAvailable && cheese.availableQuantity > 0;
  const veggiesInStock = veggies.every((v) => v.isAvailable && v.availableQuantity > 0);

  const allAvailable = baseInStock && sauceInStock && cheeseInStock && veggiesInStock;

  return {
    unitPrice,
    breakdown: {
      basePrice: BASE_CUSTOM_PIZZA_PRICE,
      base: { id: base._id.toString(), name: base.name, price: basePriceMod, inStock: baseInStock },
      sauce: { id: sauce._id.toString(), name: sauce.name, price: saucePriceMod, inStock: sauceInStock },
      cheese: { id: cheese._id.toString(), name: cheese.name, price: cheesePriceMod, inStock: cheeseInStock },
      veggies: veggies.map((v) => ({
        id: v._id.toString(),
        name: v.name,
        price: v.priceModifier || 0,
        inStock: v.isAvailable && v.availableQuantity > 0,
      })),
    },
    allAvailable,
  };
};

/**
 * Returns all custom pizza builder ingredients grouped by category with live stock status
 */
export const getBuilderIngredients = async (req: Request, res: Response): Promise<void> => {
  const items = await Inventory.find({}).sort({ category: 1, name: 1 });

  const categorized = {
    bases: items.filter((i) => i.category === 'base'),
    sauces: items.filter((i) => i.category === 'sauce'),
    cheeses: items.filter((i) => i.category === 'cheese'),
    veggies: items.filter((i) => i.category === 'veggie'),
    baseStartingPrice: BASE_CUSTOM_PIZZA_PRICE,
  };

  res.status(200).json({
    success: true,
    data: categorized,
  });
};

/**
 * Endpoint for client to preview server-verified price breakdown
 */
export const previewCustomPizzaPrice = async (req: Request, res: Response): Promise<void> => {
  const { baseId, sauceId, cheeseId, veggieIds } = req.body;

  try {
    const result = await calculateCustomPizzaPricing({
      baseId,
      sauceId,
      cheeseId,
      veggieIds: veggieIds || [],
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
