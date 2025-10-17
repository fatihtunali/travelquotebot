import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userData;
    try {
      userData = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch itinerary
    const itinerary: any = await queryOne(
      `SELECT * FROM itineraries WHERE id = ? AND operator_id = ?`,
      [params.id, userData.operatorId]
    );

    if (!itinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const response = {
      ...itinerary,
      interests: JSON.parse(itinerary.interests || '[]'),
      itineraryData: JSON.parse(itinerary.itinerary_data || '{}'),
    };

    // Remove the raw JSON string field
    delete response.itinerary_data;

    return NextResponse.json({
      success: true,
      itinerary: response,
    });
  } catch (error: any) {
    console.error('Fetch itinerary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itinerary', message: error.message },
      { status: 500 }
    );
  }
}
