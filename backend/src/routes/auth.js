import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db.js';

const router = Router();

const DEMO_ACCOUNT = {
  name: 'John',
  email: 'john@gmail.com',
  password: 'password',
  role: 'PATIENT',
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const signToken = (user) => jwt.sign(
  { userId: user.id, name: user.name, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

async function findOrCreateDemoUser() {
  const email = DEMO_ACCOUNT.email.toLowerCase();
  const [rows] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
  const existingUser = rows[0];

  if (existingUser) {
    return existingUser;
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(DEMO_ACCOUNT.password, 12);

  await pool.query(
    'INSERT INTO User (id, name, email, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
    [id, DEMO_ACCOUNT.name, email, passwordHash, DEMO_ACCOUNT.role]
  );

  return {
    id,
    name: DEMO_ACCOUNT.name,
    email,
    passwordHash,
    role: DEMO_ACCOUNT.role,
  };
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if email already taken
    const [existing] = await pool.query('SELECT id FROM User WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password and insert user
    const passwordHash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();

    await pool.query(
      'INSERT INTO User (id, name, email, passwordHash, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [id, name.trim(), email.toLowerCase().trim(), passwordHash, 'PATIENT']
    );

    // Return a signed JWT
    const user = { id, name: name.trim(), email: email.toLowerCase().trim(), role: 'PATIENT' };
    const token = signToken(user);

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const [rows] = await pool.query('SELECT * FROM User WHERE email = ?', [email.toLowerCase().trim()]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Sign and return JWT
    const token = signToken(user);

    res.json({
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.post('/demo', async (req, res) => {
  try {
    const user = await findOrCreateDemoUser();
    const token = signToken(user);

    res.json({
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('[POST /api/auth/demo]', error);
    res.status(500).json({ error: 'Demo login failed. Please try again.' });
  }
});

// ─── POST /api/auth/change-password ──────────────────────────────────────────
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Valid current and new password (min 6 chars) are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM User WHERE id = ?', [payload.userId]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Incorrect current password' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE User SET passwordHash = ?, updatedAt = NOW() WHERE id = ?', [passwordHash, payload.userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[POST /api/auth/change-password]', error);
    res.status(500).json({ error: 'Failed to change password. Please try again.' });
  }
});

export default router;
