import { Router } from 'express';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import multer from 'multer';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const upload = multer({ dest: 'uploads/' });

const router = Router();

// Apply auth middleware to every route in this router
router.use(requireAuth);

// ─── GET /api/dashboard ─────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users]      = await pool.query('SELECT id, name, email, role, insuranceProvider, planName, memberId, phone, onboardingComplete, createdAt, updatedAt FROM User WHERE id = ?', [userId]);
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

    const [doseLogs] = await pool.query('SELECT * FROM DoseLog WHERE userId = ?', [userId]);

    res.json({ user, medications, orders, priorAuths, alerts: formattedAlerts, doseLogs });
  } catch (error) {
    console.error('[GET /api/dashboard]', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

// ─── GET /api/medications ────────────────────────────────────────────────────
router.get('/medications', async (req, res) => {
  try {
    const [medications] = await pool.query('SELECT * FROM Medication WHERE userId = ?', [req.user.userId]);

    // Notification Trigger: Medication pillCount drops below 20%
    for (const med of medications) {
      if (med.pillCount < 0.2 * med.totalPills) {
        // Check for existing refill reminder in the last 24 hours
        const [recentNotifs] = await pool.query(`
          SELECT id FROM Notification 
          WHERE userId = ? AND type = 'REFILL_REMINDER' 
          AND message LIKE ? 
          AND createdAt > NOW() - INTERVAL 1 DAY
        `, [req.user.userId, `%${med.brandName}%`]);

        if (recentNotifs.length === 0) {
          const notifId = crypto.randomUUID();
          await pool.query(`
            INSERT INTO Notification (id, userId, type, title, message)
            VALUES (?, ?, ?, ?, ?)
          `, [notifId, req.user.userId, 'REFILL_REMINDER', 'Refill Reminder', `Your supply of ${med.brandName} is running low (${med.pillCount} remaining). Please request a refill.`]);
        }
      }
    }

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

// ─── POST /api/orders ────────────────────────────────────────────────────────
router.post('/orders', async (req, res) => {
  try {
    const { medicationId, pharmacyId, deliveryType, cost } = req.body;
    const userId = req.user.userId;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!medicationId || typeof medicationId !== 'string') {
      return res.status(400).json({ error: 'medicationId is required.' });
    }
    if (!pharmacyId || typeof pharmacyId !== 'string') {
      return res.status(400).json({ error: 'pharmacyId is required.' });
    }

    // Verify the medication belongs to the authenticated user
    const [meds] = await pool.query(
      'SELECT id FROM Medication WHERE id = ? AND userId = ?',
      [medicationId, userId]
    );
    if (meds.length === 0) {
      return res.status(404).json({ error: 'Medication not found.' });
    }

    const id = crypto.randomUUID();
    const expectedDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const orderDeliveryType = deliveryType || 'DELIVERY';
    const orderCost = cost !== undefined ? Number(cost) : 0.0;

    await pool.query(`
      INSERT INTO PharmacyOrder (id, userId, medicationId, pharmacyId, status, deliveryType, expectedDate, cost, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, 'PLACED', ?, ?, ?, NOW(), NOW())
    `, [id, userId, medicationId, pharmacyId.trim(), orderDeliveryType, expectedDate, orderCost]);

    const [newOrder] = await pool.query('SELECT * FROM PharmacyOrder WHERE id = ?', [id]);
    res.status(201).json(newOrder[0]);
  } catch (error) {
    console.error('[POST /api/orders]', error);
    res.status(500).json({ error: 'Failed to create pharmacy order.' });
  }
});

// ─── POST /api/prior-auths ──────────────────────────────────────────────────
router.post('/prior-auths', async (req, res) => {
  try {
    const { medicationId, insurer } = req.body;
    const userId = req.user.userId;
    const userName = req.user.name || 'Patient';

    // ── Input validation ──────────────────────────────────────────────────────
    if (!medicationId || typeof medicationId !== 'string') {
      return res.status(400).json({ error: 'medicationId is required.' });
    }

    // Verify the medication belongs to the authenticated user
    const [meds] = await pool.query(
      'SELECT * FROM Medication WHERE id = ? AND userId = ?',
      [medicationId, userId]
    );
    if (meds.length === 0) {
      return res.status(404).json({ error: 'Medication not found.' });
    }
    const med = meds[0];

    // Generate reference ID: PA-YYYY-XXXX
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const referenceId = `PA-${year}-${randomNum}`;

    const id = crypto.randomUUID();
    const insurerName = insurer || 'Blue Cross Blue Shield';
    const expectedDecisionDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await pool.query(`
      INSERT INTO PriorAuth (id, userId, medicationId, status, insurer, referenceId, expectedDecisionDate, createdAt, updatedAt)
      VALUES (?, ?, ?, 'PENDING', ?, ?, ?, NOW(), NOW())
    `, [id, userId, medicationId, insurerName, referenceId, expectedDecisionDate]);

    // ── Generate Prescription PDF ─────────────────────────────────────────────
    const pdfBase64 = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer.toString('base64'));
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text('PRESCRIPTION', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica').fillColor('#666666')
        .text('Prior Authorization Document', { align: 'center' });
      doc.moveDown(1);

      // Separator
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(1);

      // Reference ID & Date
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000')
        .text(`Reference ID: ${referenceId}`, { continued: false });
      doc.font('Helvetica').text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
      doc.moveDown(1);

      // Patient Information
      doc.fontSize(13).font('Helvetica-Bold').text('Patient Information');
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica')
        .text(`Name: ${userName}`);
      doc.moveDown(1);

      // Medication Details
      doc.fontSize(13).font('Helvetica-Bold').text('Medication Details');
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica')
        .text(`Brand Name: ${med.brandName}`)
        .text(`Generic Name: ${med.genericName || 'N/A'}`)
        .text(`Dosage: ${med.dosage}`)
        .text(`Frequency: ${med.frequency}`)
        .text(`Pharmacy: ${med.pharmacyId || 'N/A'}`);
      doc.moveDown(1);

      // Insurance Info
      doc.fontSize(13).font('Helvetica-Bold').text('Insurance Information');
      doc.moveDown(0.3);
      doc.fontSize(11).font('Helvetica')
        .text(`Insurer: ${insurerName}`)
        .text(`Authorization Status: PENDING`);
      doc.moveDown(2);

      // Separator
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(1.5);

      // Doctor Signature
      doc.fontSize(11).font('Helvetica')
        .text('Prescribing Physician Signature:');
      doc.moveDown(1.5);
      doc.moveTo(50, doc.y).lineTo(300, doc.y).strokeColor('#000000').lineWidth(1).stroke();
      doc.moveDown(0.3);
      doc.fontSize(9).font('Helvetica').fillColor('#666666')
        .text('Dr. _______________________, MD');
      doc.moveDown(0.5);
      doc.text(`Date: _______________`);

      // Footer
      doc.moveDown(3);
      doc.fontSize(8).fillColor('#999999')
        .text(`Document generated by Scriptly — Reference: ${referenceId}`, { align: 'center' });

      doc.end();
    });

    const [newAuth] = await pool.query('SELECT * FROM PriorAuth WHERE id = ?', [id]);
    res.status(201).json({
      priorAuth: newAuth[0],
      pdf: pdfBase64,
      referenceId,
    });
  } catch (error) {
    console.error('[POST /api/prior-auths]', error);
    res.status(500).json({ error: 'Failed to create prior authorization.' });
  }
});

// ─── POST /api/prior-auths/:id/upload ────────────────────────────────────────
router.post('/prior-auths/:id/upload', upload.single('document'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid prior auth ID.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded.' });
    }

    // Verify the prior auth belongs to the authenticated user
    const [auths] = await pool.query(
      'SELECT * FROM PriorAuth WHERE id = ? AND userId = ?',
      [id, userId]
    );
    if (auths.length === 0) {
      return res.status(404).json({ error: 'Prior authorization not found.' });
    }

    const auth = auths[0];

    const today = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await pool.query(
      'UPDATE PriorAuth SET status = ?, expectedDecisionDate = ?, notes = ?, updatedAt = NOW() WHERE id = ?',
      ['APPROVED', today, 'Documents verified — prior authorization approved', id]
    );

    // Trigger Notification for Prior Auth Approval
    const notifId = crypto.randomUUID();
    await pool.query(`
      INSERT INTO Notification (id, userId, type, title, message)
      VALUES (?, ?, ?, ?, ?)
    `, [notifId, userId, 'PRIOR_AUTH_DECISION', 'Prior Authorization Approved', `Your prior authorization for ${auth.medicationId} has been approved.`]);

    // Auto-create a pharmacy order for the associated medication
    const [meds] = await pool.query('SELECT * FROM Medication WHERE id = ?', [auth.medicationId]);
    const med = meds[0];
    const orderId = crypto.randomUUID();
    const expectedDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(`
      INSERT INTO PharmacyOrder (id, userId, medicationId, pharmacyId, status, deliveryType, expectedDate, cost, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, 'PROCESSING', 'DELIVERY', ?, 0.0, NOW(), NOW())
    `, [orderId, userId, auth.medicationId, med?.pharmacyId || 'Default Pharmacy', expectedDate]);

    const [updatedAuth] = await pool.query('SELECT * FROM PriorAuth WHERE id = ?', [id]);
    const [newOrder] = await pool.query('SELECT * FROM PharmacyOrder WHERE id = ?', [orderId]);

    res.json({
      priorAuth: updatedAuth[0],
      order: newOrder[0],
      message: 'Prior authorization approved and pharmacy order created.',
    });
  } catch (error) {
    console.error('[POST /api/prior-auths/:id/upload]', error);
    res.status(500).json({ error: 'Failed to process upload.' });
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
    const { pillsTaken = 1 } = req.body;
    const userId = req.user.userId;

    const parsedTaken = Number(pillsTaken);
    if (isNaN(parsedTaken) || parsedTaken < 1 || !Number.isInteger(parsedTaken)) {
      return res.status(400).json({ error: 'pillsTaken must be a positive integer.' });
    }

    // Verify ownership and get current pillCount
    const [meds] = await pool.query('SELECT pillCount FROM Medication WHERE id = ? AND userId = ?', [medicationId, userId]);
    if (meds.length === 0) {
      return res.status(404).json({ error: 'Medication not found.' });
    }
    
    let currentCount = meds[0].pillCount;
    if (currentCount >= parsedTaken) {
      currentCount -= parsedTaken;
    } else {
      currentCount = 0; // Don't go below zero
    }

    let status = 'ACTIVE';
    if (currentCount === 0) status = 'PENDING_REFILL';
    else if (currentCount <= 5) status = 'LOW_SUPPLY';

    const logId = crypto.randomUUID();
    
    // Insert dose log and update pill count
    await pool.query(`
      INSERT INTO DoseLog (id, userId, medicationId, takenAt, pillsTaken)
      VALUES (?, ?, ?, NOW(), ?)
    `, [logId, userId, medicationId, parsedTaken]);

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

// ─── GET /api/notifications ──────────────────────────────────────────────────
router.get('/notifications', async (req, res) => {
  try {
    const [notifications] = await pool.query('SELECT * FROM Notification WHERE userId = ? ORDER BY createdAt DESC', [req.user.userId]);
    res.json(notifications);
  } catch (error) {
    console.error('[GET /api/notifications]', error);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE Notification SET isRead = TRUE WHERE id = ? AND userId = ?', [id, req.user.userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/notifications/:id/read]', error);
    res.status(500).json({ error: 'Failed to mark notification read.' });
  }
});

// ─── PATCH /api/orders/:id ───────────────────────────────────────────────────
router.patch('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'status is required.' });
    }

    const [orders] = await pool.query('SELECT * FROM PharmacyOrder WHERE id = ? AND userId = ?', [id, userId]);
    if (orders.length === 0) return res.status(404).json({ error: 'Order not found.' });

    await pool.query('UPDATE PharmacyOrder SET status = ?, updatedAt = NOW() WHERE id = ?', [status, id]);

    if (status === 'DELIVERED') {
      const notifId = crypto.randomUUID();
      await pool.query(`
        INSERT INTO Notification (id, userId, type, title, message)
        VALUES (?, ?, ?, ?, ?)
      `, [notifId, userId, 'ORDER_DELIVERED', 'Order Delivered', 'Your pharmacy order has been delivered.']);
    }

    res.json({ success: true, message: 'Order updated successfully.' });
  } catch (error) {
    console.error('[PATCH /api/orders/:id]', error);
    res.status(500).json({ error: 'Failed to update order.' });
  }
});

