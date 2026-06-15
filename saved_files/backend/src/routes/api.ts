import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard summary data
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // For prototype, we'll just fetch the first patient
    const user = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }

    const medications = await prisma.medication.findMany({ where: { userId: user.id } });
    const orders = await prisma.pharmacyOrder.findMany({ where: { userId: user.id } });
    const priorAuths = await prisma.priorAuth.findMany({ where: { userId: user.id } });
    const alerts = await prisma.caregiverAlert.findMany({ where: { userId: user.id }, include: { user: true } });

    res.json({
      user,
      medications,
      orders,
      priorAuths,
      alerts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Medications routes
router.get('/medications', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
    const medications = await prisma.medication.findMany({ where: { userId: user?.id } });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

router.post('/medications', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
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

    const newMed = await prisma.medication.create({
      data: {
        userId: user.id,
        brandName,
        genericName,
        dosage,
        frequency,
        pillCount: count,
        totalPills: parseInt(totalPills) || 30,
        status,
        pharmacyId: pharmacyId || 'CVS Pharmacy — Main St',
        nextRefillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days out
      },
    });
    res.status(201).json(newMed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create medication' });
  }
});

router.patch('/medications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pillCount } = req.body;
    
    // Update status based on count
    let status = 'ACTIVE';
    if (pillCount === 0) {
      status = 'PENDING_REFILL';
    } else if (pillCount <= 5) {
      status = 'LOW_SUPPLY';
    }

    const updatedMed = await prisma.medication.update({
      where: { id },
      data: { 
        pillCount: parseInt(pillCount),
        status
      }
    });
    res.json(updatedMed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

export default router;
