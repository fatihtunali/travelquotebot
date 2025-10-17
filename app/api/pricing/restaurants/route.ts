import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
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

    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 }
      );
    }

    const operatorId = userData.operatorId;

    const restaurants = await query(
      `SELECT
        id,
        name,
        city,
        cuisine_type,
        breakfast_price,
        lunch_price,
        dinner_price,
        currency,
        description,
        address,
        specialties,
        price_range,
        location_lat,
        location_lng,
        is_active,
        created_at
      FROM operator_restaurants
      WHERE operator_id = ?
      ORDER BY created_at DESC`,
      [operatorId]
    );

    const restaurantsWithParsedJson = (restaurants as any[]).map((restaurant) => ({
      ...restaurant,
      specialties: restaurant.specialties ? JSON.parse(restaurant.specialties) : null,
    }));

    return NextResponse.json(restaurantsWithParsedJson);
  } catch (error: any) {
    console.error('Failed to fetch restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}
