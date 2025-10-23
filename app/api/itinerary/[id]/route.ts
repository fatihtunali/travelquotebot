import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch saved customer itinerary by ID (PUBLIC)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [itineraries]: any = await pool.query(
      `SELECT * FROM customer_itineraries WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!itineraries || itineraries.length === 0) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    const itinerary = itineraries[0];

    // Parse JSON fields
    if (itinerary.city_nights && typeof itinerary.city_nights === 'string') {
      itinerary.city_nights = JSON.parse(itinerary.city_nights);
    }

    if (itinerary.itinerary_data && typeof itinerary.itinerary_data === 'string') {
      itinerary.itinerary_data = JSON.parse(itinerary.itinerary_data);
    }

    return NextResponse.json(itinerary);

  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itinerary' },
      { status: 500 }
    );
  }
}
