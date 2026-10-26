import mongoose, { Document, Model, Schema } from 'mongoose';

export type IngredientCategory = 'base' | 'sauce' | 'cheese' | 'veggie';
export type UnitType = 'pieces' | 'ml' | 'grams';

export interface IInventory extends Document {
  name: string;
  category: IngredientCategory;
  availableQuantity: number;
  unit: UnitType;
  lowStockThreshold: number;
  priceModifier: number; // In INR, added to custom pizza base price
  isAvailable: boolean;
  description: string;
  imageUrl?: string;
  isVegetarian: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['base', 'sauce', 'cheese', 'veggie'],
      index: true,
    },
    availableQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: true,
      enum: ['pieces', 'ml', 'grams'],
      default: 'pieces',
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      default: 20,
      min: [0, 'Threshold cannot be negative'],
    },
    priceModifier: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isVegetarian: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ category: 1, isAvailable: 1 });

export const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', inventorySchema);
