export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
}

export type IngredientCategory = 'base' | 'sauce' | 'cheese' | 'veggie';
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Ingredient {
  _id: string;
  name: string;
  category: IngredientCategory;
  availableQuantity: number;
  unit: 'pieces' | 'ml' | 'grams';
  lowStockThreshold: number;
  priceModifier: number;
  isAvailable: boolean;
  description: string;
  imageUrl?: string;
  isVegetarian: boolean;
  stockStatus?: StockStatus;
}

export interface Pizza {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  defaultBase: { _id: string; name: string; priceModifier: number };
  defaultSauce: { _id: string; name: string; priceModifier: number };
  defaultCheese: { _id: string; name: string; priceModifier: number };
  defaultVeggies: Array<{ _id: string; name: string; priceModifier: number }>;
  isVegetarian: boolean;
  isAvailable: boolean;
  tags: string[];
}

export interface IngredientSnapshot {
  id: string;
  name: string;
  category: IngredientCategory;
  price: number;
}

export interface OrderItem {
  name: string;
  type: 'preset' | 'custom';
  pizzaId?: string;
  base: IngredientSnapshot;
  sauce: IngredientSnapshot;
  cheese: IngredientSnapshot;
  veggies: IngredientSnapshot[];
  quantity: number;
  unitPrice: number;
  itemTotalPrice: number;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'PREPARING'
  | 'BAKING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface StatusTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  instructions?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: { _id: string; name: string; email: string };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  statusTimeline: StatusTimeline[];
  deliveryAddress: DeliveryAddress;
  paymentStatus: 'unpaid' | 'paid' | 'failed';
  razorpayOrderId?: string;
  inventoryDeducted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  cartItemId: string; // unique ID in cart
  type: 'preset' | 'custom';
  pizzaId?: string;
  name: string;
  base: { id: string; name: string; price: number };
  sauce: { id: string; name: string; price: number };
  cheese: { id: string; name: string; price: number };
  veggies: Array<{ id: string; name: string; price: number }>;
  unitPrice: number;
  quantity: number;
}

export interface InventoryLog {
  _id: string;
  inventoryId: { _id: string; name: string; category: string; unit: string } | null;
  ingredientName: string;
  changeAmount: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  orderId?: string;
  performedBy: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryAlert {
  _id: string;
  inventoryId: string;
  ingredientName: string;
  category: string;
  currentQuantity: number;
  lowStockThreshold: number;
  unit: string;
  sentToEmail: string;
  status: 'sent' | 'failed';
  resolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}
