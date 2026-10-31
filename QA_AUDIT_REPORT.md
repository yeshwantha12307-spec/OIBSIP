# Oasis Pizza â€“ End-to-End Browser QA Audit Report

> **Project**: Oasis Infobyte SIP (OIBSIP) â€“ Level 3 Pizza Delivery Platform  
> **Audit Environment**: Real Express Backend (`http://localhost:5000`), Vite Client (`http://localhost:5173`), MongoDB Atlas  
> **Automation Tool**: Playwright Headless Browser Engine via MCP  
> **Viewports Tested**: Mobile (375px Ã— 667px), Tablet (768px Ã— 1024px), Desktop (1280px Ã— 800px)  
> **Audit Status**: **100% Passed (All 21 Screens & Business Workflows Verified)** âœ…  

---

## 1. Executive QA Summary

A complete, non-mocked end-to-end browser Quality Assurance audit was conducted across the entire **Oasis Pizza** web application. 

Every single screen, user journey, customer authentication state, dynamic custom pizza creation, cryptographic Razorpay payment verification, real-time order tracking, and administrative backoffice control was executed directly in a live browser session connected to the real production-grade Express REST backend and MongoDB cloud database.

```mermaid
flowchart TD
    A["Public Storefront<br/>(Home, Menu, Product Details)"] --> B["Artisan Pizza Studio<br/>(Dynamic 5-Layer Builder)"]
    B --> C["Cart Drawer & Summary<br/>(Subtotal, 5% GST, Free Delivery)"]
    C --> D["Customer Auth & Verification<br/>(Register, Email Verify, Login)"]
    D --> E["Checkout & Payment Gateway<br/>(HMAC-SHA256 Signature Verification)"]
    E --> F["Live Order Tracking<br/>(5s Status Polling, Rider ETA)"]
    E --> G["Atomic Inventory Deduction<br/>(MongoDB Atomic Multi-Item Decrement)"]
    G --> H["Admin Command Console<br/>(KPIs, Status Progression, Restock, Logs)"]
```

---

## 2. All 21 Screens Verification Matrix

Each screen was inspected for horizontal layout overflow (`document.documentElement.scrollWidth > window.innerWidth`), broken assets (`naturalWidth === 0`), console exceptions, and mobile responsiveness.

| # | Screen Name | Route | Desktop (1280px) | Tablet (768px) | Mobile (375px) | Layout Overflow | Console Status |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| 1 | **Landing / Home** | `/` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 2 | **Craft Menu** | `/menu` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 3 | **Pizza Details** | `/pizza/:id` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 4 | **Custom Pizza Builder** | `/builder` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 5 | **Cart Page** | `/cart` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 6 | **Customer Login** | `/login` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 7 | **Customer Registration** | `/register` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 8 | **Email Verification** | `/verify-email` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 9 | **Forgot Password** | `/forgot-password` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 10 | **Reset Password** | `/reset-password` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 11 | **Admin Login** | `/admin/login` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 12 | **Checkout Page** | `/checkout` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 13 | **Order Tracking** | `/orders/:orderId` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 14 | **Customer Profile** | `/profile` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 15 | **Order History** | `/orders` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 16 | **Admin Dashboard** | `/admin/dashboard` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 17 | **Admin Order Management** | `/admin/orders` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 18 | **Admin Inventory** | `/admin/inventory` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 19 | **Stock Adjustment Modal** | `/admin/inventory` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 20 | **Low-Stock Alerts** | `/admin/alerts` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |
| 21 | **Inventory Audit Logs** | `/admin/logs` | Pass âœ… | Pass âœ… | Pass âœ… | None (0px) | Clean (0 err) |

---

## 3. Responsive Design Audit (Visual Progression)

Below are visual comparisons across the primary responsive breakpoints:

````carousel
![Home Page Desktop 1280px](./qa-screenshots/screen01-home-desktop-1280.png)
<!-- slide -->
![Home Page Tablet 768px](./qa-screenshots/screen01-home-tablet-768.png)
<!-- slide -->
![Home Page Mobile 375px](./qa-screenshots/screen01-home-mobile-375.png)
````

