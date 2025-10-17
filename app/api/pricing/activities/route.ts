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

    const activities = await query(
      `SELECT
        a.id,
        a.name,
        a.city,
        a.category,
        a.duration_hours,
        a.base_price,
        a.currency,
        a.min_participants,
        a.max_participants,
        a.description,
        a.highlights,
        a.location_lat,
        a.location_lng,
        a.is_active,
        a.created_at,
        (
          SELECT MIN(
            CASE
              WHEN ap.pricing_type = 'sic' THEN ap.sic_price_adult
              WHEN ap.pricing_type = 'private' THEN
                (ap.transport_cost + ap.guide_cost) / NULLIF(ap.max_pax, 0) + ap.entrance_fee_adult + ap.meal_cost_adult
            END
          )
          FROM activity_pricing ap
          WHERE ap.activity_id = a.id AND ap.is_active = 1
        ) as cheapest_price
      FROM activities a
      WHERE a.operator_id = ?
      ORDER BY a.created_at DESC`,
      [operatorId]
    );

    const activitiesWithParsedJson = (activities as any[]).map((activity) => ({
      ...activity,
      highlights: activity.highlights ? JSON.parse(activity.highlights) : null,
      cheapest_price: activity.cheapest_price || activity.base_price,
    }));

    return NextResponse.json(activitiesWithParsedJson);
  } catch (error: any) {
    console.error('Failed to fetch activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
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
      duration_hours,
      base_price,
      currency = 'USD',
      min_participants = 1,
      max_participants = 10,
      highlights = [],
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
    const highlightsJson = JSON.stringify(highlights);

    await query(
      `INSERT INTO activities (
        id,
        operator_id,
        name,
        city,
        category,
        duration_hours,
        base_price,
        currency,
        min_participants,
        max_participants,
        highlights,
        description,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        operatorId,
        name,
        city,
        category,
        duration_hours,
        base_price,
        currency,
        min_participants,
        max_participants,
        highlightsJson,
        description,
        is_active ? 1 : 0
      ]
    );

    return NextResponse.json({
      id,
      name,
      city,
      category,
      duration_hours,
      base_price,
      currency,
      min_participants,
      max_participants,
      highlights,
      description,
      is_active
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
