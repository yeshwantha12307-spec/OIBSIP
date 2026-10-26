import { Request, Response } from 'express';
import { Inventory } from '../models/Inventory.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { InventoryAlert } from '../models/InventoryAlert.js';
import { adjustInventoryStock } from '../services/inventoryService.js';
import { checkAndAlertLowStock } from '../services/cronService.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export const getInventoryItems = async (req: Request, res: Response): Promise<void> => {
  const { category, search, lowStockOnly } = req.query;

  const query: any = {};
  if (category) {
    query.category = category;
  }
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  if (lowStockOnly === 'true') {
    query.$expr = { $lte: ['$availableQuantity', '$lowStockThreshold'] };
  }

  const items = await Inventory.find(query).sort({ category: 1, name: 1 });

  // Map each item with computed stock status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK'
  const itemsWithStatus = items.map((item) => {
    let stockStatus: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK' = 'IN_STOCK';
    if (item.availableQuantity === 0) {
      stockStatus = 'OUT_OF_STOCK';
    } else if (item.availableQuantity <= item.lowStockThreshold) {
      stockStatus = 'LOW_STOCK';
    }

    return {
      ...item.toObject(),
      stockStatus,
    };
  });

  res.status(200).json({
    success: true,
    count: itemsWithStatus.length,
    data: itemsWithStatus,
  });
};

export const adjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { newQuantity, reason, notes } = req.body;

  const performedBy = req.user?.email || 'admin@oasispizza.com';

  try {
    const result = await adjustInventoryStock(
      id,
      Number(newQuantity),
      reason || 'manual_restock',
      performedBy,
      notes
    );

    // Also trigger cron check to auto-resolve alerts if stock now exceeds threshold
    checkAndAlertLowStock().catch((err) => console.error('Low stock check failed after adjustment:', err));

    res.status(200).json({
      success: true,
      message: `Stock updated for ${result.item.name} to ${result.item.availableQuantity} ${result.item.unit}`,
      data: result.item,
      log: result.log,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const createInventoryItem = async (req: Request, res: Response): Promise<void> => {
  const item = await Inventory.create(req.body);
  await InventoryLog.create({
    inventoryId: item._id,
    ingredientName: item.name,
    changeAmount: item.availableQuantity,
    previousQuantity: 0,
    newQuantity: item.availableQuantity,
    reason: 'initial_seed',
    performedBy: 'admin',
    notes: 'Ingredient added to inventory',
  });

  res.status(201).json({
    success: true,
    message: 'Ingredient created successfully',
    data: item,
  });
};

export const updateInventoryItem = async (req: Request, res: Response): Promise<void> => {
  const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    res.status(404).json({ success: false, message: 'Ingredient not found' });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Ingredient settings updated',
    data: item,
  });
};

export const getInventoryLogs = async (req: Request, res: Response): Promise<void> => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const logs = await InventoryLog.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('inventoryId', 'name category unit');

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
};

export const getInventoryAlerts = async (req: Request, res: Response): Promise<void> => {
  const alerts = await InventoryAlert.find({}).sort({ createdAt: -1 }).limit(100);

  res.status(200).json({
    success: true,
    count: alerts.length,
    data: alerts,
  });
};

export const triggerManualStockCheck = async (req: Request, res: Response): Promise<void> => {
  const result = await checkAndAlertLowStock();
  res.status(200).json({
    success: true,
    message: `Manual inventory audit completed. ${result.newAlertsSent} new alerts sent, ${result.resolvedCount} alerts resolved.`,
    data: result,
  });
};
