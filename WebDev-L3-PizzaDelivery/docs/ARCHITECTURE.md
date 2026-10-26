# Oasis Pizza — System Architecture & Design Specification

## 1. High-Level Architecture Overview

Oasis Pizza is designed using a decoupled full-stack architecture that strictly enforces client-server separation, authoritative server-side pricing and inventory validation, cryptographic payment verification, and automated background monitoring.

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|  React 18 + TypeScript + Vite + Tailwind CSS + Lucide + Context API     |
|                                                                         |
|  [Storefront Pages]           [Custom Builder]       [Admin Console]    |
|  - Hero & Craft Menu          - 5 Bases, 5 Sauces    - Order Management |
|  - Cart & Checkout            - Cheeses & Veggies    - Inventory & Logs |
|  - Live Status Polling Stepper- SVG Visualizer       - Stock Alerts     |
+------------------------------------+------------------------------------+
                                     |  HTTP REST / Bearer JWT / JSON
                                     v
+------------------------------------+------------------------------------+
|                              SERVER TIER                                |
|  Node.js + Express + TypeScript + Zod Validation + Helmet + Rate Limit  |
|                                                                         |
|  [Routes & Controllers]       [Services]              [Middlewares]     |
|  - /api/auth                  - inventoryService.ts   - authMiddleware  |
|  - /api/pizzas                - razorpayService.ts    - roleMiddleware  |
|  - /api/builder               - emailService.ts       - rateLimiter     |
|  - /api/orders                - cronService.ts        - validation      |
|  - /api/payments                                      - errorHandler    |
|  - /api/inventory                                                       |
+-------------------+-----------------+-------------------+---------------+
                    |                 |                   |
                    v                 v                   v
            +---------------+ +---------------+  +----------------+
            |  DATA TIER    | | PAYMENT GATEWAY| | EMAIL CARRIER  |
            | MongoDB Atlas | | Razorpay (Test)| | SMTP/Ethereal  |
            |  & Mongoose   | | HMAC SHA-256   | | NodeMailer     |
            +---------------+ +---------------+  +----------------+
```

---

## 2. Security Boundaries & Zero-Trust Principles

1. **Client Untrusted for Pricing & Stock**:
   - The browser never supplies prices, discounts, or stock status.
   - All custom pizza prices are calculated strictly on the backend via `BASE_CUSTOM_PIZZA_PRICE + base.priceModifier + sauce.priceModifier + cheese.priceModifier + sum(veggies.priceModifier)`.
   - Preset craft pizza prices are fetched directly from the database model.

2. **Role Separation & Public Registration Isolation**:
   - Public customer registration strictly hardcodes `role: 'customer'`. Any `role` parameter sent in the request payload is ignored.
   - Admin routes (`/api/inventory/*`, `/api/orders/admin/*`) require both a valid JWT and an explicit `req.user.role === 'admin'` check enforced via `roleMiddleware`.

3. **Cryptographic Payment Integrity (Razorpay Test Mode)**:
   - Orders are created on the backend using `razorpay.orders.create()`.
   - Frontend receives ONLY the public `key_id` and the server-generated `order_id`. The secret key is never sent to the browser.
   - Upon payment, the client submits `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
   - The backend recalculates `HMAC-SHA256(order_id + '|' + payment_id, secret)` and compares it using `crypto.timingSafeEqual()` to eliminate timing attack vectors.
   - Only upon cryptographic match is the order status updated to `PLACED`.

---

## 3. Order & Payment State Machine

```
[Customer Cart]
       |
       v
[POST /api/orders] ----> Check Available Stock in DB
       |                 (Rejects if any ingredient is insufficient)
       v
[Calculates Server Totals: subtotal + 5% GST + deliveryFee]
       |
       v
[Creates Razorpay Test Order]
       |
       v
[Saves Order: status = 'PENDING_PAYMENT', paymentStatus = 'unpaid', inventoryDeducted = false]
       |
       v
[Razorpay Checkout Modal Opens on Frontend]
       |
       +---> User Cancels / Fails: [POST /api/payments/failed] -> status unchanged, note added
       |
       +---> User Approves Payment:
                 |
                 v
       [POST /api/payments/verify]
                 |
                 +---> Check Idempotency: (if already paid & deducted, return early)
                 |
                 +---> Verify HMAC-SHA256 Signature
                 |
                 +---> Atomically Deduct Inventory:
                 |       - findOneAndUpdate({ _id, availableQuantity: { $gte: qty } })
                 |       - Log to InventoryLog (reason: 'order_deduction')
                 |       - order.inventoryDeducted = true
                 |
                 +---> Update Order: status = 'PLACED', paymentStatus = 'paid'
                 |
                 +---> Dispatch Order Confirmation Email via Nodemailer
                 |
                 v
       [Live Order Tracking (/orders/:id) Polls Every 5s]
                 |
                 v
       [Admin Portal Steps: PREPARING -> BAKING -> OUT_FOR_DELIVERY -> DELIVERED]
```

---

## 4. Atomic Inventory Deductions & Concurrency Control

When an order containing multiple items is verified:
1. All required ingredients are aggregated across the order into a map of `{ inventoryId: totalQuantity }`.
2. Each deduction uses MongoDB's atomic operator:
   ```typescript
   Inventory.findOneAndUpdate(
     { _id: id, availableQuantity: { $gte: requiredQty } },
     { $inc: { availableQuantity: -requiredQty } },
     { new: false }
   )
   ```
3. If any single ingredient fails due to concurrency or stock exhaustion, a rollback loop restores previously deducted items and alerts the system.
4. Idempotency is guaranteed by `order.inventoryDeducted: boolean`. If a duplicate callback or webhook fires for the same payment, no duplicate stock deduction occurs.

---

## 5. node-cron Scheduled Low-Stock Monitor & Deduplication

```
[Cron Trigger: */30 * * * *]
       |
       v
[Query: availableQuantity <= lowStockThreshold]
       |
       +---> For each low-stock ingredient:
       |        Check if an active alert exists: InventoryAlert.findOne({ inventoryId, resolved: false })
       |        If NONE exists:
       |           - Send Low-Stock Email to ADMIN_ALERT_EMAIL
       |           - Record new InventoryAlert { resolved: false }
       |        If ONE exists:
       |           - Deduplicate: Do not send repeat emails for the same ongoing breach!
       |
       v
[Query: availableQuantity > lowStockThreshold]
       |
       +---> For each healthy ingredient:
                Check for open alerts: InventoryAlert.find({ inventoryId, resolved: false })
                If found:
                   - Mark resolved = true, resolvedAt = new Date()
                   - Next time stock drops, a fresh alert will trigger!
```
