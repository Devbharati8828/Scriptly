import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL is not defined in .env');

    // Connect directly via the full URL (already includes the target DB name)
    const connection = await mysql.createConnection(databaseUrl);
    console.log('Connected to cloud MySQL server.');

    // Create User Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS User (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'PATIENT',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      );
    `);
    console.log('Table "User" verified.');

    // Create Medication Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Medication (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        brandName VARCHAR(255) NOT NULL,
        genericName VARCHAR(255),
        dosage VARCHAR(255) NOT NULL,
        frequency VARCHAR(255) NOT NULL,
        pillCount INT DEFAULT 0,
        totalPills INT DEFAULT 30,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        pharmacyId VARCHAR(255),
        nextRefillDate DATETIME(3),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      );
    `);
    console.log('Table "Medication" verified.');

    // Create PharmacyOrder Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS PharmacyOrder (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        pharmacyId VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'PLACED',
        deliveryType VARCHAR(50) DEFAULT 'DELIVERY',
        expectedDate DATETIME(3),
        cost DOUBLE DEFAULT 0.0,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      );
    `);
    console.log('Table "PharmacyOrder" verified.');

    // Create PriorAuth Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS PriorAuth (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        medicationId VARCHAR(36) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        insurer VARCHAR(255) NOT NULL,
        expectedDecisionDate DATETIME(3),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (medicationId) REFERENCES Medication(id) ON DELETE CASCADE
      );
    `);
    console.log('Table "PriorAuth" verified.');

    // Create CareCircleMember Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS CareCircleMember (
        id VARCHAR(36) PRIMARY KEY,
        patientId VARCHAR(36) NOT NULL,
        caregiverId VARCHAR(36) NOT NULL,
        relationship VARCHAR(255) NOT NULL,
        permission VARCHAR(50) DEFAULT 'VIEW_ONLY',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (patientId) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (caregiverId) REFERENCES User(id) ON DELETE CASCADE
      );
    `);
    console.log('Table "CareCircleMember" verified.');

    // ── ALTER TABLE: add missing FKs to already-existing tables on live DB ────
    // These are safe to run repeatedly — they fail silently if the FK already exists.
    const alterStatements = [
      // PriorAuth.medicationId FK (was missing from initial schema)
      `ALTER TABLE PriorAuth
         ADD CONSTRAINT fk_priorauth_medication
         FOREIGN KEY (medicationId) REFERENCES Medication(id) ON DELETE CASCADE`,
      // CareCircleMember.patientId FK
      `ALTER TABLE CareCircleMember
         ADD CONSTRAINT fk_carecircle_patient
         FOREIGN KEY (patientId) REFERENCES User(id) ON DELETE CASCADE`,
      // CareCircleMember.caregiverId FK
      `ALTER TABLE CareCircleMember
         ADD CONSTRAINT fk_carecircle_caregiver
         FOREIGN KEY (caregiverId) REFERENCES User(id) ON DELETE CASCADE`,
    ];

    for (const stmt of alterStatements) {
      try {
        await connection.query(stmt);
        console.log('Applied FK constraint.');
      } catch (e) {
        // ER_DUP_KEYNAME (1061) or ER_FK_DUP_NAME (1826): constraint already exists — safe to ignore
        if (e.errno !== 1061 && e.errno !== 1826) throw e;
      }
    }
    console.log('Foreign key constraints verified.');

    // Create CaregiverAlert Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS CaregiverAlert (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        caregiverId VARCHAR(36) NOT NULL,
        actionType VARCHAR(50) NOT NULL,
        action VARCHAR(255) NOT NULL,
        timestamp DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      );
    `);
    console.log('Table "CaregiverAlert" verified.');

    // Create RefillRequest Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS RefillRequest (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        medicationId VARCHAR(36) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        requestedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (medicationId) REFERENCES Medication(id) ON DELETE CASCADE
      );
    `);
    console.log('Table "RefillRequest" verified.');

    // Create DoseLog Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS DoseLog (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        medicationId VARCHAR(36) NOT NULL,
        takenAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (medicationId) REFERENCES Medication(id) ON DELETE CASCADE
      );
    `);
    console.log('Table "DoseLog" verified.');

    console.log('Database initialization completed successfully.');
    await connection.end();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

createDatabase();
