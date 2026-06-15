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
    await connection.query('CREATE DATABASE IF NOT EXISTS scriptly;');
    console.log('Database "scriptly" created successfully.');
    await connection.end();
  } catch (error) {
    console.error('Failed to create database:', error);
    process.exit(1);
  }
}

createDatabase();
