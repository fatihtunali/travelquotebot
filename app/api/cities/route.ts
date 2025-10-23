import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/cities?search=ist
 * Returns distinct cities from pricing tables
 * Public endpoint - no auth required for trip planning
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Get distinct cities from all pricing tables
    const query = `
      SELECT DISTINCT city
      FROM (
        SELECT city FROM hotels WHERE status = 'active' AND city IS NOT NULL
        UNION
        SELECT city FROM tours WHERE status = 'active' AND city IS NOT NULL
        UNION
        SELECT city FROM guides WHERE status = 'active' AND city IS NOT NULL
        UNION
        SELECT city FROM entrance_fees WHERE status = 'active' AND city IS NOT NULL
        UNION
        SELECT city FROM vehicles WHERE status = 'active' AND city IS NOT NULL
        UNION
        SELECT city FROM extra_expenses WHERE city IS NOT NULL AND city != ''
      ) AS all_cities
      WHERE city LIKE ?
      ORDER BY city
      LIMIT 20
    `;

    const [rows] = await pool.query(query, [`%${search}%`]);
    const cities = (rows as any[]).map(row => row.city);

    return NextResponse.json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}
