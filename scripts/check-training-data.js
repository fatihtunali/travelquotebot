// Quick script to check training itineraries in database
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkTrainingData() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  console.log('Connected to database!\n');

  // Check total count
  const [countResult] = await connection.execute(
    'SELECT COUNT(*) as total FROM training_itineraries'
  );
  console.log(`📊 Total training itineraries: ${countResult[0].total}\n`);

  // Check breakdown by days and tour type
  const [breakdown] = await connection.execute(`
    SELECT days, tour_type, COUNT(*) as count
    FROM training_itineraries
    GROUP BY days, tour_type
    ORDER BY days, tour_type
  `);

  console.log('📋 Breakdown by duration and tour type:');
  console.table(breakdown);

  // Show sample titles
  const [samples] = await connection.execute(`
    SELECT title, days, cities, tour_type, LENGTH(content) as content_length, created_at
    FROM training_itineraries
    ORDER BY created_at DESC
    LIMIT 5
  `);

  console.log('\n📝 Sample itineraries (most recent 5):');
  console.table(samples);

  await connection.end();
}

checkTrainingData().catch(console.error);
