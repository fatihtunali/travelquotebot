import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all hotels with their pricing for this organization
    const [hotels]: any = await pool.query(
      `SELECT
        h.id, h.hotel_name, h.city, h.star_rating,
        hp.id as pricing_id, hp.season_name, hp.start_date, hp.end_date, hp.currency,
        hp.double_room_bb, hp.single_supplement_bb, hp.triple_room_bb,
        hp.child_0_6_bb, hp.child_6_12_bb, hp.base_meal_plan,
        hp.hb_supplement, hp.fb_supplement, hp.ai_supplement, hp.notes, hp.status
       FROM hotels h
       LEFT JOIN hotel_pricing hp ON h.id = hp.hotel_id AND hp.status = 'active'
       WHERE h.organization_id = ? AND h.status = 'active'
       ORDER BY h.city, h.hotel_name`,
      [decoded.organizationId]
    );

    return NextResponse.json(hotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
