import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import PDFDocument from 'pdfkit';

const router = express.Router();

router.use(requireAuth);

// GET /api/reports/claims
router.get('/claims', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch user info for header
    const [users] = await pool.query('SELECT name, email FROM User WHERE id = ?', [userId]);
    const user = users[0];

    // Fetch medications
    const [meds] = await pool.query('SELECT id, brandName, dosage, frequency FROM Medication WHERE userId = ?', [userId]);
    
    // Fetch dose logs
    const [logs] = await pool.query(`
      SELECT d.takenAt, m.brandName 
      FROM DoseLog d 
      JOIN Medication m ON d.medicationId = m.id 
      WHERE d.userId = ?
      ORDER BY d.takenAt DESC
    `, [userId]);

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="claims_report.pdf"');
    
    // Pipe to response
    doc.pipe(res);

    // Add content
    doc.fontSize(20).text('Claims & Adherence Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Patient: ${user?.name || 'Unknown'}`);
    doc.text(`Email: ${user?.email || 'Unknown'}`);
    doc.text(`Generated At: ${new Date().toLocaleString()}`);
    doc.moveDown(2);

    doc.fontSize(16).text('Current Medications');
    doc.moveDown(0.5);
    meds.forEach(m => {
      doc.fontSize(12).text(`• ${m.brandName} - ${m.dosage} (${m.frequency})`);
    });
    doc.moveDown(2);

    doc.fontSize(16).text('Recent Dose Logs');
    doc.moveDown(0.5);
    if (logs.length === 0) {
      doc.fontSize(12).text('No recent dose logs found.');
    } else {
      logs.slice(0, 50).forEach(l => {
        doc.fontSize(12).text(`• ${l.brandName}: ${new Date(l.takenAt).toLocaleString()}`);
      });
    }

    doc.end();

  } catch (error) {
    console.error('Error generating claims report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
