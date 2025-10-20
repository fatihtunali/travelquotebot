// Script to add quality_score column and mark all 62 itineraries as high-quality
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function runMigration() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    console.log('✓ Connected to database\n');

    // Step 1: Check if column exists
    console.log('Step 1: Checking if quality_score column exists...');
    try {
      await connection.query('SELECT quality_score FROM training_itineraries LIMIT 1');
      console.log('✓ quality_score column already exists\n');
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('Adding quality_score column...');
        await connection.query(`
          ALTER TABLE training_itineraries
          ADD COLUMN quality_score TINYINT DEFAULT 3 COMMENT 'Quality rating 1-5, prioritizes training examples'
        `);
        console.log('✓ Added quality_score column\n');
      } else {
        throw error;
      }
    }

    // Step 2: Create index
    console.log('Step 2: Creating index for faster queries...');
    try {
      await connection.query(`
        CREATE INDEX idx_training_quality
        ON training_itineraries(days, tour_type, quality_score DESC)
      `);
      console.log('✓ Created quality_score index\n');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('✓ Index already exists\n');
      } else {
        throw error;
      }
    }

    // Step 3: Mark all as high-quality
    console.log('Step 3: Marking all 62 itineraries as high-quality (proven sellers)...');
    const [updateResult] = await connection.query(`
      UPDATE training_itineraries
      SET quality_score = 4
      WHERE quality_score IS NULL OR quality_score = 3
    `);
    console.log(`✓ Updated ${updateResult.affectedRows} itineraries to quality_score = 4\n`);

    // Step 4: Show stats
    console.log('Step 4: Training data statistics:');
    const [stats] = await connection.query(`
      SELECT
        COUNT(*) as total,
        AVG(quality_score) as avg_quality,
        SUM(CASE WHEN quality_score >= 4 THEN 1 ELSE 0 END) as high_quality_count,
        COUNT(DISTINCT days) as unique_durations
      FROM training_itineraries
    `);

    console.table(stats);

    console.log('\n✅ Migration completed successfully!');
    console.log('📚 All 62 professional itineraries (20 years of experience) are now prioritized for AI training\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
