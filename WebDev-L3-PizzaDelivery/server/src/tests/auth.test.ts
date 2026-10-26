import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../app.js';
import { User } from '../models/User.js';

const app = createApp();

describe('Authentication & Authorization Suite', () => {
  it('should register a new customer and strictly force role to "customer"', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'admin', // Malicious attempt to register as admin
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('customer'); // Security check: must be customer!
    expect(res.body.user.email).toBe('john@example.com');
    expect(res.body.token).toBeDefined();

    // Verify in database
    const dbUser = await User.findOne({ email: 'john@example.com' });
    expect(dbUser).toBeDefined();
    expect(dbUser!.role).toBe('customer');
    expect(dbUser!.isVerified).toBe(false);
    expect(dbUser!.verificationToken).toBeDefined();
  });

  it('should reject registration with invalid email or short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'J',
      email: 'not-an-email',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should verify email with valid verification token', async () => {
    const user = await User.create({
      name: 'Alice Smith',
      email: 'alice@example.com',
      passwordHash: await bcrypt.hash('Password123!', 10),
      verificationToken: 'valid-test-token-12345',
      verificationTokenExpiresAt: new Date(Date.now() + 60000),
      isVerified: false,
    });

    const res = await request(app)
      .get('/api/auth/verify-email')
      .query({ token: 'valid-test-token-12345' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = await User.findById(user._id);
    expect(updated!.isVerified).toBe(true);
    expect(updated!.verificationToken).toBeNull();
  });

  it('should reject email verification with expired or invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/verify-email')
      .query({ token: 'invalid-non-existent-token' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should allow user login with correct credentials and return JWT', async () => {
    await User.create({
      name: 'Bob Johnson',
      email: 'bob@example.com',
      passwordHash: await bcrypt.hash('Secret123!', 10),
      role: 'customer',
      isVerified: true,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@example.com',
      password: 'Secret123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('bob@example.com');
  });

  it('should prevent non-admin customer from accessing admin-only routes', async () => {
    // 1. Create and log in as customer
    const user = await User.create({
      name: 'Regular Customer',
      email: 'customer@test.com',
      passwordHash: await bcrypt.hash('Secret123!', 10),
      role: 'customer',
      isVerified: true,
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'customer@test.com',
      password: 'Secret123!',
    });
    const token = loginRes.body.token;

    // 2. Attempt to access admin inventory route
    const adminRes = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${token}`);

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.success).toBe(false);
    expect(adminRes.body.message).toContain('Administrator privileges required');
  });

  it('should allow admin user to access admin-only routes', async () => {
    await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: await bcrypt.hash('Secret123!', 10),
      role: 'admin',
      isVerified: true,
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'Secret123!',
    });
    const token = loginRes.body.token;

    const adminRes = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${token}`);

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
  });
});
