# Razorpay Test Mode Integration & Setup Guide

Oasis Pizza integrates Razorpay strictly in **Test Mode** for educational evaluation and sandbox payment verification. Real money is never charged.

---

## 1. Obtaining Test Mode API Keys

1. Sign up or log into the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Look at the top navigation bar and ensure the toggle is set to **Test Mode** (orange badge).
3. Navigate to **Settings** → **API Keys** tab.
4. Click **Generate Test Key**.
5. Copy the:
   - **Key Id** (starts with `rzp_test_...`)
   - **Key Secret** (alphanumeric string)

---

## 2. Configuring Keys in the Server

In `server/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_YourGeneratedKeyId
RAZORPAY_KEY_SECRET=YourGeneratedKeySecret
```

> **Note on Security**:
> - Never add `RAZORPAY_KEY_SECRET` to the frontend `client/` application.
> - The server passes only `keyId` to the frontend checkout options. The secret key stays safely on the backend for signature verification.

---

## 3. Testing Test Payment Cards

When the Razorpay Checkout modal appears:
1. Select **Card** or **UPI**.
2. For Cards, use standard test card credentials:
   - **Card Number**: `4111 1111 1111 1111` or any valid test card provided by Razorpay documentation.
   - **Expiry Date**: Any future date (e.g., `12/30`).
   - **CVV**: Any 3 digits (e.g., `123`).
   - **OTP**: Enter `123456` or click **Success** on the Razorpay sandbox screen.
3. For UPI, enter `success@razorpay` to simulate instantaneous payment authorization.

---

## 4. Backend Cryptographic Verification

Upon approval, Razorpay returns:
- `razorpay_order_id`
- `razorpay_payment_id`
- `razorpay_signature`

The backend verifies the payload:
```typescript
const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
const expectedSignature = crypto
  .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
  .update(payload)
  .digest('hex');

const isMatch = crypto.timingSafeEqual(
  Buffer.from(expectedSignature, 'utf8'),
  Buffer.from(razorpaySignature, 'utf8')
);
```

- If `isMatch === true`: order status is set to `PLACED`, stock is deducted atomically, audit logs are saved, and confirmation email is dispatched.
- If signature is forged or invalid: 400 Bad Request is returned and stock is NOT deducted.
- If duplicate callback is received: system detects `order.paymentStatus === 'paid'` and returns an idempotent 200 OK without re-deducting inventory.
