/**
 * Database Migration Runner
 * Runs the operator pricing migration
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config();

const requiredEnvVars = [
  'DATABASE_HOST',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
];

const missingEnv = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required database environment variables: ${missingEnv.join(', ')}`
  );
}

async function runMigration() {
  console.log('Starting database migration...\n');

  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    multipleStatements: true,
  });

  console.log('Connected to database\n');

  try {
    const migrationPath = path.join(
      __dirname,
      '../database_migrations/01_operator_pricing_setup.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration script...\n');

    await connection.query(sql);

    console.log('Migration executed successfully!\n');

    console.log('Verifying migration results...\n');

    const [accommodations] = await connection.query(
      "SELECT COUNT(*) as count FROM accommodations WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'"
    );
    console.log(
      `Accommodations linked to operator: ${accommodations[0].count}`
    );

    const [activities] = await connection.query(
      "SELECT COUNT(*) as count FROM activities WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'"
    );
    console.log(`Activities linked to operator: ${activities[0].count}`);

    const [transport] = await connection.query(
      "SELECT COUNT(*) as count FROM operator_transport WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'"
    );
    console.log(`Transport services created: ${transport[0].count}`);

    const [guides] = await connection.query(
      "SELECT COUNT(*) as count FROM operator_guide_services WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'"
    );
    console.log(`Guide services created: ${guides[0].count}`);

    const [restaurants] = await connection.query(
      "SELECT COUNT(*) as count FROM operator_restaurants WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'"
    );
    console.log(`Restaurant options created: ${restaurants[0].count}`);

    const [additional] = await connection.query(
      "SELECT COUNT(*) as count FROM operator_additional_services WHERE operator_id = 'ed58206d-f600-483b-b98a-79805310e9be'"
    );
    console.log(`Additional services created: ${additional[0].count}`);

    console.log('\nMigration completed successfully!');
    console.log('\nSummary:');
    console.log(`   - ${accommodations[0].count} accommodations`);
    console.log(`   - ${activities[0].count} activities`);
    console.log(`   - ${transport[0].count} transport services`);
    console.log(`   - ${guides[0].count} guide services`);
    console.log(`   - ${restaurants[0].count} restaurant options`);
    console.log(`   - ${additional[0].count} additional services`);
    console.log(
      `   TOTAL: ${
        accommodations[0].count +
        activities[0].count +
        transport[0].count +
        guides[0].count +
        restaurants[0].count +
        additional[0].count
      } services available\n`
    );
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

runMigration()
  .then(() => {
    console.log('\nAll done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });
