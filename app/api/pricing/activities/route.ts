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
        id,
        name,
        city,
        category,
        duration_hours,
        base_price,
        currency,
        min_participants,
        max_participants,
        description,
        highlights,
        location_lat,
        location_lng,
        is_active,
        created_at
      FROM activities
      WHERE operator_id = ?
      ORDER BY created_at DESC`,
      [operatorId]
    );

    const activitiesWithParsedJson = (activities as any[]).map((activity) => ({
      ...activity,
      highlights: activity.highlights ? JSON.parse(activity.highlights) : null,
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
