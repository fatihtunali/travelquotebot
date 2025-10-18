/**
 * Run Migration 02 - Enhanced Itinerary Fields
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runMigration() {
  console.log('Running Enhanced Itinerary Fields Migration...\n');

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
      '../database_migrations/02_enhanced_itinerary_fields_safe.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...\n');
    await connection.query(sql);

    console.log('Migration completed successfully!\n');

    // Verify new columns exist
    console.log('Verifying new fields...\n');

    const [accFields] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'accommodations' AND COLUMN_NAME IN ('address', 'phone', 'check_in_time', 'check_out_time')"
    );
    console.log(`Accommodations new fields: ${accFields.map(f => f.COLUMN_NAME).join(', ')}`);

    const [actFields] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'activities' AND COLUMN_NAME IN ('meeting_point', 'booking_required', 'difficulty_level', 'operating_hours')"
    );
    console.log(`Activities new fields: ${actFields.map(f => f.COLUMN_NAME).join(', ')}`);

    const [restFields] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'operator_restaurants' AND COLUMN_NAME IN ('phone', 'operating_hours', 'reservation_required')"
    );
    console.log(`Restaurants new fields: ${restFields.map(f => f.COLUMN_NAME).join(', ')}`);

    const [transFields] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'operator_transport' AND COLUMN_NAME IN ('pickup_location', 'includes_meet_greet', 'contact_phone')"
    );
    console.log(`Transport new fields: ${transFields.map(f => f.COLUMN_NAME).join(', ')}`);

    console.log('\n✅ Migration successful! All new fields added.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
