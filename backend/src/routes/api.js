import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../db.js';

const router = Router();

// ─── GET /api/dashboard ─────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM User WHERE role = ? LIMIT 1', ['PATIENT']);
    const user = users[0];
    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }

    const [medications] = await pool.query('SELECT * FROM Medication WHERE userId = ?', [user.id]);
    const [orders]      = await pool.query('SELECT * FROM PharmacyOrder WHERE userId = ?', [user.id]);
    const [priorAuths]  = await pool.query('SELECT * FROM PriorAuth WHERE userId = ?', [user.id]);
    
    const [alerts]      = await pool.query(`
      SELECT ca.*, u.id AS u_id, u.name AS u_name, u.email AS u_email, u.role AS u_role, u.createdAt AS u_createdAt, u.updatedAt AS u_updatedAt
      FROM CaregiverAlert ca
      LEFT JOIN User u ON ca.userId = u.id
      WHERE ca.userId = ?
    `, [user.id]);

    const formattedAlerts = alerts.map(row => ({
      id: row.id,
      userId: row.userId,
      caregiverId: row.caregiverId,
      actionType: row.actionType,
      action: row.action,
      timestamp: row.timestamp,
      user: {
        id: row.u_id,
        name: row.u_name,
        email: row.u_email,
        role: row.u_role,
        createdAt: row.u_createdAt,
        updatedAt: row.u_updatedAt
      }
    }));

    res.json({ user, medications, orders, priorAuths, alerts: formattedAlerts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ─── GET /api/medications ────────────────────────────────────────────────────
router.get('/medications', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM User WHERE role = ? LIMIT 1', ['PATIENT']);
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'No user found' });

    const [medications] = await pool.query('SELECT * FROM Medication WHERE userId = ?', [user.id]);
    res.json(medications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

// ─── POST /api/medications ───────────────────────────────────────────────────
router.post('/medications', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM User WHERE role = ? LIMIT 1', ['PATIENT']);
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'No user found' });

    const { brandName, genericName, dosage, frequency, pillCount, totalPills, pharmacyId } = req.body;

    const count = parseInt(pillCount) || 30;
    let status = 'ACTIVE';
    if (count === 0)      status = 'PENDING_REFILL';
    else if (count <= 5)  status = 'LOW_SUPPLY';

    const id = crypto.randomUUID();
    const nextRefillDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(`
      INSERT INTO Medication (id, userId, brandName, genericName, dosage, frequency, pillCount, totalPills, status, pharmacyId, nextRefillDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      id,
      user.id,
      brandName,
      genericName,
      dosage,
      frequency,
      count,
      parseInt(totalPills) || 30,
      status,
      pharmacyId || 'CVS Pharmacy — Main St',
      nextRefillDate
    ]);

    const [newMedResult] = await pool.query('SELECT * FROM Medication WHERE id = ?', [id]);
    res.status(201).json(newMedResult[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create medication' });
  }
});

// ─── PATCH /api/medications/:id ──────────────────────────────────────────────
router.patch('/medications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const { pillCount } = req.body;

    let status = 'ACTIVE';
    if (pillCount === 0)      status = 'PENDING_REFILL';
    else if (pillCount <= 5)  status = 'LOW_SUPPLY';

    await pool.query(`
      UPDATE Medication
      SET pillCount = ?, status = ?, updatedAt = NOW()
      WHERE id = ?
    `, [parseInt(pillCount), status, id]);

    const [updatedMedResult] = await pool.query('SELECT * FROM Medication WHERE id = ?', [id]);
    res.json(updatedMedResult[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

// ─── GET /api/orders ─────────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM User WHERE role = ? LIMIT 1', ['PATIENT']);
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'No user found' });

    const [orders] = await pool.query('SELECT * FROM PharmacyOrder WHERE userId = ?', [user.id]);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ─── GET /api/prior-auths ────────────────────────────────────────────────────
router.get('/prior-auths', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM User WHERE role = ? LIMIT 1', ['PATIENT']);
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'No user found' });

    const [priorAuths] = await pool.query('SELECT * FROM PriorAuth WHERE userId = ?', [user.id]);
    res.json(priorAuths);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch prior authorizations' });
  }
});

// ─── GET /api/alerts ─────────────────────────────────────────────────────────
router.get('/alerts', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM User WHERE role = ? LIMIT 1', ['PATIENT']);
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'No user found' });

    const [alerts] = await pool.query(`
      SELECT ca.*, u.id AS u_id, u.name AS u_name, u.email AS u_email, u.role AS u_role, u.createdAt AS u_createdAt, u.updatedAt AS u_updatedAt
      FROM CaregiverAlert ca
      LEFT JOIN User u ON ca.userId = u.id
      WHERE ca.userId = ?
      ORDER BY ca.timestamp DESC
    `, [user.id]);

    const formattedAlerts = alerts.map(row => ({
      id: row.id,
      userId: row.userId,
      caregiverId: row.caregiverId,
      actionType: row.actionType,
      action: row.action,
      timestamp: row.timestamp,
      user: {
        id: row.u_id,
        name: row.u_name,
        email: row.u_email,
        role: row.u_role,
        createdAt: row.u_createdAt,
        updatedAt: row.u_updatedAt
      }
    }));

    res.json(formattedAlerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

export default router;
