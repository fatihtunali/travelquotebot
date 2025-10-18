const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: '188.132.230.193',
    port: 3306,
    user: 'tqb',
    password: 'Dlr235672.-Yt',
    database: 'tqb_db',
    multipleStatements: true
  });

  try {
    console.log('Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database_migrations', '03_quote_management_system.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration 03: Quote Management System...');

    // Execute migration
    await connection.query(sql);

    console.log('✅ Migration completed successfully!');

    // Verify tables were created
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'quote_%'
    `);

    console.log('\nCreated tables:');
    tables.forEach(row => {
      console.log('  -', Object.values(row)[0]);
    });

    // Show table structures
    console.log('\n📋 Table Structures:');

    const [quoteDaysColumns] = await connection.query('DESCRIBE quote_days');
    console.log('\nquote_days:');
    quoteDaysColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    const [quoteExpensesColumns] = await connection.query('DESCRIBE quote_expenses');
    console.log('\nquote_expenses:');
    quoteExpensesColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    const [pricingTiersColumns] = await connection.query('DESCRIBE pricing_tiers');
    console.log('\npricing_tiers:');
    pricingTiersColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
