import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IPizza extends Document {
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  defaultBase: Types.ObjectId;
  defaultSauce: Types.ObjectId;
  defaultCheese: Types.ObjectId;
  defaultVeggies: Types.ObjectId[];
  isVegetarian: boolean;
  isAvailable: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const pizzaSchema = new Schema<IPizza>(
  {
    name: {
      type: String,
      required: [true, 'Pizza name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'Base price must be positive'],
    },
    defaultBase: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
    },
    defaultSauce: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
    },
    defaultCheese: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
    },
    defaultVeggies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Inventory',
      },
    ],
    isVegetarian: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

pizzaSchema.index({ isAvailable: 1, isVegetarian: 1 });

export const Pizza: Model<IPizza> = mongoose.models.Pizza || mongoose.model<IPizza>('Pizza', pizzaSchema);
