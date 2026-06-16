import mysql from 'mysql2/promise';

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '8828064828',
    });
    console.log('Connected to MySQL server.');

    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS scriptly;');
    console.log('Database "scriptly" created/verified successfully.');

    // Switch to database
    await connection.query('USE scriptly;');
    console.log('Switched to "scriptly" database.');

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
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
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
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      );
    `);
    console.log('Table "CareCircleMember" verified.');

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

    await connection.end();
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

createDatabase();
