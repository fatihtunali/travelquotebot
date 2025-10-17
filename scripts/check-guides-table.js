require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkGuidesTable() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    console.log('Checking guides table...\n');

    // Show all tables with 'guide' in the name
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE '%guide%'"
    );
    console.log('=== TABLES WITH "GUIDE" ===');
    tables.forEach(t => console.log(Object.values(t)[0]));

    // Try to describe the guides table
    try {
      const [cols] = await connection.execute('DESCRIBE guides');
      console.log('\n=== GUIDES TABLE STRUCTURE ===');
      cols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

      // Get sample data
      const [guides] = await connection.execute('SELECT * FROM guides LIMIT 3');
      console.log('\n=== SAMPLE GUIDES ===');
      guides.forEach(g => {
        console.log(`  - ${g.full_name || g.name} - ${g.specialization || g.languages}`);
      });
    } catch (e) {
      console.log('\n⚠️  "guides" table not found, trying other variations...');
    }

    // Try operator_guides_pricing or similar
    try {
      const [cols] = await connection.execute('DESCRIBE operator_guides_pricing');
      console.log('\n=== OPERATOR_GUIDES_PRICING TABLE ===');
      cols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));
    } catch (e) {
      // Ignore
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkGuidesTable();
