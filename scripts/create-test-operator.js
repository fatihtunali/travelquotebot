/**
 * Script to create a test operator account for CRUD testing
 *
 * Usage: node scripts/create-test-operator.js
 */

// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database configuration from environment
const DB_CONFIG = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: parseInt(process.env.DATABASE_PORT || '3306')
};

// Validate configuration
if (!DB_CONFIG.host || !DB_CONFIG.user || !DB_CONFIG.password || !DB_CONFIG.database) {
  console.error('❌ Error: Database configuration missing in .env file');
  console.error('   Required: DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME');
  process.exit(1);
}

async function createTestOperator() {
  let connection;

  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database\n');

    // Check if test organization already exists
    const [existingOrg] = await connection.query(
      'SELECT id FROM organizations WHERE slug = ?',
      ['test-operator']
    );

    let orgId;

    if (existingOrg.length > 0) {
      orgId = existingOrg[0].id;
      console.log(`ℹ️  Test organization already exists (ID: ${orgId})\n`);
    } else {
      // Create test organization
      console.log('📝 Creating test organization...');
      const [orgResult] = await connection.query(
        `INSERT INTO organizations (name, slug, email, phone, country, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Test Tour Operator', 'test-operator', 'test@example.com', '+1234567890', 'Turkey', 'active']
      );
      orgId = orgResult.insertId;
      console.log(`✅ Test organization created (ID: ${orgId})\n`);

      // Create subscription
      console.log('📝 Creating subscription...');
      await connection.query(
        `INSERT INTO subscriptions (organization_id, plan_type, monthly_credits, price, status, current_period_start, current_period_end)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 MONTH))`,
        [orgId, 'professional', 100, 99.00, 'active']
      );
      console.log('✅ Subscription created\n');

      // Create credits
      console.log('📝 Creating credits...');
      await connection.query(
        `INSERT INTO organization_credits (organization_id, credits_total, credits_used, reset_date)
         VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 1 MONTH))`,
        [orgId, 100, 0]
      );
      console.log('✅ Credits created\n');
    }

    // Check if test operator already exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ? AND organization_id = ?',
      ['operator@test.com', orgId]
    );

    if (existingUser.length > 0) {
      console.log('ℹ️  Test operator already exists\n');
      console.log('✅ Test operator credentials:');
      console.log('   Email: operator@test.com');
      console.log('   Password: test123');
      console.log(`   Organization ID: ${orgId}\n`);
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash('test123', 10);
    console.log('✅ Password hashed\n');

    // Create test operator
    console.log('📝 Creating test operator...');
    const [userResult] = await connection.query(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orgId, 'operator@test.com', passwordHash, 'Test', 'Operator', 'org_admin', 'active']
    );
    console.log(`✅ Test operator created (ID: ${userResult.insertId})\n`);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ TEST OPERATOR ACCOUNT CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\nTest Operator Credentials:');
    console.log('  Email: operator@test.com');
    console.log('  Password: test123');
    console.log(`  Organization ID: ${orgId}`);
    console.log('  Role: org_admin\n');
    console.log('Use these credentials to run CRUD tests:');
    console.log('  runAllCRUDTests("operator@test.com", "test123")');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createTestOperator();
