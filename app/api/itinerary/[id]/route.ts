import { NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15
    const { id } = await params;

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

    // Fetch itinerary with operator information
    const itinerary: any = await queryOne(
      `SELECT i.*, o.company_name, o.logo_url
       FROM itineraries i
       LEFT JOIN operators o ON i.operator_id = o.id
       WHERE i.id = ? AND i.operator_id = ?`,
      [id, userData.operatorId]
    );

    if (!itinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedPreferences = itinerary.preferences
      ? JSON.parse(itinerary.preferences)
      : {};

    // Fetch pricing tiers
    const pricingTiers: any[] = await query(
      `SELECT * FROM pricing_tiers WHERE itinerary_id = ? ORDER BY min_pax`,
      [id]
    );

    const response = {
      ...itinerary,
      preferences: parsedPreferences,
      itineraryData: JSON.parse(itinerary.itinerary_data || '{}'),
      interests: parsedPreferences?.interests || [],
      pricingTiers,
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
      { error: 'Failed to fetch itinerary' },
      { status: 500 }
    );
  }
}
