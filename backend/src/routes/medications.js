import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Middleware: all routes require auth
router.use(authenticateToken);

// POST /api/medications/:id/refill
router.post('/:id/refill', async (req, res) => {
  try {
    const medicationId = req.params.id;
    const userId = req.user.id;

    // Check if medication exists and belongs to the user
    const [meds] = await pool.query(
      'SELECT id FROM Medication WHERE id = ? AND userId = ?',
      [medicationId, userId]
    );

    if (meds.length === 0) {
      return res.status(404).json({ error: 'Medication not found or unauthorized' });
    }

    // Insert refill request (using UUID for id as per schema convention)
    const requestId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO RefillRequest (id, userId, medicationId, status)
       VALUES (?, ?, ?, 'PENDING')`,
      [requestId, userId, medicationId]
    );

    res.json({ success: true, message: 'Refill request submitted' });
  } catch (error) {
    console.error('Error submitting refill request:', error);
    res.status(500).json({ error: 'Failed to submit refill request' });
  }
});

// POST /api/medications/:id/dose-log
router.post('/:id/dose-log', async (req, res) => {
  try {
    const medicationId = req.params.id;
    const userId = req.user.id;

    // Check if medication exists and belongs to the user
    const [meds] = await pool.query(
      'SELECT id FROM Medication WHERE id = ? AND userId = ?',
      [medicationId, userId]
    );

    if (meds.length === 0) {
      return res.status(404).json({ error: 'Medication not found or unauthorized' });
    }

    // Insert dose log
    const logId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO DoseLog (id, userId, medicationId)
       VALUES (?, ?, ?)`,
      [logId, userId, medicationId]
    );

    res.json({ success: true, message: 'Dose logged successfully' });
  } catch (error) {
    console.error('Error logging dose:', error);
    res.status(500).json({ error: 'Failed to log dose' });
  }
});

export default router;
