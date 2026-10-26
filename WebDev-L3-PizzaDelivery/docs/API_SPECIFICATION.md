# Oasis Pizza — REST API Specification

Base URL: `http://localhost:5000/api` (Development)

All endpoints accept and return `application/json`.
Protected endpoints require: `Authorization: Bearer <jwt_token>`

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new customer (`role` is strictly `customer`) |
| `POST` | `/api/auth/login` | Public | Sign in with email and password, returns JWT |
| `GET` | `/api/auth/verify-email` | Public | Verify account with `?token=...` query parameter |
| `POST` | `/api/auth/resend-verification` | Public | Request a new verification email token |
| `POST` | `/api/auth/forgot-password` | Public | Request time-limited password reset email token |
| `POST` | `/api/auth/reset-password` | Public | Reset password using `token` and `newPassword` |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile details of currently logged-in user |

### Sample: `POST /api/auth/register`
**Request Body:**
```json
{
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "password": "Password@123"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "67be4f90123...",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "role": "customer",
    "isVerified": false
  }
}
```

---

## 2. Menu Pizzas Endpoints (`/api/pizzas`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/pizzas` | Public | Retrieve all available craft pizzas with populated ingredients |
| `GET` | `/api/pizzas/:id` | Public | Retrieve a single pizza by ID |
| `POST` | `/api/pizzas` | Admin | Create a new craft menu pizza |
| `PUT` | `/api/pizzas/:id` | Admin | Update an existing craft pizza |

---

## 3. Custom Pizza Builder Endpoints (`/api/builder`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/builder/ingredients` | Public | Retrieve all ingredients categorized (bases, sauces, cheeses, veggies) with live stock availability |
| `POST` | `/api/builder/preview-price` | Public | Calculate server-verified custom pizza price and breakdown |

### Sample: `POST /api/builder/preview-price`
**Request Body:**
```json
{
  "baseId": "67be4f901...",
  "sauceId": "67be4f902...",
  "cheeseId": "67be4f903...",
  "veggieIds": ["67be4f904...", "67be4f905..."]
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "unitPrice": 349,
    "breakdown": {
      "basePrice": 199,
      "base": { "id": "...", "name": "Italian Thin Crust", "price": 20, "inStock": true },
      "sauce": { "id": "...", "name": "San Marzano Marinara", "price": 0, "inStock": true },
      "cheese": { "id": "...", "name": "Whole Milk Mozzarella", "price": 40, "inStock": true },
      "veggies": [
        { "id": "...", "name": "Cremini Mushrooms", "price": 35, "inStock": true },
        { "id": "...", "name": "Bell Peppers", "price": 25, "inStock": true }
      ]
    },
    "allAvailable": true
  }
}
```

---

## 4. Orders Endpoints (`/api/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Customer | Validate stock, compute pricing, create Razorpay test order |
| `GET` | `/api/orders/my` | Customer | Get order history of logged-in customer |
| `GET` | `/api/orders/:id` | Owner/Admin | Get individual order details by MongoDB ID or orderNumber |
| `GET` | `/api/orders/admin/all` | Admin | Query all orders with status/search filtering |
| `PATCH` | `/api/orders/admin/status/:id` | Admin | Transition kitchen order status with note |

---

## 5. Payments Endpoints (`/api/payments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/verify` | Authenticated | Verify Razorpay HMAC SHA-256 signature, atomically deduct inventory, confirm order |
| `POST` | `/api/payments/failed` | Authenticated | Record payment cancellation or failure details |

### Sample: `POST /api/payments/verify`
**Request Body:**
```json
{
  "orderId": "67be50...",
  "razorpayOrderId": "order_test_98765",
  "razorpayPaymentId": "pay_test_12345",
  "razorpaySignature": "8a72b0c9f8723..."
}
```

---

## 6. Inventory & Alerts Endpoints (`/api/inventory`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/inventory` | Admin | List all ingredients with live stock status |
| `POST` | `/api/inventory/adjust/:id` | Admin | Adjust available quantity with audit reason and notes |
| `GET` | `/api/inventory/logs` | Admin | Retrieve stock adjustment audit trail |
| `GET` | `/api/inventory/alerts` | Admin | Retrieve low-stock alert dispatch history |
| `POST` | `/api/inventory/check-alerts` | Admin | Manually trigger node-cron low-stock audit |
