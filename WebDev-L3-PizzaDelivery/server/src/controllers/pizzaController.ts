import { Request, Response } from 'express';
import { Pizza } from '../models/Pizza.js';

export const getAllPizzas = async (req: Request, res: Response): Promise<void> => {
  const pizzas = await Pizza.find({ isAvailable: true })
    .populate('defaultBase', 'name priceModifier')
    .populate('defaultSauce', 'name priceModifier')
    .populate('defaultCheese', 'name priceModifier')
    .populate('defaultVeggies', 'name priceModifier');

  res.status(200).json({
    success: true,
    count: pizzas.length,
    data: pizzas,
  });
};

export const getPizzaById = async (req: Request, res: Response): Promise<void> => {
  const pizza = await Pizza.findById(req.params.id)
    .populate('defaultBase')
    .populate('defaultSauce')
    .populate('defaultCheese')
    .populate('defaultVeggies');

  if (!pizza) {
    res.status(404).json({ success: false, message: 'Pizza not found' });
    return;
  }

  res.status(200).json({
    success: true,
    data: pizza,
  });
};

export const createPizza = async (req: Request, res: Response): Promise<void> => {
  const pizza = await Pizza.create(req.body);
  res.status(201).json({
    success: true,
    message: 'New pizza added to menu',
    data: pizza,
  });
};

export const updatePizza = async (req: Request, res: Response): Promise<void> => {
  const pizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!pizza) {
    res.status(404).json({ success: false, message: 'Pizza not found' });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Pizza updated successfully',
    data: pizza,
  });
};
