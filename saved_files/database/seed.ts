import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with exact data from the image...');

  // Clean existing database records
  await prisma.caregiverAlert.deleteMany({});
  await prisma.priorAuth.deleteMany({});
  await prisma.pharmacyOrder.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.careCircleMember.deleteMany({});
  await prisma.user.deleteMany({});

  // Create main patient user 'John'
  const user = await prisma.user.create({
    data: {
      name: 'John',
      email: 'john@example.com',
      passwordHash: 'password', // Simple password
      role: 'PATIENT',
    },
  });

  // Create caregiver 'Anna' and doctor 'Dr. Patel'
  const anna = await prisma.user.create({
    data: {
      name: 'Anna',
      email: 'anna@example.com',
      passwordHash: 'password',
      role: 'CAREGIVER',
    },
  });

  const drPatel = await prisma.user.create({
    data: {
      name: 'Dr. Patel',
      email: 'dr.patel@clinic.com',
      passwordHash: 'password',
      role: 'CAREGIVER',
    },
  });

  // Create CareCircle relations
  await prisma.careCircleMember.createMany({
    data: [
      { patientId: user.id, caregiverId: drPatel.id, relationship: 'Doctor', permission: 'FULL_ACCESS' },
      { patientId: user.id, caregiverId: anna.id, relationship: 'Anna (Caregiver)', permission: 'ACTION_ENABLED' },
    ],
  });

  // Create Medications matching the image
  // 1. Atorsattatin (Lipitor) - Refill in 2 Days
  const med1 = await prisma.medication.create({
    data: {
      userId: user.id,
      brandName: 'Atorsattatin',
      genericName: 'Lipitor',
      dosage: '20mg',
      frequency: 'Once daily',
      pillCount: 2, // 2 days left
      totalPills: 30,
      status: 'LOW_SUPPLY',
      nextRefillDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  // 2. Metformin 1000mg - Refill Scheduled for 07/15
  const med2 = await prisma.medication.create({
    data: {
      userId: user.id,
      brandName: 'Metformin',
      genericName: 'Glucophage',
      dosage: '1000mg',
      frequency: 'Twice daily',
      pillCount: 25,
      totalPills: 60,
      status: 'ACTIVE',
      nextRefillDate: new Date('2026-07-15T00:00:00.000Z'),
    },
  });

  // 3. Ozempic (for prior auth)
  const med3 = await prisma.medication.create({
    data: {
      userId: user.id,
      brandName: 'Ozempic',
      genericName: 'Semaglutide',
      dosage: '0.5mg',
      frequency: 'Once weekly',
      pillCount: 4,
      totalPills: 4,
      status: 'ACTIVE',
    },
  });

  // 4. Advair (for prior auth)
  const med4 = await prisma.medication.create({
    data: {
      userId: user.id,
      brandName: 'Advair Inhaler',
      genericName: 'Fluticasone/Salmeterol',
      dosage: '250/50mcg',
      frequency: 'Twice daily',
      pillCount: 1,
      totalPills: 1,
      status: 'ACTIVE',
    },
  });

  // 5. Zoloft (for prior auth approved)
  const med5 = await prisma.medication.create({
    data: {
      userId: user.id,
      brandName: 'Zoloft',
      genericName: 'Sertraline',
      dosage: '50mg',
      frequency: 'Once daily',
      pillCount: 8,
      totalPills: 30,
      status: 'PENDING_REFILL',
      nextRefillDate: new Date('2026-05-28T00:00:00.000Z'),
    },
  });

  // Create Prior Authorizations matching the image
  await prisma.priorAuth.create({
    data: {
      userId: user.id,
      medicationId: med3.id,
      insurer: 'Blue Cross Blue Shield',
      status: 'PENDING', // Pending Insurance Review
      expectedDecisionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.priorAuth.create({
    data: {
      userId: user.id,
      medicationId: med4.id,
      insurer: 'Blue Cross Blue Shield',
      status: 'SUBMITTED', // Doctor's Submission Sent
      expectedDecisionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.priorAuth.create({
    data: {
      userId: user.id,
      medicationId: med5.id,
      insurer: 'Blue Cross Blue Shield',
      status: 'APPROVED', // Prior Auth Approved
      expectedDecisionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Create Pharmacy Order Tracking matching the image
  // Order Placed + Processing completed, Out for Delivery active, Expected: Friday, July 12
  await prisma.pharmacyOrder.create({
    data: {
      userId: user.id,
      pharmacyId: 'CVS Pharmacy — Main St',
      status: 'OUT_FOR_DELIVERY',
      deliveryType: 'DELIVERY',
      expectedDate: new Date('2026-07-12T00:00:00.000Z'),
      cost: 24.99,
    },
  });

  // Create a pickup order for Walgreens
  await prisma.pharmacyOrder.create({
    data: {
      userId: user.id,
      pharmacyId: 'Walgreens — Oak Ave',
      status: 'PROCESSING',
      deliveryType: 'PICKUP',
      expectedDate: new Date('2026-05-22T00:00:00.000Z'),
      cost: 45.00,
      createdAt: new Date('2026-05-18T00:00:00.000Z'),
    },
  });


  // Create Caregiver Updates matching the image
  // "Anna marked 'Evening Dose Administered' 10 mins ago"
  await prisma.caregiverAlert.create({
    data: {
      userId: user.id,
      caregiverId: anna.id,
      actionType: 'DOSE',
      action: 'marked "Evening Dose Administered"',
    },
  });

  console.log('Database seeded with image data successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
