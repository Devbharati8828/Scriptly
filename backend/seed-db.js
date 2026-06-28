import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined.');
}

async function main() {
  console.log('Seeding database with raw SQL...');
  const pool = mysql.createPool(databaseUrl);

  try {
    // Disable foreign key checks for easy truncation
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE CaregiverAlert');
    await pool.query('TRUNCATE TABLE PriorAuth');
    await pool.query('TRUNCATE TABLE PharmacyOrder');
    await pool.query('TRUNCATE TABLE Medication');
    await pool.query('TRUNCATE TABLE CareCircleMember');
    await pool.query('TRUNCATE TABLE User');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Cleaned existing database records.');

    // Fixed IDs to maintain relations
    const JOHN_ID = 'u1111111-1111-1111-1111-111111111111';
    const ANNA_ID = 'u2222222-2222-2222-2222-222222222222';
    const DRPATEL_ID = 'u3333333-3333-3333-3333-333333333333';

    const MED1_ID = 'm1111111-1111-1111-1111-111111111111';
    const MED2_ID = 'm2222222-2222-2222-2222-222222222222';
    const MED3_ID = 'm3333333-3333-3333-3333-333333333333';
    const MED4_ID = 'm4444444-4444-4444-4444-444444444444';
    const MED5_ID = 'm5555555-5555-5555-5555-555555555555';

    // Insert Users — hash the demo password properly so login works
    const demoHash = await bcrypt.hash('password', 12);
    await pool.query(`
      INSERT INTO User (id, name, email, passwordHash, role, insuranceProvider, planName, memberId, phone, onboardingComplete, createdAt, updatedAt)
      VALUES 
        (?, 'John', 'john@gmail.com', ?, 'PATIENT', 'Blue Cross Blue Shield', 'PPO Gold', 'BCBS-88421930', '+1 (555) 019-2834', 1, NOW(), NOW()),
        (?, 'Anna', 'anna@example.com', ?, 'CAREGIVER', NULL, NULL, NULL, NULL, 1, NOW(), NOW()),
        (?, 'Dr. Patel', 'dr.patel@clinic.com', ?, 'CAREGIVER', NULL, NULL, NULL, NULL, 1, NOW(), NOW())
    `, [JOHN_ID, demoHash, ANNA_ID, demoHash, DRPATEL_ID, demoHash]);
    console.log('Inserted users (passwords bcrypt-hashed).');

    // Insert CareCircleMember
    await pool.query(`
      INSERT INTO CareCircleMember (id, patientId, caregiverId, relationship, permission, createdAt, updatedAt)
      VALUES 
        (?, ?, ?, 'Doctor', 'FULL_ACCESS', NOW(), NOW()),
        (?, ?, ?, 'Anna (Caregiver)', 'ACTION_ENABLED', NOW(), NOW())
    `, [
      crypto.randomUUID(), JOHN_ID, DRPATEL_ID,
      crypto.randomUUID(), JOHN_ID, ANNA_ID
    ]);
    console.log('Inserted CareCircle members.');

    // Insert Medications
    const med1RefillDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const med2RefillDate = new Date('2026-07-15T00:00:00.000Z');
    const med5RefillDate = new Date('2026-05-28T00:00:00.000Z');

    await pool.query(`
      INSERT INTO Medication (id, userId, brandName, genericName, dosage, frequency, pillCount, totalPills, status, pharmacyId, nextRefillDate, createdAt, updatedAt)
      VALUES 
        (?, ?, 'Atorvastatin', 'Lipitor', '20mg', 'Once daily', 2, 30, 'LOW_SUPPLY', 'CVS Pharmacy — Main St', ?, NOW(), NOW()),
        (?, ?, 'Metformin', 'Glucophage', '1000mg', 'Twice daily', 25, 60, 'ACTIVE', 'CVS Pharmacy — Main St', ?, NOW(), NOW()),
        (?, ?, 'Ozempic', 'Semaglutide', '0.5mg', 'Once weekly', 4, 4, 'ACTIVE', 'Walgreens — Oak Ave', NULL, NOW(), NOW()),
        (?, ?, 'Advair Inhaler', 'Fluticasone/Salmeterol', '250/50mcg', 'Twice daily', 1, 1, 'ACTIVE', 'CVS Pharmacy — Main St', NULL, NOW(), NOW()),
        (?, ?, 'Zoloft', 'Sertraline', '50mg', 'Once daily', 8, 30, 'PENDING_REFILL', 'Walgreens — Oak Ave', ?, NOW(), NOW())
    `, [
      MED1_ID, JOHN_ID, med1RefillDate,
      MED2_ID, JOHN_ID, med2RefillDate,
      MED3_ID, JOHN_ID,
      MED4_ID, JOHN_ID,
      MED5_ID, JOHN_ID, med5RefillDate
    ]);
    console.log('Inserted medications.');

    // Insert PriorAuths
    const pa1DecisionDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const pa2DecisionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const pa3DecisionDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    await pool.query(`
      INSERT INTO PriorAuth (id, userId, medicationId, insurer, status, expectedDecisionDate, createdAt, updatedAt)
      VALUES 
        (?, ?, ?, 'Blue Cross Blue Shield', 'PENDING', ?, NOW(), NOW()),
        (?, ?, ?, 'Blue Cross Blue Shield', 'SUBMITTED', ?, NOW(), NOW()),
        (?, ?, ?, 'Blue Cross Blue Shield', 'APPROVED', ?, NOW(), NOW())
    `, [
      crypto.randomUUID(), JOHN_ID, MED3_ID, pa1DecisionDate,
      crypto.randomUUID(), JOHN_ID, MED4_ID, pa2DecisionDate,
      crypto.randomUUID(), JOHN_ID, MED5_ID, pa3DecisionDate
    ]);
    console.log('Inserted prior authorizations.');

    // Insert PharmacyOrders
    const order1ExpectedDate = new Date('2026-07-12T00:00:00.000Z');
    const order2ExpectedDate = new Date('2026-05-22T00:00:00.000Z');
    const order2CreatedDate = new Date('2026-05-18T00:00:00.000Z');
    const order3ExpectedDate = new Date('2026-05-15T00:00:00.000Z');
    const order3CreatedDate = new Date('2026-05-10T00:00:00.000Z');

    await pool.query(`
      INSERT INTO PharmacyOrder (id, userId, pharmacyId, status, deliveryType, expectedDate, cost, createdAt, updatedAt)
      VALUES 
        (?, ?, 'CVS Pharmacy — Main St', 'OUT_FOR_DELIVERY', 'DELIVERY', ?, 24.99, NOW(), NOW()),
        (?, ?, 'Walgreens — Oak Ave', 'PROCESSING', 'PICKUP', ?, 45.00, ?, NOW()),
        (?, ?, 'CVS Pharmacy — Main St', 'COMPLETED', 'DELIVERY', ?, 15.00, ?, NOW())
    `, [
      crypto.randomUUID(), JOHN_ID, order1ExpectedDate,
      crypto.randomUUID(), JOHN_ID, order2ExpectedDate, order2CreatedDate,
      crypto.randomUUID(), JOHN_ID, order3ExpectedDate, order3CreatedDate
    ]);
    console.log('Inserted pharmacy orders.');

    // Insert CaregiverAlerts
    const alert1Time = new Date(Date.now() - 10 * 60000); // 10 mins ago
    const alert2Time = new Date(Date.now() - 120 * 60000); // 2 hours ago
    const alert3Time = new Date(Date.now() - 24 * 60 * 60000); // Yesterday
    const alert4Time = new Date(Date.now() - 2 * 24 * 60 * 60000); // 2 days ago

    await pool.query(`
      INSERT INTO CaregiverAlert (id, userId, caregiverId, actionType, action, timestamp)
      VALUES 
        (?, ?, ?, 'DOSE', 'marked "Evening Dose Administered"', ?),
        (?, ?, ?, 'REFILL', 'requested early refill for Metformin 1000mg', ?),
        (?, ?, ?, 'PICKUP', 'picked up Lisinopril 10mg prescription from CVS', ?),
        (?, ?, ?, 'NOTE', 'approved dosage adjustment note for Ozempic 0.5mg', ?)
    `, [
      crypto.randomUUID(), JOHN_ID, ANNA_ID, alert1Time,
      crypto.randomUUID(), JOHN_ID, ANNA_ID, alert2Time,
      crypto.randomUUID(), JOHN_ID, ANNA_ID, alert3Time,
      crypto.randomUUID(), JOHN_ID, DRPATEL_ID, alert4Time
    ]);
    console.log('Inserted caregiver alerts.');

    console.log('Database seeded with raw SQL successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
