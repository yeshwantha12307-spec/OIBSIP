import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IInventoryAlert extends Document {
  inventoryId: Types.ObjectId;
  ingredientName: string;
  category: string;
  currentQuantity: number;
  lowStockThreshold: number;
  unit: string;
  sentToEmail: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryAlertSchema = new Schema<IInventoryAlert>(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true,
    },
    ingredientName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    currentQuantity: {
      type: Number,
      required: true,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    sentToEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent',
      index: true,
    },
    errorMessage: {
      type: String,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

inventoryAlertSchema.index({ inventoryId: 1, resolved: 1 });
inventoryAlertSchema.index({ createdAt: -1 });

export const InventoryAlert: Model<IInventoryAlert> =
  mongoose.models.InventoryAlert ||
  mongoose.model<IInventoryAlert>('InventoryAlert', inventoryAlertSchema);
