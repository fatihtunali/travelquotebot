import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userData = verifyToken(token);
    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch all itineraries for this operator
    const itineraries: any[] = await query(
      `SELECT
        id,
        customer_name as customerName,
        customer_email as customerEmail,
        number_of_travelers as numberOfTravelers,
        duration,
        budget,
        start_date as startDate,
        status,
        itinerary_data,
        created_at as createdAt
       FROM itineraries
       WHERE operator_id = ?
       ORDER BY created_at DESC`,
      [userData.operatorId]
    );

    // Parse JSON fields
    const parsedItineraries = itineraries.map((itinerary) => ({
      ...itinerary,
      itineraryData: itinerary.itinerary_data
        ? JSON.parse(itinerary.itinerary_data)
        : {},
    }));

    return NextResponse.json({
      success: true,
      itineraries: parsedItineraries,
    });
  } catch (error: any) {
    console.error('Fetch itineraries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itineraries' },
      { status: 500 }
    );
  }
}
