import { pool } from './src/db.js';

async function updateToAI() {
  try {
    console.log('Updating Anna to Scriptly AI in User table...');
    const [result] = await pool.query(
      `UPDATE User SET name = 'Scriptly AI', email = 'ai@scriptly.com' WHERE name = 'Anna'`
    );
    console.log(`Updated ${result.affectedRows} user(s).`);

    console.log('Updating CareCircleMember relationship...');
    const [result2] = await pool.query(
      `UPDATE CareCircleMember SET relationship = 'AI Health Assistant' WHERE relationship LIKE '%Anna%'`
    );
    console.log(`Updated ${result2.affectedRows} care circle member(s).`);

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateToAI();
