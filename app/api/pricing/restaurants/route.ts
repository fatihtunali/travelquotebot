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
      cuisine_type = '',
      address = '',
      price_range = 'moderate',
      breakfast_price = 0,
      lunch_price = 0,
      dinner_price = 0,
      currency = 'USD',
      specialties = [],
      description = '',
      is_active = true
    } = body;

    if (!name || !city) {
      return NextResponse.json(
        { error: 'Name and city are required' },
        { status: 400 }
      );
    }

    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    const specialtiesJson = JSON.stringify(specialties);

    await query(
      `INSERT INTO operator_restaurants (
        id,
        operator_id,
        name,
        city,
        cuisine_type,
        address,
        price_range,
        breakfast_price,
        lunch_price,
        dinner_price,
        currency,
        specialties,
        description,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        operatorId,
        name,
        city,
        cuisine_type,
        address,
        price_range,
        breakfast_price,
        lunch_price,
        dinner_price,
        currency,
        specialtiesJson,
        description,
        is_active ? 1 : 0
      ]
    );

    return NextResponse.json({
      id,
      name,
      city,
      cuisine_type,
      address,
      price_range,
      breakfast_price,
      lunch_price,
      dinner_price,
      currency,
      specialties,
      description,
      is_active
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    );
  }
}
