import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({
      success: false,
      message: 'An account with this email address already exists',
    });
    return;
  }

  // Security: Public registration can NEVER create an admin!
  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'customer', // strictly customer
    isVerified: false,
    verificationToken,
    verificationTokenExpiresAt,
  });

  // Asynchronously dispatch verification email
  sendVerificationEmail(user.email, user.name, verificationToken).catch((err) =>
    console.error('Failed to send verification email during register:', err)
  );

  const token = generateToken(user._id.toString(), user.role);

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    verificationToken: env.NODE_ENV !== 'production' ? verificationToken : undefined,
  });
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const token = (req.query.token as string) || req.body.token;

  if (!token) {
    res.status(400).json({
      success: false,
      message: 'Verification token is required',
    });
    return;
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    res.status(400).json({
      success: false,
      message: 'Verification token is invalid or has expired',
    });
    return;
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiresAt = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email successfully verified! You may now enjoy full access to Oasis Pizza.',
  });
};

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'No account found with this email',
    });
    return;
  }

  if (user.isVerified) {
    res.status(400).json({
      success: false,
      message: 'Account is already verified',
    });
    return;
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user.email, user.name, verificationToken);

  res.status(200).json({
    success: true,
    message: 'Verification email has been resent.',
    verificationToken: env.NODE_ENV !== 'production' ? verificationToken : undefined,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  const token = generateToken(user._id.toString(), user.role);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Avoid email enumeration by sending a generic success message
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) =>
    console.error('Failed to send password reset email:', err)
  );

  res.status(200).json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been dispatched.',
    resetToken: env.NODE_ENV !== 'production' ? resetToken : undefined,
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({
      success: false,
      message: 'Token and new password are required',
    });
    return;
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    res.status(400).json({
      success: false,
      message: 'Password reset token is invalid or has expired',
    });
    return;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You may now log in with your new credentials.',
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified,
    },
  });
};
