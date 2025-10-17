require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkGuideServices() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    // Check operator_guide_services structure
    const [cols] = await connection.execute('DESCRIBE operator_guide_services');
    console.log('=== OPERATOR_GUIDE_SERVICES TABLE ===');
    cols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

    // Get sample data
    const [data] = await connection.execute('SELECT * FROM operator_guide_services LIMIT 3');
    console.log('\n=== SAMPLE DATA ===');
    data.forEach(g => {
      console.log(`Guide ID: ${g.id}`);
      console.log(`  Operator ID: ${g.operator_id || 'N/A'}`);
      console.log(`  Name: ${g.name || g.full_name || 'N/A'}`);
      console.log(`  Languages: ${g.languages || 'N/A'}`);
      console.log(`  Specialization: ${g.specialization || 'N/A'}`);
      console.log('');
    });

    // Check guide_price_variations
    try {
      const [priceCols] = await connection.execute('DESCRIBE guide_price_variations');
      console.log('=== GUIDE_PRICE_VARIATIONS TABLE ===');
      priceCols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

      const [prices] = await connection.execute('SELECT * FROM guide_price_variations LIMIT 2');
      console.log('\n=== SAMPLE PRICE DATA ===');
      console.log(prices);
    } catch (e) {
      console.log('\n⚠️  guide_price_variations table structure check failed');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkGuideServices();