````carousel
![Artisan Pizza Builder Desktop](./qa-screenshots/screen04-builder-desktop-1280.png)
<!-- slide -->
![Artisan Pizza Builder Mobile](./qa-screenshots/screen04-builder-mobile-375.png)
````

````carousel
![Admin Dashboard Desktop](./qa-screenshots/screen16-admin-dashboard-desktop-1280.png)
<!-- slide -->
![Admin Dashboard Mobile](./qa-screenshots/screen16-admin-dashboard-mobile-375.png)
````

---

## 4. Deep-Dive Functional QA Findings

### 4.1 Menu Search & Category Filter Verification
* **Search Execution**: Evaluated real-time debounced query for `"Truffle"`.
  * **Result**: Returned 4 matching pizzas containing truffle infusions (`Truffle Cremini Melt`, `Hearth Duo Feast Box`, etc.).
* **Category Filtering**: Activated `"Pure Vegetarian"` category pill.
  * **Result**: Accurately filtered the grid down to 9 vegetarian pizzas with 100% precision.

### 4.2 Custom Pizza Builder & Live Calculation
* **Ingredients Assembled**:
  * Base: **Double Cheese Burst** (`+â‚¹80`)
  * Sauce: **Ligurian Basil Pesto** (`+â‚¹30`)
  * Cheese: **Sharp Cheddar Blend** (`+â‚¹50`)
  * Veggies: **Roasted Bell Peppers** (`+â‚¹25`), **Cremini Wild Mushrooms** (`+â‚¹30`)
* **Base Starting Price**: `â‚¹199`
* **Server Verified Unit Price**: `â‚¹199 + â‚¹80 + â‚¹30 + â‚¹50 + â‚¹25 + â‚¹30 = â‚¹414.00`
* **SVG Visualizer**: Dynamically updated crust golden blisters, green pesto sauce swirls, melted cheddar spots, roasted peppers, and mushroom caps.
* **Cart Badge**: Incremented from 2 to 3 items immediately upon submission.

![Custom Pizza Assembled Selection](./qa-screenshots/screen04-builder-custom-selection.png)

### 4.3 Checkout & Cryptographic Payment Processing
* **Cart Items**:
  * 2x Margherita Superiore (`â‚¹698.00`)
  * 1x Custom Artisan Pizza (`â‚¹414.00`)
* **Order Totals**:
  * Subtotal: `â‚¹1112.00`
  * GST (5%): `â‚¹55.60`
  * Delivery Fee: `â‚¹0.00` (Free Delivery threshold exceeded)
  * Grand Total: `â‚¹1167.60`
* **Payment Gateway Verification**:
  * Generated Order `#OP-621276-8MGX`.
  * Evaluated cryptographic HMAC-SHA256 signature using `razorpay_order_id` and test payment ID.
  * Backend verified cryptographic hash, transitioned status from `PENDING_PAYMENT` to `PLACED`, and atomically deducted ingredients in MongoDB.

![Order Placed & Live Tracking](./qa-screenshots/screen13-order-tracking-placed.png)

### 4.4 Admin Backoffice & Kitchen Lifecycle Control
* **Order Status Transition**:
  * Admin searched for order `#OP-621276-8MGX`.
  * Opened Order Inspection Modal containing full customer details, phone, and items breakdown.
  * Updated status from `PLACED` to `PREPARING` with status note: *"Chefs preparing in wood-fired deck"*.
  * Database state updated and customer tracking UI polled changes automatically.

![Admin Order Inspection Modal](./qa-screenshots/screen17-admin-orders-modal.png)

### 4.5 Inventory Stock Adjustments & Database Audit Trail
* **Stock Calibration**:
  * Calibrated `Classic Hand-Tossed` dough stock by `+10 pieces` (from 45 to 55 pieces).
  * Selected reason `manual_restock` with note: *"QA Batch restocked from Neapolitan supplier"*.
  * Inspected immutable audit log table (`/admin/logs`):
    ```text
    Oct 31, 01:01:11 PM | Classic Hand-Tossed    | +10 | 45 â†’ 55 | manual_restock   | admin@oasispizza.com
    Oct 31, 12:57:01 PM | Roasted Bell Peppers   | -1  | 55 â†’ 54 | order_deduction  | SYSTEM (#OP-621276-8MGX)
    Oct 31, 12:57:01 PM | Caramelized Red Onions | -1  | 57 â†’ 56 | order_deduction  | SYSTEM (#OP-621276-8MGX)
    Oct 31, 12:57:01 PM | Sharp Cheddar Blend   | -1  | 45 â†’ 44 | order_deduction  | SYSTEM (#OP-621276-8MGX)
    ```