// ─── PATCH /api/user/profile ────────────────────────────────────────────────
router.patch('/user/profile', async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.userId;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    await pool.query(
      'UPDATE User SET name = ?, phone = ?, updatedAt = NOW() WHERE id = ?',
      [name.trim(), phone || null, userId]
    );
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('[PATCH /api/user/profile]', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ─── PATCH /api/user/insurance ──────────────────────────────────────────────
router.patch('/user/insurance', async (req, res) => {
  try {
    const { insuranceProvider, planName, memberId } = req.body;
    const userId = req.user.userId;
    await pool.query(
      'UPDATE User SET insuranceProvider = ?, planName = ?, memberId = ?, updatedAt = NOW() WHERE id = ?',
      [insuranceProvider || null, planName || null, memberId || null, userId]
    );
    res.json({ success: true, message: 'Insurance details updated successfully.' });
  } catch (error) {
    console.error('[PATCH /api/user/insurance]', error);
    res.status(500).json({ error: 'Failed to update insurance details.' });
  }
});

// ─── PATCH /api/user/onboarding-complete ────────────────────────────────────
router.patch('/user/onboarding-complete', async (req, res) => {
  try {
    const userId = req.user.userId;
    await pool.query(
      'UPDATE User SET onboardingComplete = TRUE, updatedAt = NOW() WHERE id = ?',
      [userId]
    );
    res.json({ success: true, message: 'Onboarding completed.' });
  } catch (error) {
    console.error('[PATCH /api/user/onboarding-complete]', error);
    res.status(500).json({ error: 'Failed to complete onboarding.' });
  }
});

export default router;
