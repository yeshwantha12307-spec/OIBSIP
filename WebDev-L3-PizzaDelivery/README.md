# 🍕 Oasis Pizza — Full-Stack Pizza Delivery Application

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Test_Mode-02042B?logo=razorpay)](https://razorpay.com/)
[![Vitest](https://img.shields.io/badge/Tests-19%20Passed-brightgreen?logo=vitest)](https://vitest.dev/)

> **Oasis Infobyte SIP — Level 3 Web Development & Designing Task**  
> A complete, production-grade, responsive full-stack pizza delivery web application built with modern architecture, interactive custom pizza builder, secure Razorpay sandbox test payments, atomic inventory management, and automated low-stock email alerts.

---

## 🌟 Project Overview

**Oasis Pizza** is an artisanal wood-fired pizzeria digital platform designed to deliver a luxury dining and online ordering experience. The application features:

- A contemporary, responsive UI with artisanal dark aesthetics, glassmorphic accents, and live SVG pizza visualization.
- Complete customer authentication lifecycle: registration, email verification token workflows, secure login, and time-limited password resets.
- Zero-trust security: public registration cannot create administrator accounts; separate role-based authorization for administrative controls.
- Interactive **Custom Pizza Builder** with **5 pizza bases**, **5 artisanal sauces**, cheeses, and multiple vegetable toppings with live server-side pricing and stock validation.
- End-to-end **Razorpay Test Payment** flow with cryptographic **HMAC SHA-256** signature verification, timing-safe equality, and duplicate callback idempotency.
- **Atomic Inventory Deductions** upon verified payment with rollback safeguards and an immutable audit trail (`InventoryLog`).
- Scheduled **node-cron** low-stock monitors that alert administrators via email and prevent duplicate notifications for unresolved conditions.
- Real-time customer **Order Tracking** with a 5-step status stepper (`PLACED` → `PREPARING` → `BAKING` → `OUT_FOR_DELIVERY` → `DELIVERED`), polled live from administrative kitchen updates.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express, TypeScript, Zod, Bcrypt.js, JsonWebToken, Helmet, Express Rate Limit, Morgan |
| **Database** | MongoDB & Mongoose ODM |
| **Payment Gateway** | Razorpay Test Mode SDK & Server-Side HMAC SHA-256 Crypto Verification |
| **Email Carrier** | Nodemailer with SMTP & Ethereal Zero-Config Sandbox fallback |
| **Automation** | node-cron (Scheduled inventory threshold checker) |
| **Testing** | Vitest, Supertest, MongoMemoryServer (100% self-contained in-memory test database) |
| **Deployment Targets**| Frontend: Vercel \| Backend: Render \| Database: MongoDB Atlas |

---

## 🏗️ System Architecture

```
+--------------------------------------------------------------------------+
|                              CLIENT TIER                                 |
|  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons              |
|                                                                          |
|  - Storefront & Craft Menu       - Custom Pizza Studio (SVG Visualizer)  |
|  - Dynamic Cart & Checkout       - Real-Time Live Order Stepper Polling  |
|  - Customer Portal               - Admin Console (Orders, Stock, Alerts) |
+------------------------------------+-------------------------------------+
                                     |  REST API / Bearer JWT / JSON
                                     v
+------------------------------------+-------------------------------------+
|                              SERVER TIER                                 |
|  Node.js + Express + TypeScript + Zod Validation + Helmet + Rate Limit   |
|                                                                          |
|  - authController (Tokens/Auth)   - inventoryService (Atomic Deductions) |
|  - builderController (Pricing)    - razorpayService (HMAC SHA-256)       |
|  - orderController (Snapshots)    - emailService (Nodemailer HTML)       |
|  - paymentController (Verify)     - cronService (Low-Stock Scheduler)    |
+--------------------+------------------+-------------------+--------------+
                     |                  |                   |
                     v                  v                   v
             +---------------+  +---------------+   +---------------+
             |  DATA TIER    |  |PAYMENT GATEWAY|   | EMAIL CARRIER |
             | MongoDB Atlas |  |Razorpay (Test)|   | SMTP/Ethereal |
             |  & Mongoose   |  | HMAC SHA-256  |   |  Nodemailer   |
             +---------------+  +---------------+   +---------------+
```

For deeper architectural details, see [docs/ARCHITECTURE.md](file:///y:/Oasis%20Infobyte%20SIP/OIBSIP/WebDev-L3-PizzaDelivery/docs/ARCHITECTURE.md).

---

## ✨ Features Checklist

### 1. Customer Features
- [x] Customer registration with password hashing (Bcrypt 12 rounds).
- [x] Email verification workflow with time-limited crypto token.
- [x] Login & Logout with JWT tokens stored securely.
- [x] Forgot-password and password reset workflow.
- [x] Craft Pizza menu with filtering (All, Veg, Chef Specials, Spicy).
- [x] Custom Pizza Builder with 5 bases, 5 sauces, cheeses, and toppings.
- [x] Interactive SVG pizza visualizer updating dynamically with toppings.
- [x] Authoritative server-side price calculation (client pricing never trusted).
- [x] Cart management with free delivery incentive progress bar.
- [x] Checkout with street address, phone, and delivery instructions.
- [x] Order history and individual order receipt view.
- [x] Real-time order status tracking with live polling every 5s.

### 2. Payment Integration (Razorpay Test Mode)
- [x] Backend creates Razorpay test orders (`POST /api/orders`).
- [x] Frontend opens Razorpay Checkout modal with test credentials.
- [x] Backend verifies cryptographic HMAC SHA-256 signature (`POST /api/payments/verify`).
- [x] Timing-safe string comparison preventing timing attack vectors.
- [x] Duplicate payment callback prevention (idempotent processing).
- [x] Secret key never exposed to frontend code.
- [x] Failure and dismissal callbacks recorded safely.

### 3. Inventory Management & Atomic Deductions
- [x] Real-time tracking of bases, sauces, cheeses, and vegetables.
- [x] Stock statuses: `In Stock`, `Low Stock`, and `Out of Stock`.
- [x] Out-of-stock items automatically disabled in the pizza builder.
- [x] Atomic `$inc` stock deduction on verified payment (`{ availableQuantity: { $gte: qty } }`).
- [x] Automatic deduction rollback if any ingredient runs out during fulfillment.
- [x] Admin stock adjustment endpoints with reasons (`manual_restock`, `spoilage_adjustment`, etc.).
- [x] Complete immutable audit trail (`InventoryLog`).

### 4. Scheduled Low-Stock Email Alerts
- [x] `node-cron` background scheduler inspecting ingredient levels against thresholds.
- [x] Automated low-stock email dispatches to `ADMIN_ALERT_EMAIL`.
- [x] **Alert Deduplication**: Avoids sending repeated emails on every run for unresolved breaches.
- [x] **Auto-Resolution**: Once stock is replenished above threshold, open alerts are marked resolved, and new alerts trigger if stock drops again later.
- [x] On-demand audit trigger button in Admin Console.

### 5. Admin Dashboard
- [x] Overview stat cards: Total Revenue, Total Orders, Active Kitchen Orders, Low Stock Alerts.
- [x] Order management with status lifecycle transitions (`PLACED`, `PREPARING`, `BAKING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).
- [x] Order detail modal with preserved ingredient snapshots.
- [x] Inventory table with inline adjustment modal.
- [x] Complete audit log history.
- [x] Low-stock alert history.

---

## 🚀 Quick Start Guide (Local Setup)

### Prerequisites
- **Node.js** (v18+ or v20+ or v24+)
- **npm** (v9+ or v11+)
- **MongoDB** (Local MongoDB on port 27017 or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

---

### Step 1: Clone and Navigate to Directory

```bash
cd "OIBSIP/WebDev-L3-PizzaDelivery"
```

---

### Step 2: Backend Server Setup

```bash
cd server

# Install dependencies
npm install

# Setup environment variables (default .env already provided, copy or edit as needed)
cp .env.example .env

# Seed initial database (admin, customer, 5 bases, 5 sauces, cheeses, toppings, craft pizzas)
npm run seed

# Start development server
npm run dev
```

The server will start on: **`http://localhost:5000`**

---

### Step 3: Frontend Client Setup

Open a new terminal:

```bash
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The client will start on: **`http://localhost:5173`**

---

## 🔑 Demo & Evaluator Accounts

For seamless evaluation, default demo accounts are pre-seeded in the database:

| Role | Email | Password | Quick-Fill in UI |
|---|---|---|---|
| **Administrator** | `admin@oasispizza.com` | `AdminPassword@123` | Click **"Admin Demo"** on Login page |
| **Customer** | `customer@oasispizza.com` | `CustomerPassword@123` | Click **"Customer Demo"** on Login page |

> **Note**: Public user registration will **strictly assign** `role: 'customer'`. Admin privileges can only be assigned by administrators or seeded via the server database.

---

## 🧪 Testing Suite

The application includes an automated test suite powered by **Vitest**, **Supertest**, and **MongoMemoryServer** (100% self-contained in-memory MongoDB):

```bash
cd server
npm test
```

### Test Results

```
 ✓ src/tests/inventoryAlerts.test.ts (3 tests)
   ✓ should detect low stock item and generate a new InventoryAlert
   ✓ should deduplicate alerts and avoid sending repeated alerts for the same unresolved breach
   ✓ should automatically mark alert as resolved when stock is replenished above threshold

 ✓ src/tests/builderAndPricing.test.ts (3 tests)
   ✓ should calculate custom pizza pricing accurately on server-side
   ✓ should reject calculation if base is missing or invalid
   ✓ should detect when an ingredient is out of stock

 ✓ src/tests/auth.test.ts (7 tests)
   ✓ should register a new customer and strictly force role to "customer"
   ✓ should reject registration with invalid email or short password
   ✓ should verify email with valid verification token
   ✓ should reject email verification with expired or invalid token
   ✓ should allow user login with correct credentials and return JWT
   ✓ should prevent non-admin customer from accessing admin-only routes
   ✓ should allow admin user to access admin-only routes

 ✓ src/tests/orderAndPayment.test.ts (6 tests)
   ✓ should create an order, calculate server pricing, and generate Razorpay order ID
   ✓ should reject order creation if ingredient stock is insufficient
   ✓ should verify valid Razorpay payment signature, transition status to PLACED, and atomically deduct inventory
   ✓ should reject payment verification if cryptographic signature is forged or invalid
   ✓ should handle duplicate payment callbacks idempotently and prevent duplicate inventory deduction
   ✓ should allow admin to update order status through lifecycle

Test Files  4 passed (4)
     Tests  19 passed (19)
```

---

## ⚙️ Environment Variables Documentation

### Server (`server/.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `NODE_ENV` | Application environment | `development` / `production` |
| `PORT` | Backend HTTP port | `5000` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/oasis_pizza` |
| `JWT_SECRET` | Secret key for signing JWTs | `oasis_pizza_super_secret_jwt_key_2026_dev` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `RAZORPAY_KEY_ID` | Razorpay Test Key ID | `rzp_test_placeholder_key` |
| `RAZORPAY_KEY_SECRET` | Razorpay Test Key Secret | `rzp_test_placeholder_secret` |
| `SMTP_HOST` | Mail server host | `smtp.ethereal.email` / `smtp.gmail.com` |
| `SMTP_PORT` | Mail server port | `587` |
| `SMTP_USER` | SMTP username | *(optional for Ethereal)* |
| `SMTP_PASS` | SMTP password | *(optional for Ethereal)* |
| `ADMIN_ALERT_EMAIL`| Recipient for low-stock alerts | `admin@oasispizza.com` |
| `INVENTORY_CRON_SCHEDULE`| Cron expression for low stock check | `*/30 * * * *` |

---

## 📁 Repository Structure

```
WebDev-L3-PizzaDelivery/
├── client/                     # Frontend React 18 + Vite + TypeScript
│   ├── public/                 # Static assets & SVG icons
│   ├── src/
│   │   ├── api/                # Typed API client wrapper
│   │   ├── components/         # Navbar, Footer, PizzaCard, PizzaVisualizer, StatusBadge, ProtectedRoute
│   │   ├── context/            # AuthContext, CartContext, ToastContext
│   │   ├── pages/              # Home, Menu, Builder, Cart, Checkout, OrderTracking, OrderHistory, Auth
│   │   │   └── admin/          # Admin Dashboard, Orders, Inventory, Audit Logs, Low-Stock Alerts
│   │   ├── types/              # TypeScript models and interfaces
│   │   ├── App.tsx             # Route configuration
│   │   ├── index.css           # Tailwind CSS directives and custom styling
│   │   └── main.tsx            # React DOM mounting
│   ├── index.html              # HTML shell with Google Fonts & Razorpay SDK
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/             # DB connection and Zod-typed environment config
│   │   ├── controllers/        # Auth, Builder, Pizzas, Orders, Payments, Inventory
│   │   ├── middlewares/        # Auth, Role, Rate Limiting, Validation, Error Handling
│   │   ├── models/             # User, Inventory, Pizza, Order, Payment, InventoryLog, InventoryAlert
│   │   ├── routes/             # Express REST router definitions
│   │   ├── scripts/            # Database seed script
│   │   ├── services/           # Inventory atomic deduction, Razorpay crypto, Nodemailer, node-cron
│   │   ├── tests/              # Vitest & Supertest automated test suites
│   │   ├── app.ts              # Express application setup
│   │   └── index.ts            # Server entry point
│   ├── .env.example            # Placeholder environment variable template
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── docs/                       # Project Documentation
│   ├── ARCHITECTURE.md         # Comprehensive system design & data flow
│   ├── API_SPECIFICATION.md    # REST API endpoints, schemas, status codes
│   ├── DATABASE_SCHEMA.md      # Entity relationships, schemas, indexes
│   ├── RAZORPAY_TEST_SETUP.md  # Razorpay test mode & testing cards
│   ├── SMTP_SETUP.md           # Email service configuration
│   └── DEPLOYMENT_GUIDE.md     # Production deployment (Vercel, Render, Atlas)
│
├── screenshots/                # Visual UI captures & Walkthrough Guide
│   └── README.md
│
└── README.md                   # Master Documentation
```

---

## 🔒 Known Limitations & Production Notes

1. **Razorpay Sandbox Credentials**: The application is configured with test mode placeholder credentials by default. To process live sandbox orders with the real Razorpay popup, supply valid `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env`.
2. **Offline Mock Fallback**: When running with placeholder keys, the server generates mock test orders so developers can verify the end-to-end checkout and inventory deduction flow even without internet connectivity.
3. **Database Setup**: Running locally requires a MongoDB instance running on port 27017 or a cloud MongoDB Atlas connection string configured in `MONGODB_URI`.
4. **Email Previews**: In development without custom SMTP credentials, Ethereal Sandbox accounts or console logs display email message content and verification links without charging email credits.

---

## 👨‍💻 Internship Attribution

- **Organization**: Oasis Infobyte
- **Program**: Oasis Infobyte SIP (Summer Internship Program)
- **Domain**: Web Development and Designing
- **Level**: Level 3 Task — Full-Stack Pizza Delivery Application
