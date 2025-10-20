import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Check total count
    const countResult = await query<{ total: number }>(
      'SELECT COUNT(*) as total FROM training_itineraries'
    );

    // Check breakdown by days and tour type
    const breakdown = await query<{ days: number; tour_type: string; count: number }>(
      `SELECT days, tour_type, COUNT(*) as count
       FROM training_itineraries
       GROUP BY days, tour_type
       ORDER BY days, tour_type`
    );

    // Get sample itineraries
    const samples = await query<any>(
      `SELECT title, days, cities, tour_type, LENGTH(content) as content_length, created_at
       FROM training_itineraries
       ORDER BY created_at DESC
       LIMIT 10`
    );

    // Get one full example to see the content structure
    const fullExample = await query<any>(
      `SELECT *
       FROM training_itineraries
       ORDER BY created_at DESC
       LIMIT 1`
    );

    return NextResponse.json({
      total: countResult[0]?.total || 0,
      breakdown,
      samples,
      fullExample: fullExample[0] || null,
    });
  } catch (error: any) {
    console.error('Error fetching training data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch training data' },
      { status: 500 }
    );
  }
}
