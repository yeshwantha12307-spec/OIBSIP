import dotenv from 'dotenv';
import path from 'path';

// Load .env from current directory or parent
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oasis_pizza',
  JWT_SECRET: process.env.JWT_SECRET || 'oasis_pizza_super_secret_jwt_key_2026_dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Razorpay Test Mode Credentials
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',

  // SMTP Email Settings
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.ethereal.email',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Oasis Pizza <no-reply@oasispizza.com>',
  ADMIN_ALERT_EMAIL: process.env.ADMIN_ALERT_EMAIL || 'admin@oasispizza.com',

  // Scheduled inventory alerts cron pattern (defaults to every 30 minutes, or hourly)
  INVENTORY_CRON_SCHEDULE: process.env.INVENTORY_CRON_SCHEDULE || '*/30 * * * *',
};
