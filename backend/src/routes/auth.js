import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = Router();

const COOKIE_NAME = 'token';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 8 * 60 * 60 * 1000, // 8h
};

function sign(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '8h',
  });
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME]
    || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';
    const rawPassword = typeof password === 'string' ? password : '';

    console.log('[auth/login] request received', {
      username: normalizedUsername || null,
      hasPassword: Boolean(rawPassword),
    });

    if (!normalizedUsername || !rawPassword) {
      console.warn('[auth/login] missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await pool.query(
      `SELECT id, username, password_hash, display_name, is_active
       FROM admin_users
       WHERE LOWER(username) = LOWER($1)
       LIMIT 1`,
      [normalizedUsername],
    );

    console.log('[auth/login] admin lookup complete', {
      username: normalizedUsername,
      rowCount: result.rowCount,
    });

    const admin = result.rows[0];
    if (!admin || !admin.is_active) {
      console.warn('[auth/login] admin not found or inactive', {
        username: normalizedUsername,
        found: Boolean(admin),
        isActive: admin?.is_active ?? null,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(rawPassword, admin.password_hash);
    if (!isPasswordValid) {
      console.warn('[auth/login] password mismatch', {
        username: normalizedUsername,
        adminId: admin.id,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query(
      `UPDATE admin_users
       SET last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1`,
      [admin.id],
    );

    console.log('[auth/login] login success', {
      username: admin.username,
      adminId: admin.id,
    });

    const token = sign({
      sub: admin.username,
      role: 'admin',
      adminId: admin.id,
      displayName: admin.display_name || admin.username,
    });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    return res.json({ ok: true });
  } catch (err) {
    console.error('[auth/login] unexpected error', {
      message: err?.message,
      stack: err?.stack,
      code: err?.code,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: req.user.sub,
    role: req.user.role,
    adminId: req.user.adminId,
    displayName: req.user.displayName,
  });
});

export default router;
