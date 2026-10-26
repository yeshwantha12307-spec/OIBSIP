# Oasis Pizza — Database Schema Specification

The database utilizes **MongoDB** managed through **Mongoose** object data modeling (ODM) with strict schema types, validators, sub-document snapshots, and performance indexes.

---

## 1. Entity Relationship Overview

```
   +-------------+       1:N       +-------------------+
   |    User     | <-------------> |       Order       |
   +-------------+                 +-------------------+
          |                                  |
          | 1:N                              | 1:1
          v                                  v
   +-------------+                 +-------------------+
   |   Payment   | <-------------- |      Payment      |
   +-------------+                 +-------------------+
                                             |
                                             v 1:N
   +-------------+       1:N       +-------------------+
   |  Inventory  | <-------------> |   InventoryLog    |
   +-------------+                 +-------------------+
          |
          | 1:N
          v
   +-------------+
   |InventoryAlert|
   +-------------+
```

---

## 2. Models Specification

### 1. User (`models/User.ts`)
- `name`: String (2–60 chars, required, trim)
- `email`: String (required, unique, lowercase, indexed, email regex)
- `passwordHash`: String (bcrypt hash, rounds: 12)
- `role`: String enum (`'customer' | 'admin'`, default: `'customer'`, indexed)
- `isVerified`: Boolean (default: `false`)
- `verificationToken`: String (nullable, indexed)
- `verificationTokenExpiresAt`: Date
- `resetPasswordToken`: String (nullable, indexed)
- `resetPasswordExpiresAt`: Date
- Timestamps: `createdAt`, `updatedAt`

### 2. Inventory (`models/Inventory.ts`)
- `name`: String (required, unique, trim)
- `category`: String enum (`'base' | 'sauce' | 'cheese' | 'veggie'`, indexed)
- `availableQuantity`: Number (min: 0, default: 0)
- `unit`: String enum (`'pieces' | 'ml' | 'grams'`)
- `lowStockThreshold`: Number (min: 0, default: 20)
- `priceModifier`: Number (min: 0, INR, default: 0)
- `isAvailable`: Boolean (default: `true`)
- `description`: String
- `isVegetarian`: Boolean (default: `true`)
- Index: `{ category: 1, isAvailable: 1 }`
- Timestamps: `createdAt`, `updatedAt`

### 3. Pizza (`models/Pizza.ts`)
- `name`: String (required, unique, trim)
- `description`: String (required)
- `imageUrl`: String (required)
- `basePrice`: Number (min: 0, required)
- `defaultBase`: ObjectId (ref: `Inventory`, required)
- `defaultSauce`: ObjectId (ref: `Inventory`, required)
- `defaultCheese`: ObjectId (ref: `Inventory`, required)
- `defaultVeggies`: [ObjectId] (ref: `Inventory`)
- `isVegetarian`: Boolean (default: `true`)
- `isAvailable`: Boolean (default: `true`)
- `tags`: [String]
- Index: `{ isAvailable: 1, isVegetarian: 1 }`
- Timestamps: `createdAt`, `updatedAt`

### 4. Order (`models/Order.ts`)
- `orderNumber`: String (required, unique, indexed, e.g. `OP-523768-B4Z9`)
- `user`: ObjectId (ref: `User`, required, indexed)
- `items`: [OrderItemSubdocument]
  - `name`: String
  - `type`: String enum (`'preset' | 'custom'`)
  - `pizzaId`: ObjectId (ref: `Pizza`, optional)
  - `base`: `{ id: ObjectId, name: String, category: 'base', price: Number }`
  - `sauce`: `{ id: ObjectId, name: String, category: 'sauce', price: Number }`
  - `cheese`: `{ id: ObjectId, name: String, category: 'cheese', price: Number }`
  - `veggies`: `[{ id: ObjectId, name: String, category: 'veggie', price: Number }]`
  - `quantity`: Number (min: 1)
  - `unitPrice`: Number (min: 0)
  - `itemTotalPrice`: Number (min: 0)
- `subtotal`: Number
- `tax`: Number (5% GST)
- `deliveryFee`: Number (0 if subtotal >= 500, else 40)
- `totalAmount`: Number
- `currency`: String (default: `'INR'`)
- `status`: String enum (`'PENDING_PAYMENT' | 'PLACED' | 'PREPARING' | 'BAKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'`, indexed)
- `statusTimeline`: `[{ status: String, timestamp: Date, note: String }]`
- `deliveryAddress`: `{ street, city, state, postalCode, phone, instructions }`
- `paymentId`: ObjectId (ref: `Payment`)
- `razorpayOrderId`: String (indexed)
- `paymentStatus`: String enum (`'unpaid' | 'paid' | 'failed'`, indexed)
- `inventoryDeducted`: Boolean (default: `false`, indexed — guarantees idempotency)
- Index: `{ createdAt: -1 }`
- Timestamps: `createdAt`, `updatedAt`

### 5. Payment (`models/Payment.ts`)
- `orderId`: ObjectId (ref: `Order`, required, indexed)
- `userId`: ObjectId (ref: `User`, required, indexed)
- `razorpayOrderId`: String (required, unique, indexed)
- `razorpayPaymentId`: String (sparse, indexed)
- `razorpaySignature`: String
- `amount`: Number (required)
- `currency`: String (default: `'INR'`)
- `status`: String enum (`'created' | 'authorized' | 'captured' | 'failed'`, indexed)
- `errorDescription`: String
- `verifiedAt`: Date
- Timestamps: `createdAt`, `updatedAt`

### 6. InventoryLog (`models/InventoryLog.ts`)
- `inventoryId`: ObjectId (ref: `Inventory`, required, indexed)
- `ingredientName`: String (required)
- `changeAmount`: Number (positive for restock, negative for deduction)
- `previousQuantity`: Number
- `newQuantity`: Number
- `reason`: String enum (`'order_deduction' | 'manual_restock' | 'spoilage_adjustment' | 'initial_seed' | 'order_cancellation_restore'`, indexed)
- `orderId`: ObjectId (ref: `Order`, indexed, optional)
- `performedBy`: String (required, e.g. `'SYSTEM'` or admin email)
- `notes`: String
- Index: `{ createdAt: -1 }`
- Timestamps: `createdAt`, `updatedAt`

### 7. InventoryAlert (`models/InventoryAlert.ts`)
- `inventoryId`: ObjectId (ref: `Inventory`, required, indexed)
- `ingredientName`: String (required)
- `category`: String (required)
- `currentQuantity`: Number (required)
- `lowStockThreshold`: Number (required)
- `unit`: String (required)
- `sentToEmail`: String (required)
- `status`: String enum (`'sent' | 'failed'`)
- `resolved`: Boolean (default: `false`, indexed)
- `resolvedAt`: Date
- Index: `{ inventoryId: 1, resolved: 1 }`
- Index: `{ createdAt: -1 }`
- Timestamps: `createdAt`, `updatedAt`
