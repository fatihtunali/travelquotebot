import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get the most recent itinerary
    const itinerary = await query<any>(`
      SELECT id, customer_name, customer_email, num_travelers,
             start_date, end_date, status, itinerary_data,
             created_at
      FROM itineraries
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (itinerary.length === 0) {
      return NextResponse.json({ error: 'No itineraries found' }, { status: 404 });
    }

    const recent = itinerary[0];
    const itineraryData = JSON.parse(recent.itinerary_data);

    return NextResponse.json({
      id: recent.id,
      customer_name: recent.customer_name,
      customer_email: recent.customer_email,
      num_travelers: recent.num_travelers,
      start_date: recent.start_date,
      end_date: recent.end_date,
      status: recent.status,
      created_at: recent.created_at,
      itinerary: itineraryData,
    });
  } catch (error: any) {
    console.error('Error fetching recent itinerary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recent itinerary' },
      { status: 500 }
    );
  }
}
