import { pool } from './src/db.js';

async function reset() {
  try {
    console.log('Resetting Atorvastatin status to LOW_SUPPLY...');
    const [result] = await pool.query(
      "UPDATE Medication SET status = 'LOW_SUPPLY', pillCount = 5 WHERE brandName LIKE '%Atorvastatin%' OR brandName LIKE '%Lipitor%'"
    );
    console.log(`Updated ${result.affectedRows} row(s).`);

    // We can also reset all pending refills if requested
    const [result2] = await pool.query(
      "UPDATE Medication SET status = 'LOW_SUPPLY', pillCount = 5 WHERE status = 'PENDING_REFILL'"
    );
    console.log(`Reset ${result2.affectedRows} pending refill row(s).`);

    // Let's also delete the pending refill requests so they can request it again
    const [result3] = await pool.query(
      "DELETE FROM RefillRequest WHERE status = 'PENDING'"
    );
    console.log(`Deleted ${result3.affectedRows} pending RefillRequest row(s).`);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

reset();
