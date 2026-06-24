import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to every route in this router
router.use(requireAuth);

// ─── GET /api/dashboard ─────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users]      = await pool.query('SELECT id, name, email, role, createdAt, updatedAt FROM User WHERE id = ?', [userId]);
    const user         = users[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const [medications] = await pool.query('SELECT * FROM Medication WHERE userId = ?', [userId]);
    const [orders]      = await pool.query('SELECT * FROM PharmacyOrder WHERE userId = ?', [userId]);
    const [priorAuths]  = await pool.query('SELECT * FROM PriorAuth WHERE userId = ?', [userId]);

    const [alerts] = await pool.query(`
      SELECT ca.*, 
             u.id AS u_id, u.name AS u_name, u.email AS u_email, u.role AS u_role, u.createdAt AS u_createdAt, u.updatedAt AS u_updatedAt,
             cg.name AS cg_name, cg.email AS cg_email, cg.role AS cg_role
      FROM CaregiverAlert ca
      LEFT JOIN User u ON ca.userId = u.id
      LEFT JOIN User cg ON ca.caregiverId = cg.id
      WHERE ca.userId = ?
    `, [userId]);

    const formattedAlerts = alerts.map(row => ({
      id: row.id,
      userId: row.userId,
      caregiverId: row.caregiverId,
      caregiverName: row.cg_name || 'Caregiver',
      caregiverRole: row.cg_role || 'CAREGIVER',
      actionType: row.actionType,
      action: row.action,
      timestamp: row.timestamp,
      user: {
        id: row.u_id,
        name: row.u_name,
        email: row.u_email,
        role: row.u_role,
        createdAt: row.u_createdAt,
        updatedAt: row.u_updatedAt,
      },
    }));

    res.json({ user, medications, orders, priorAuths, alerts: formattedAlerts });
  } catch (error) {
    console.error('[GET /api/dashboard]', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

// ─── GET /api/medications ────────────────────────────────────────────────────
router.get('/medications', async (req, res) => {
  try {
    const [medications] = await pool.query('SELECT * FROM Medication WHERE userId = ?', [req.user.userId]);
    res.json(medications);
  } catch (error) {
    console.error('[GET /api/medications]', error);
    res.status(500).json({ error: 'Failed to fetch medications.' });
  }
});

// ─── POST /api/medications ───────────────────────────────────────────────────
router.post('/medications', async (req, res) => {
  try {
    const { brandName, genericName, dosage, frequency, pillCount, totalPills, pharmacyId } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!brandName || typeof brandName !== 'string' || brandName.trim() === '') {
      return res.status(400).json({ error: 'brandName is required.' });
    }
    if (!dosage || typeof dosage !== 'string' || dosage.trim() === '') {
      return res.status(400).json({ error: 'dosage is required.' });
    }
    if (!frequency || typeof frequency !== 'string' || frequency.trim() === '') {
      return res.status(400).json({ error: 'frequency is required.' });
    }
    const parsedCount = pillCount !== undefined ? Number(pillCount) : 30;
    if (isNaN(parsedCount) || parsedCount < 0 || !Number.isInteger(parsedCount)) {
      return res.status(400).json({ error: 'pillCount must be a non-negative integer.' });
    }
    const parsedTotal = totalPills !== undefined ? Number(totalPills) : 30;
    if (isNaN(parsedTotal) || parsedTotal < 1 || !Number.isInteger(parsedTotal)) {
      return res.status(400).json({ error: 'totalPills must be a positive integer.' });
    }
    // ─────────────────────────────────────────────────────────────────────────

    let status = 'ACTIVE';
    if (parsedCount === 0)     status = 'PENDING_REFILL';
    else if (parsedCount <= 5) status = 'LOW_SUPPLY';

    const id = crypto.randomUUID();
    const nextRefillDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(`
      INSERT INTO Medication (id, userId, brandName, genericName, dosage, frequency, pillCount, totalPills, status, pharmacyId, nextRefillDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      id,
      req.user.userId,
      brandName.trim(),
      genericName?.trim() || null,
      dosage.trim(),
      frequency.trim(),
      parsedCount,
      parsedTotal,
      status,
      pharmacyId || 'CVS Pharmacy — Main St',
      nextRefillDate,
    ]);

    const [newMedResult] = await pool.query('SELECT * FROM Medication WHERE id = ?', [id]);
    res.status(201).json(newMedResult[0]);
  } catch (error) {
    console.error('[POST /api/medications]', error);
    res.status(500).json({ error: 'Failed to create medication.' });
  }
});

// ─── PATCH /api/medications/:id ──────────────────────────────────────────────
router.patch('/medications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid medication ID.' });
    }

    const { pillCount, frequency } = req.body;

    // Ensure the medication belongs to the authenticated user
    const [owned] = await pool.query(
      'SELECT id, pillCount, status, frequency FROM Medication WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );
    if (owned.length === 0) {
      return res.status(404).json({ error: 'Medication not found.' });
    }

    let updatedPillCount = owned[0].pillCount;
    let status = owned[0].status;
    let updatedFrequency = owned[0].frequency;

    if (pillCount !== undefined && pillCount !== null) {
      const parsed = Number(pillCount);
      if (isNaN(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
        return res.status(400).json({ error: 'pillCount must be a non-negative integer.' });
      }
      updatedPillCount = parsed;
      status = 'ACTIVE';
      if (parsed === 0)     status = 'PENDING_REFILL';
      else if (parsed <= 5) status = 'LOW_SUPPLY';
    }

    if (frequency !== undefined && typeof frequency === 'string') {
      updatedFrequency = frequency.trim();
    }

    await pool.query(
      'UPDATE Medication SET pillCount = ?, status = ?, frequency = ?, updatedAt = NOW() WHERE id = ?',
      [updatedPillCount, status, updatedFrequency, id]
    );

    const [updatedMedResult] = await pool.query('SELECT * FROM Medication WHERE id = ?', [id]);
    res.json(updatedMedResult[0]);
  } catch (error) {
    console.error('[PATCH /api/medications/:id]', error);
    res.status(500).json({ error: 'Failed to update medication.' });
  }
});

// ─── DELETE /api/medications/:id ─────────────────────────────────────────────
router.delete('/medications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid medication ID.' });
    }

    // Ensure the medication belongs to the authenticated user
    const [owned] = await pool.query(
      'SELECT id FROM Medication WHERE id = ? AND userId = ?',
      [id, req.user.userId]
    );
    if (owned.length === 0) {
      return res.status(404).json({ error: 'Medication not found.' });
    }

    // Delete related records to maintain integrity
    await pool.query('DELETE FROM DoseLog WHERE medicationId = ?', [id]);
    await pool.query('DELETE FROM RefillRequest WHERE medicationId = ?', [id]);
    await pool.query('DELETE FROM Medication WHERE id = ?', [id]);

    res.json({ success: true, message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/medications/:id]', error);
    res.status(500).json({ error: 'Failed to delete medication.' });
  }
});

// ─── GET /api/orders ─────────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM PharmacyOrder WHERE userId = ?', [req.user.userId]);
    res.json(orders);
  } catch (error) {
    console.error('[GET /api/orders]', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// ─── GET /api/prior-auths ────────────────────────────────────────────────────
router.get('/prior-auths', async (req, res) => {
  try {
    const [priorAuths] = await pool.query('SELECT * FROM PriorAuth WHERE userId = ?', [req.user.userId]);
    res.json(priorAuths);
  } catch (error) {
    console.error('[GET /api/prior-auths]', error);
    res.status(500).json({ error: 'Failed to fetch prior authorizations.' });
  }
});

// ─── GET /api/alerts ─────────────────────────────────────────────────────────
router.get('/alerts', async (req, res) => {
  try {
    const [alerts] = await pool.query(`
      SELECT ca.*, 
             u.id AS u_id, u.name AS u_name, u.email AS u_email, u.role AS u_role, u.createdAt AS u_createdAt, u.updatedAt AS u_updatedAt,
             cg.name AS cg_name, cg.email AS cg_email, cg.role AS cg_role
      FROM CaregiverAlert ca
      LEFT JOIN User u ON ca.userId = u.id
      LEFT JOIN User cg ON ca.caregiverId = cg.id
      WHERE ca.userId = ?
      ORDER BY ca.timestamp DESC
    `, [req.user.userId]);

    const formattedAlerts = alerts.map(row => ({
      id: row.id,
      userId: row.userId,
      caregiverId: row.caregiverId,
      caregiverName: row.cg_name || 'Caregiver',
      caregiverRole: row.cg_role || 'CAREGIVER',
      actionType: row.actionType,
      action: row.action,
      timestamp: row.timestamp,
      user: {
        id: row.u_id,
        name: row.u_name,
        email: row.u_email,
        role: row.u_role,
        createdAt: row.u_createdAt,
        updatedAt: row.u_updatedAt,
      },
    }));

    res.json(formattedAlerts);
  } catch (error) {
    console.error('[GET /api/alerts]', error);
    res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
});

// ─── POST /api/medications/:id/refill ────────────────────────────────────────
router.post('/medications/:id/refill', async (req, res) => {
  try {
    const { id: medicationId } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const [meds] = await pool.query('SELECT * FROM Medication WHERE id = ? AND userId = ?', [medicationId, userId]);
    if (meds.length === 0) {
      return res.status(404).json({ error: 'Medication not found.' });
    }
    const med = meds[0];

    const requestId = crypto.randomUUID();
    await pool.query(`
      INSERT INTO RefillRequest (id, userId, medicationId, status, requestedAt)
      VALUES (?, ?, ?, 'PENDING', NOW())
    `, [requestId, userId, medicationId]);

    // Update status to PENDING_REFILL if it was LOW_SUPPLY or ACTIVE and running out
    if (med.status === 'LOW_SUPPLY' || med.pillCount <= 5) {
      await pool.query('UPDATE Medication SET status = "PENDING_REFILL", updatedAt = NOW() WHERE id = ?', [medicationId]);
    }

    res.json({ success: true, message: 'Refill request submitted' });
  } catch (error) {
    console.error('[POST /api/medications/:id/refill]', error);
    res.status(500).json({ error: 'Failed to submit refill request.' });
  }
});

// ─── POST /api/medications/:id/dose-log ──────────────────────────────────────
router.post('/medications/:id/dose-log', async (req, res) => {
  try {
    const { id: medicationId } = req.params;
    const userId = req.user.userId;

    // Verify ownership and get current pillCount
    const [meds] = await pool.query('SELECT pillCount FROM Medication WHERE id = ? AND userId = ?', [medicationId, userId]);
    if (meds.length === 0) {
      return res.status(404).json({ error: 'Medication not found.' });
    }
    
    let currentCount = meds[0].pillCount;
    if (currentCount > 0) {
      currentCount--;
    }

    let status = 'ACTIVE';
    if (currentCount === 0) status = 'PENDING_REFILL';
    else if (currentCount <= 5) status = 'LOW_SUPPLY';

    const logId = crypto.randomUUID();
    
    // Insert dose log and update pill count in a transaction-like manner (using async/await sequentially)
    await pool.query(`
      INSERT INTO DoseLog (id, userId, medicationId, takenAt)
      VALUES (?, ?, ?, NOW())
    `, [logId, userId, medicationId]);

    await pool.query(
      'UPDATE Medication SET pillCount = ?, status = ?, updatedAt = NOW() WHERE id = ?',
      [currentCount, status, medicationId]
    );

    res.json({ success: true, message: 'Dose logged successfully' });
  } catch (error) {
    console.error('[POST /api/medications/:id/dose-log]', error);
    res.status(500).json({ error: 'Failed to log dose.' });
  }
});

export default router;
