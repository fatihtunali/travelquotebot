import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface TestResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  expected?: any;
  actual?: any;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const results: TestResult[] = [];

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

    const [tables]: any = await pool.query('SHOW TABLES');
    const tableNames = tables.map((row: any) => Object.values(row)[0]);

    for (const table of expectedTables) {
      const exists = tableNames.includes(table);
      results.push({
        category: 'Database Structure',
        test: `Table '${table}' exists`,
        status: exists ? 'PASS' : 'FAIL',
        details: exists ? 'Found in database' : 'Missing from database'
      });
    }

    // Test 2: Check record counts
    const expectedCounts: Record<string, number> = {
      'hotels': 3,
      'tours': 3,
      'vehicles': 5,
      'guides': 5,
      'entrance_fees': 10,
      'meal_pricing': 5,
      'extra_expenses': 10
    };

    for (const [table, expected] of Object.entries(expectedCounts)) {
      const [result]: any = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      const actual = result[0].count;

      results.push({
        category: 'Data Integrity',
        test: `${table} has correct record count`,
        status: actual === expected ? 'PASS' : 'FAIL',
        details: `Expected ${expected}, got ${actual}`,
        expected,
        actual
      });
    }

    // Test 3: Verify specific data
    const [hotels]: any = await pool.query(`
      SELECT hotel_name FROM hotels WHERE hotel_name = 'Hotel Sultanahmet Palace'
    `);

    results.push({
      category: 'Sample Data',
      test: 'Hotel Sultanahmet Palace exists',
      status: hotels.length > 0 ? 'PASS' : 'FAIL',
      details: hotels.length > 0 ? 'Found in database' : 'Not found'
    });

    const [hotelPrice]: any = await pool.query(`
      SELECT hp.double_room_bb FROM hotels h
      JOIN hotel_pricing hp ON h.id = hp.hotel_id
      WHERE h.hotel_name = 'Hotel Sultanahmet Palace' AND hp.season_name = 'Summer 2025'
    `);

    const expectedPrice = 80.00;
    const actualPrice = hotelPrice.length > 0 ? parseFloat(hotelPrice[0].double_room_bb) : 0;

    results.push({
      category: 'Sample Data',
      test: 'Hotel pricing is correct',
      status: actualPrice === expectedPrice ? 'PASS' : 'FAIL',
      details: `Double room BB: €${actualPrice}`,
      expected: expectedPrice,
      actual: actualPrice
    });

    // Calculate summary
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const total = results.length;
    const passRate = parseFloat(((passed / total) * 100).toFixed(1));

    return NextResponse.json({
      summary: {
        total,
        passed,
        failed,
        passRate
      },
      results
    });

  } catch (error) {
    console.error('Error running tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
