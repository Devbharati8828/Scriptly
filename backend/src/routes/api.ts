import { Router } from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import { pool } from '../db.js';

interface AlertRow {
  id: string;
  userId: string;
  caregiverId: string;
  actionType: string;
  action: string;
  timestamp: Date;
  u_id: string;
  u_name: string;
  u_email: string;
  u_role: string;
  u_createdAt: Date;
  u_updatedAt: Date;
}

const router = Router();

// Get dashboard summary data
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [users]: any = await pool.query('SELECT * FROM User WHERE role = ? LIMIT 1', ['PATIENT']);
    const user = users[0];
    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }

    const [medications]: any = await pool.query('SELECT * FROM Medication WHERE userId = ?', [user.id]);
    const [orders]: any = await pool.query('SELECT * FROM PharmacyOrder WHERE userId = ?', [user.id]);
    const [priorAuths]: any = await pool.query('SELECT * FROM PriorAuth WHERE userId = ?', [user.id]);
    
    const [alerts]: any = await pool.query(`
      SELECT ca.*, u.id AS u_id, u.name AS u_name, u.email AS u_email, u.role AS u_role, u.createdAt AS u_createdAt, u.updatedAt AS u_updatedAt
      FROM CaregiverAlert ca
      LEFT JOIN User u ON ca.userId = u.id
      WHERE ca.userId = ?
    `, [user.id]);

    const formattedAlerts = alerts.map((row: AlertRow) => ({
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

    res.json({
      user,
      medications,
      orders,
      priorAuths,
      alerts: formattedAlerts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Medications routes
router.get('/medications', async (req: Request, res: Response) => {
  try {
    const [users]: any = await pool.query('SELECT * FROM User WHERE role = ? LIMIT 1', ['PATIENT']);
    const user = users[0];
    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }
    const [medications]: any = await pool.query('SELECT * FROM Medication WHERE userId = ?', [user.id]);
    res.json(medications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

router.post('/medications', async (req: Request, res: Response) => {
  try {
    const [users]: any = await pool.query('SELECT * FROM User WHERE role = ? LIMIT 1', ['PATIENT']);
    const user = users[0];
    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }

    const {
      brandName,
      genericName,
      dosage,
      frequency,
      pillCount,
      totalPills,
      pharmacyId,
    } = req.body;

    const count = parseInt(pillCount) || 30;
    let status = 'ACTIVE';
    if (count === 0) {
      status = 'PENDING_REFILL';
    } else if (count <= 5) {
      status = 'LOW_SUPPLY';
    }

    const id = crypto.randomUUID();
    const nextRefillDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days out

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

    const [newMedResult]: any = await pool.query('SELECT * FROM Medication WHERE id = ?', [id]);
    res.status(201).json(newMedResult[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create medication' });
  }
});

router.patch('/medications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const { pillCount } = req.body;
    
    // Update status based on count
    let status = 'ACTIVE';
    if (pillCount === 0) {
      status = 'PENDING_REFILL';
    } else if (pillCount <= 5) {
      status = 'LOW_SUPPLY';
    }

    await pool.query(`
      UPDATE Medication
      SET pillCount = ?, status = ?, updatedAt = NOW()
      WHERE id = ?
    `, [parseInt(pillCount), status, id]);

    const [updatedMedResult]: any = await pool.query('SELECT * FROM Medication WHERE id = ?', [id]);
    res.json(updatedMedResult[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

export default router;
