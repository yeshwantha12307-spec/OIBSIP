import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type InventoryLogReason =
  | 'order_deduction'
  | 'manual_restock'
  | 'spoilage_adjustment'
  | 'initial_seed'
  | 'order_cancellation_restore';

export interface IInventoryLog extends Document {
  inventoryId: Types.ObjectId;
  ingredientName: string;
  changeAmount: number; // negative for deduction, positive for restock
  previousQuantity: number;
  newQuantity: number;
  reason: InventoryLogReason;
  orderId?: Types.ObjectId;
  performedBy: string; // 'SYSTEM' or User ID or Admin email
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryLogSchema = new Schema<IInventoryLog>(
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
    changeAmount: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'order_deduction',
        'manual_restock',
        'spoilage_adjustment',
        'initial_seed',
        'order_cancellation_restore',
      ],
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    performedBy: {
      type: String,
      required: true,
      default: 'SYSTEM',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

inventoryLogSchema.index({ createdAt: -1 });

export const InventoryLog: Model<IInventoryLog> =
  mongoose.models.InventoryLog || mongoose.model<IInventoryLog>('InventoryLog', inventoryLogSchema);
