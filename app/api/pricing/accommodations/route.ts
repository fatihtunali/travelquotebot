import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

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

    const accommodations = await query(
      `SELECT
        id,
        name,
        city,
        category,
        star_rating,
        base_price_per_night,
        amenities,
        description,
        location_lat,
        location_lng,
        is_active,
        created_at
      FROM accommodations
      WHERE operator_id = ?
      ORDER BY created_at DESC`,
      [operatorId]
    );

    const accommodationsWithParsedJson = (accommodations as any[]).map((acc) => ({
      ...acc,
      amenities: acc.amenities ? JSON.parse(acc.amenities) : null,
    }));

    return NextResponse.json(accommodationsWithParsedJson);
  } catch (error: any) {
    console.error('Failed to fetch accommodations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accommodations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const body = await request.json();

    const {
      name,
      city,
      category,
      star_rating,
      base_price_per_night,
      currency = 'USD',
      amenities = [],
      description = '',
      is_active = true
    } = body;

    if (!name || !city) {
      return NextResponse.json(
        { error: 'Name and city are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const amenitiesJson = JSON.stringify(amenities);

    await query(
      `INSERT INTO accommodations (
        id,
        operator_id,
        name,
        city,
        category,
        star_rating,
        base_price_per_night,
        currency,
        amenities,
        description,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        operatorId,
        name,
        city,
        category,
        star_rating,
        base_price_per_night,
        currency,
        amenitiesJson,
        description,
        is_active ? 1 : 0
      ]
    );

    return NextResponse.json({
      id,
      name,
      city,
      category,
      star_rating,
      base_price_per_night,
      currency,
      amenities,
      description,
      is_active
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create accommodation:', error);
    return NextResponse.json(
      { error: 'Failed to create accommodation' },
      { status: 500 }
    );
  }
}
