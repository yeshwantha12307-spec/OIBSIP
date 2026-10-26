import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter: nodemailer.Transporter | null = null;

export const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  if (env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else {
    // If no credentials configured, create an Ethereal test account or mocked console transporter
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email Service] Ethereal test SMTP account configured: ${testAccount.user}`);
    } catch {
      // Fallback mock transporter
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      console.log('[Email Service] Using JSON mock email transport');
    }
  }

  return transporter;
};

export const sendVerificationEmail = async (email: string, name: string, token: string): Promise<boolean> => {
  try {
    const client = await getTransporter();
    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

    const info = await client.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Verify your Oasis Pizza account 🍕',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1115; color: #f1faee; padding: 32px; border-radius: 12px; border: 1px solid #2a2f3a;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #e63946; margin: 0; font-size: 28px;">Oasis Pizza</h1>
            <p style="color: #f4a261; margin: 4px 0 0 0; font-size: 14px; letter-spacing: 2px;">ARTISAN WOOD-FIRED PIZZERIA</p>
          </div>
          <h2 style="color: #ffffff; font-size: 20px;">Welcome to Oasis Pizza, ${name}!</h2>
          <p style="color: #a0aec0; line-height: 1.6;">Thank you for registering. Please confirm your email address to activate your account and start ordering custom artisan pizzas.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" style="background: #e63946; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #718096; font-size: 12px; word-break: break-all;">Or copy and paste this link into your browser:<br/><a href="${verificationUrl}" style="color: #f4a261;">${verificationUrl}</a></p>
          <hr style="border: none; border-top: 1px solid #2a2f3a; margin: 24px 0;" />
          <p style="color: #718096; font-size: 12px; text-align: center;">This link will expire in 24 hours. If you did not create this account, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`[Email Service] Verification email dispatched to ${email}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Service Error] Failed to send verification email to ${email}:`, error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, name: string, token: string): Promise<boolean> => {
  try {
    const client = await getTransporter();
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

    const info = await client.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Reset your Oasis Pizza password 🔐',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1115; color: #f1faee; padding: 32px; border-radius: 12px; border: 1px solid #2a2f3a;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #e63946; margin: 0; font-size: 28px;">Oasis Pizza</h1>
          </div>
          <h2 style="color: #ffffff; font-size: 20px;">Password Reset Request</h2>
          <p style="color: #a0aec0; line-height: 1.6;">Hello ${name}, we received a request to reset your password. Click the button below to choose a new password.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: #e63946; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #718096; font-size: 12px; word-break: break-all;">Link: <a href="${resetUrl}" style="color: #f4a261;">${resetUrl}</a></p>
          <p style="color: #e63946; font-size: 12px;">This password reset link expires in 1 hour.</p>
        </div>
      `,
    });

    console.log(`[Email Service] Password reset email dispatched to ${email}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Service Error] Failed to send password reset email to ${email}:`, error);
    return false;
  }
};

export const sendLowStockAlertEmail = async (
  adminEmail: string,
  items: Array<{ name: string; category: string; quantity: number; threshold: number; unit: string }>
): Promise<boolean> => {
  try {
    const client = await getTransporter();
    const itemsTableHtml = items
      .map(
        (i) => `
        <tr style="border-bottom: 1px solid #2a2f3a;">
          <td style="padding: 10px; color: #f1faee; font-weight: bold;">${i.name}</td>
          <td style="padding: 10px; color: #f4a261; text-transform: capitalize;">${i.category}</td>
          <td style="padding: 10px; color: #e63946; font-weight: bold;">${i.quantity} ${i.unit}</td>
          <td style="padding: 10px; color: #a0aec0;">${i.threshold} ${i.unit}</td>
        </tr>
      `
      )
      .join('');

    const info = await client.sendMail({
      from: env.SMTP_FROM,
      to: adminEmail,
      subject: `🚨 [Oasis Pizza] Low Inventory Alert — ${items.length} item(s) below threshold`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #0f1115; color: #f1faee; padding: 32px; border-radius: 12px; border: 1px solid #e63946;">
          <div style="border-bottom: 2px solid #e63946; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="color: #e63946; margin: 0;">Oasis Pizza — Inventory Alert</h1>
            <p style="color: #f4a261; margin: 4px 0 0 0;">Automated Inventory Monitor</p>
          </div>
          <p style="color: #ffffff; font-size: 15px;">The following ingredients have fallen below their configured safety stock thresholds:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; text-align: left;">
            <thead>
              <tr style="background: #181b22; color: #a0aec0; font-size: 12px; text-transform: uppercase;">
                <th style="padding: 10px;">Ingredient</th>
                <th style="padding: 10px;">Category</th>
                <th style="padding: 10px;">Current Stock</th>
                <th style="padding: 10px;">Threshold</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableHtml}
            </tbody>
          </table>
          <p style="color: #a0aec0; font-size: 13px;">Please log into the Admin Dashboard to replenish ingredients promptly to prevent customer order fulfillment interruptions.</p>
          <div style="margin-top: 24px; text-align: center;">
            <a href="${env.CLIENT_URL}/admin/inventory" style="background: #2a9d8f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Inventory Dashboard</a>
          </div>
        </div>
      `,
    });

    console.log(`[Email Service] Low stock alert email dispatched to ${adminEmail}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Service Error] Failed to send low stock alert:`, error);
    return false;
  }
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderNumber: string,
  totalAmount: number,
  itemsCount: number
): Promise<boolean> => {
  try {
    const client = await getTransporter();
    const trackingUrl = `${env.CLIENT_URL}/orders/${orderNumber}`;

    await client.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: `Order Confirmed: #${orderNumber} 🍕`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1115; color: #f1faee; padding: 32px; border-radius: 12px; border: 1px solid #2a2f3a;">
          <h1 style="color: #e63946; margin: 0 0 8px 0;">Oasis Pizza</h1>
          <h2 style="color: #ffffff; font-size: 20px;">Payment Verified & Order Confirmed!</h2>
          <p style="color: #a0aec0;">Order <strong>#${orderNumber}</strong> (${itemsCount} item(s)) has been received and our chefs are preparing your wood-fired pizzas.</p>
          <div style="background: #181b22; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #2a2f3a;">
            <p style="margin: 0; color: #f4a261;">Total Paid: <strong>₹${totalAmount.toFixed(2)}</strong></p>
            <p style="margin: 4px 0 0 0; color: #2a9d8f;">Payment Status: Verified (Razorpay)</p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${trackingUrl}" style="background: #e63946; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Your Order Live</a>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error(`[Email Service Error] Failed to send order confirmation:`, error);
    return false;
  }
};
