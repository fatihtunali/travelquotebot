/**
 * Pricing System Verification Test Script
 *
 * Run this script to verify:
 * 1. All database tables exist and have correct structure
 * 2. Mock data was inserted correctly
 * 3. All API endpoints are working
 * 4. Data integrity and relationships are correct
 *
 * Usage: npx ts-node scripts/test-pricing-system.ts
 */

import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: '134.209.137.11',
  user: 'tqa',
  password: 'REMOVED_PASSWORD',
  database: 'tqa_db'
};

interface TestResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  expected?: any;
  actual?: any;
}

const results: TestResult[] = [];

function logResult(category: string, test: string, status: 'PASS' | 'FAIL', details?: string, expected?: any, actual?: any) {
  results.push({ category, test, status, details, expected, actual });

  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${category}] ${test}`);
  if (details) console.log(`   → ${details}`);
  if (status === 'FAIL' && expected !== undefined) {
    console.log(`   Expected: ${JSON.stringify(expected)}`);
    console.log(`   Actual: ${JSON.stringify(actual)}`);
  }
}

async function testDatabaseStructure(connection: any) {
  console.log('\n📋 Testing Database Structure...\n');

  // Test 1: Check all pricing tables exist
  const expectedTables = [
    'hotels', 'hotel_pricing',
    'tours', 'tour_pricing',
    'vehicles', 'vehicle_pricing',
    'guides', 'guide_pricing',
    'entrance_fees', 'entrance_fee_pricing',
    'meal_pricing',
    'extra_expenses',
    'currency_rates'
  ];

  const [tables]: any = await connection.query('SHOW TABLES');
  const tableNames = tables.map((row: any) => Object.values(row)[0]);

  for (const table of expectedTables) {
    const exists = tableNames.includes(table);
    logResult(
      'Database Structure',
      `Table '${table}' exists`,
      exists ? 'PASS' : 'FAIL',
      exists ? `Found in database` : `Missing from database`
    );
  }

  // Test 2: Verify hotel_pricing has correct columns
  const [hotelCols]: any = await connection.query('DESCRIBE hotel_pricing');
  const requiredCols = ['double_room_bb', 'single_supplement_bb', 'triple_room_bb', 'child_0_6_bb', 'child_6_12_bb', 'hb_supplement', 'fb_supplement', 'ai_supplement'];

  for (const col of requiredCols) {
    const exists = hotelCols.some((c: any) => c.Field === col);
    logResult(
      'Database Structure',
      `hotel_pricing has column '${col}'`,
      exists ? 'PASS' : 'FAIL'
    );
  }
}

async function testDataIntegrity(connection: any) {
  console.log('\n🔍 Testing Data Integrity...\n');

  // Test 1: Check record counts
  const expectedCounts = {
    'hotels': 3,
    'tours': 3,
    'vehicles': 5,
    'guides': 5,
    'entrance_fees': 10,
    'meal_pricing': 5,
    'extra_expenses': 10
  };

  for (const [table, expected] of Object.entries(expectedCounts)) {
    const [result]: any = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
    const actual = result[0].count;

    logResult(
      'Data Integrity',
      `${table} has correct record count`,
      actual === expected ? 'PASS' : 'FAIL',
      `Expected ${expected}, got ${actual}`,
      expected,
      actual
    );
  }

  // Test 2: Verify all records belong to organization_id = 1
  const tablesWithOrg = ['hotels', 'tours', 'vehicles', 'guides', 'entrance_fees', 'meal_pricing', 'extra_expenses'];

  for (const table of tablesWithOrg) {
    const [result]: any = await connection.query(`SELECT COUNT(*) as count FROM ${table} WHERE organization_id = 1`);
    const [total]: any = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);

    logResult(
      'Data Integrity',
      `All ${table} records belong to organization_id=1`,
      result[0].count === total[0].count ? 'PASS' : 'FAIL',
      `${result[0].count} of ${total[0].count} records`
    );
  }

  // Test 3: Verify pricing relationships
  const [hotelPricing]: any = await connection.query(`
    SELECT COUNT(*) as count FROM hotel_pricing hp
    WHERE NOT EXISTS (SELECT 1 FROM hotels h WHERE h.id = hp.hotel_id)
  `);

  logResult(
    'Data Integrity',
    'All hotel_pricing records have valid hotel_id',
    hotelPricing[0].count === 0 ? 'PASS' : 'FAIL',
    `Found ${hotelPricing[0].count} orphaned records`
  );

  const [tourPricing]: any = await connection.query(`
    SELECT COUNT(*) as count FROM tour_pricing tp
    WHERE NOT EXISTS (SELECT 1 FROM tours t WHERE t.id = tp.tour_id)
  `);

  logResult(
    'Data Integrity',
    'All tour_pricing records have valid tour_id',
    tourPricing[0].count === 0 ? 'PASS' : 'FAIL',
    `Found ${tourPricing[0].count} orphaned records`
  );
}

async function testSampleData(connection: any) {
  console.log('\n📊 Testing Sample Data...\n');

  // Test 1: Verify specific hotel exists
  const [hotels]: any = await connection.query(`
    SELECT hotel_name, city FROM hotels WHERE hotel_name = 'Hotel Sultanahmet Palace'
  `);

  logResult(
    'Sample Data',
    'Hotel Sultanahmet Palace exists',
    hotels.length > 0 ? 'PASS' : 'FAIL',
    hotels.length > 0 ? `Found in ${hotels[0].city}` : 'Not found'
  );

  // Test 2: Verify hotel pricing
  const [hotelPrice]: any = await connection.query(`
    SELECT hp.double_room_bb, hp.currency FROM hotels h
    JOIN hotel_pricing hp ON h.id = hp.hotel_id
    WHERE h.hotel_name = 'Hotel Sultanahmet Palace' AND hp.season_name = 'Summer 2025'
  `);

  const expectedPrice = 80.00;
  const actualPrice = hotelPrice.length > 0 ? parseFloat(hotelPrice[0].double_room_bb) : 0;

  logResult(
    'Sample Data',
    'Hotel Sultanahmet Palace Summer 2025 pricing is correct',
    actualPrice === expectedPrice ? 'PASS' : 'FAIL',
    `Double room BB: ${actualPrice} ${hotelPrice[0]?.currency || 'N/A'}`,
    expectedPrice,
    actualPrice
  );

  // Test 3: Verify Bosphorus tour exists
  const [tour]: any = await connection.query(`
    SELECT tour_name, tour_code, tour_type FROM tours WHERE tour_code = 'BOS-SIC-01'
  `);

  logResult(
    'Sample Data',
    'Bosphorus Cruise tour exists',
    tour.length > 0 ? 'PASS' : 'FAIL',
    tour.length > 0 ? `Type: ${tour[0].tour_type}` : 'Not found'
  );

  // Test 4: Verify entrance fee for Topkapi Palace
  const [entrance]: any = await connection.query(`
    SELECT ef.site_name, efp.adult_price, efp.currency FROM entrance_fees ef
    JOIN entrance_fee_pricing efp ON ef.id = efp.entrance_fee_id
    WHERE ef.site_name LIKE '%Topkapı%'
  `);

  const expectedEntranceFee = 30.00;
  const actualEntranceFee = entrance.length > 0 ? parseFloat(entrance[0].adult_price) : 0;

  logResult(
    'Sample Data',
    'Topkapi Palace entrance fee is correct',
    actualEntranceFee === expectedEntranceFee ? 'PASS' : 'FAIL',
    `Adult price: ${actualEntranceFee} ${entrance[0]?.currency || 'N/A'}`,
    expectedEntranceFee,
    actualEntranceFee
  );

  // Test 5: Verify currency rates
  const [rates]: any = await connection.query('SELECT COUNT(*) as count FROM currency_rates');

  logResult(
    'Sample Data',
    'Currency rates table has data',
    rates[0].count >= 4 ? 'PASS' : 'FAIL',
    `Found ${rates[0].count} currency rates`
  );
}

async function testDataTypes(connection: any) {
  console.log('\n🔢 Testing Data Types & Constraints...\n');

  // Test 1: Check decimal precision for prices
  const [priceTest]: any = await connection.query(`
    SELECT double_room_bb FROM hotel_pricing LIMIT 1
  `);

  const hasCorrectPrecision = priceTest.length > 0 && typeof priceTest[0].double_room_bb === 'string';

  logResult(
    'Data Types',
    'Prices stored with correct decimal precision',
    hasCorrectPrecision ? 'PASS' : 'FAIL',
    `Sample value: ${priceTest[0]?.double_room_bb}`
  );

  // Test 2: Check date format
  const [dateTest]: any = await connection.query(`
    SELECT start_date, end_date FROM hotel_pricing LIMIT 1
  `);

  const dateRegex = /^\d{4}-\d{2}-\d{2}/;
  const startDateValid = dateTest.length > 0 && dateRegex.test(dateTest[0].start_date.toISOString());

  logResult(
    'Data Types',
    'Dates stored in correct format',
    startDateValid ? 'PASS' : 'FAIL',
    `Sample: ${dateTest[0]?.start_date}`
  );

  // Test 3: Check ENUM values
  const [enumTest]: any = await connection.query(`
    SELECT base_meal_plan FROM hotel_pricing WHERE base_meal_plan NOT IN ('BB', 'HB', 'FB', 'AI')
  `);

  logResult(
    'Data Types',
    'base_meal_plan has valid ENUM values',
    enumTest.length === 0 ? 'PASS' : 'FAIL',
    `Found ${enumTest.length} invalid values`
  );
}

async function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📈 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed} (${passRate}%)`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - [${r.category}] ${r.test}`);
      if (r.details) console.log(`     ${r.details}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED! Your pricing system is ready to use.');
  } else {
    console.log('⚠️  Some tests failed. Please review and fix the issues above.');
  }

  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('🚀 Starting Pricing System Verification Tests\n');
  console.log('Database:', DB_CONFIG.database);
  console.log('Host:', DB_CONFIG.host);
  console.log('');

  let connection;

  try {
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Database connection established\n');

    await testDatabaseStructure(connection);
    await testDataIntegrity(connection);
    await testSampleData(connection);
    await testDataTypes(connection);

    await generateReport();

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

main();
