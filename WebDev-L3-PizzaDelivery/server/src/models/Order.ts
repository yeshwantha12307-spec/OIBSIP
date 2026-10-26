import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'PREPARING'
  | 'BAKING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface IIngredientSnapshot {
  id: Types.ObjectId;
  name: string;
  category: 'base' | 'sauce' | 'cheese' | 'veggie';
  price: number;
}

export interface IOrderItem {
  name: string;
  type: 'preset' | 'custom';
  pizzaId?: Types.ObjectId;
  base: IIngredientSnapshot;
  sauce: IIngredientSnapshot;
  cheese: IIngredientSnapshot;
  veggies: IIngredientSnapshot[];
  quantity: number;
  unitPrice: number;
  itemTotalPrice: number;
}

export interface IStatusTimeline {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface IDeliveryAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  instructions?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  statusTimeline: IStatusTimeline[];
  deliveryAddress: IDeliveryAddress;
  paymentId?: Types.ObjectId;
  razorpayOrderId?: string;
  paymentStatus: 'unpaid' | 'paid' | 'failed';
  inventoryDeducted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSnapshotSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true, enum: ['base', 'sauce', 'cheese', 'veggie'] },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['preset', 'custom'] },
    pizzaId: { type: Schema.Types.ObjectId, ref: 'Pizza' },
    base: { type: ingredientSnapshotSchema, required: true },
    sauce: { type: ingredientSnapshotSchema, required: true },
    cheese: { type: ingredientSnapshotSchema, required: true },
    veggies: [ingredientSnapshotSchema],
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    itemTotalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const statusTimelineSchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['PENDING_PAYMENT', 'PLACED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const deliveryAddressSchema = new Schema(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    instructions: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(val: IOrderItem[]) => val.length > 0, 'Order must contain at least one pizza'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'PLACED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    statusTimeline: {
      type: [statusTimelineSchema],
      default: [],
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed'],
      default: 'unpaid',
      index: true,
    },
    inventoryDeducted: {
      type: Boolean,
      default: false,
      index: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