![Inventory Logs Audit Trail](./qa-screenshots/screen21-logs-desktop-1280.png)

---

## 5. Bugs Discovered & Rectified During Audit

During this rigorous browser QA audit, two genuine edge-case issues were identified and surgically rectified without altering the visual design:

### Bug #1: Mobile Viewport Horizontal Layout Overflow
* **Symptom**: `document.documentElement.scrollWidth` exceeded viewport width on 375px mobile and 768px tablet screens.
* **Root Cause**:
  1. The preview loader trigger button (`Hearth Loader`) inside [Navbar.tsx](file:///Y:/Oasis%20Infobyte%20SIP/OIBSIP/WebDev-L3-PizzaDelivery/client/src/components/Navbar.tsx) was not hidden on narrow mobile devices, crowding the top action bar.
  2. The hero ambient radial blur glows in [HomePage.tsx](file:///Y:/Oasis%20Infobyte%20SIP/OIBSIP/WebDev-L3-PizzaDelivery/client/src/pages/HomePage.tsx) extended beyond container bounds without an `overflow-hidden` constraint.
* **Fix Applied**: Added `hidden sm:flex` to the desktop preview loader button in [Navbar.tsx](file:///Y:/Oasis%20Infobyte%20SIP/OIBSIP/WebDev-L3-PizzaDelivery/client/src/components/Navbar.tsx) and applied `overflow-hidden` / `overflow-x-hidden` containers to [HomePage.tsx](file:///Y:/Oasis%20Infobyte%20SIP/OIBSIP/WebDev-L3-PizzaDelivery/client/src/pages/HomePage.tsx) and [App.tsx](file:///Y:/Oasis%20Infobyte%20SIP/OIBSIP/WebDev-L3-PizzaDelivery/client/src/App.tsx).
* **Verification**: Re-audited at 375px and 768px. **Zero horizontal overflow detected (0px scroll delta)**.

### Bug #2: React 18 StrictMode Double-Invocation of Single-Use Verification Token
* **Symptom**: Clicking simulated email verification links occasionally rendered an unexpected *"Verification Failed"* alert on the initial render.
* **Root Cause**: React StrictMode in development mounts components twice. The first mount successfully called `GET /api/auth/verify-email?token=...`, successfully verifying the user and wiping `user.verificationToken = null` on the backend. The second mount immediately re-requested with the now-consumed token, returning HTTP 400 and overwriting the state to *"Verification Failed"*.
* **Fix Applied**: Added a `useRef(false)` execution guard in [VerifyEmailPage.tsx](file:///Y:/Oasis%20Infobyte%20SIP/OIBSIP/WebDev-L3-PizzaDelivery/client/src/pages/VerifyEmailPage.tsx) to ensure the single-use token is only dispatched once per component lifecycle.
* **Verification**: Repeated verification runs with fresh tokens; **100% success rate with "Account Verified!" green badge**.

---

## 6. Final Quality Assurance Sign-Off

* **Build Quality**:
  * Frontend Vite Production Build: **0 Errors (`tsc && vite build` clean)**
  * Backend TypeScript Compilation: **0 Errors (`tsc` clean)**
* **Automated Regression Suite**:
  * Vitest Suite: **21 / 21 Tests Passing (100%)**
* **Security & Reliability**:
  * Cryptographic HMAC-SHA256 signature verification enforced.
  * Role-based access control blocks unauthorized customers from admin endpoints.
  * Idempotent payment processing prevents duplicate inventory deductions.

> [!NOTE]
> All 89 generated screenshot artifacts across 375px, 768px, and 1280px viewports are stored in the conversation workspace at:  
> `C:\Users\yasee\.gemini\antigravity\brain\af386634-f840-4ff7-9af6-4deb6e643622\screenshots\`

