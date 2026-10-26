# SMTP Email Service Setup Guide

Oasis Pizza uses **Nodemailer** for:
1. Customer registration email verification links.
2. Password reset links with time-limited tokens.
3. Order confirmation receipts.
4. Scheduled low-stock email alerts to administrators.

---

## 1. Zero-Config Ethereal Test Account (Default)

If no custom SMTP credentials are provided in `.env`, the server automatically creates an **Ethereal Test SMTP Account** at startup.
- All email attempts succeed without errors.
- Test preview URLs are logged to the console output so developers can inspect email rendering without needing an active mail server.

---

## 2. Using Gmail SMTP for Live Testing

To send real emails to your personal inbox:
1. Go to your Google Account: **Security** → **2-Step Verification**.
2. Scroll to **App Passwords**.
3. Generate a new App Password for "Oasis Pizza".
4. Update `server/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_character_app_password
   SMTP_FROM="Oasis Pizza" <your_email@gmail.com>
   ADMIN_ALERT_EMAIL=your_admin_email@gmail.com
   ```

---

## 3. Scheduled Low-Stock Monitor & Testing Alerts

The scheduled inventory check runs using `node-cron`:
```env
# Default: runs every 30 minutes
INVENTORY_CRON_SCHEDULE=*/30 * * * *
```

To trigger the check immediately without waiting for the timer:
- Open the Admin Portal: `/admin/alerts` or `/admin/dashboard`.
- Click **"Run Inventory Audit & Email Check"** (or `POST /api/inventory/check-alerts`).
- If any ingredient has `availableQuantity <= lowStockThreshold`, an alert email is sent to `ADMIN_ALERT_EMAIL` and recorded in the audit history!
