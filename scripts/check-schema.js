require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    console.log('Checking database schema...\n');

    // Check accommodations table
    const [accCols] = await connection.execute(
      'DESCRIBE accommodations'
    );
    console.log('=== ACCOMMODATIONS TABLE ===');
    accCols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

    // Check if room_rates table exists
    try {
      const [rrCols] = await connection.execute(
        'DESCRIBE accommodation_room_rates'
      );
      console.log('\n=== ACCOMMODATION_ROOM_RATES TABLE ===');
      rrCols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
    } catch (e) {
      console.log('\n⚠️  accommodation_room_rates table does not exist');
    }

    // Check price variations
    try {
      const [pvCols] = await connection.execute(
        'DESCRIBE accommodation_price_variations'
      );
      console.log('\n=== ACCOMMODATION_PRICE_VARIATIONS TABLE ===');
      pvCols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
    } catch (e) {
      console.log('\n⚠️  accommodation_price_variations table does not exist');
    }

    // Check activities
    const [actCols] = await connection.execute(
      'DESCRIBE activities'
    );
    console.log('\n=== ACTIVITIES TABLE ===');
    actCols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

    // Check activity price variations
    try {
      const [apvCols] = await connection.execute(
        'DESCRIBE activity_price_variations'
      );
      console.log('\n=== ACTIVITY_PRICE_VARIATIONS TABLE ===');
      apvCols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
    } catch (e) {
      console.log('\n⚠️  activity_price_variations table does not exist');
    }

    // Check transport
    const [transCols] = await connection.execute(
      'DESCRIBE operator_transport'
    );
    console.log('\n=== OPERATOR_TRANSPORT TABLE ===');
    transCols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

    // Check restaurants
    const [restCols] = await connection.execute(
      'DESCRIBE operator_restaurants'
    );
    console.log('\n=== OPERATOR_RESTAURANTS TABLE ===');
    restCols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkSchema();
