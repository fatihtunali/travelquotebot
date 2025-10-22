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

    // Get all tours with their pricing for this organization
    const [tours]: any = await pool.query(
      `SELECT
        t.id, t.tour_name, t.tour_code, t.city, t.duration_days, t.tour_type,
        t.inclusions, t.exclusions,
        tp.id as pricing_id, tp.season_name, tp.start_date, tp.end_date, tp.currency,
        tp.sic_price_2_pax, tp.sic_price_4_pax, tp.sic_price_6_pax,
        tp.sic_price_8_pax, tp.sic_price_10_pax,
        tp.pvt_price_2_pax, tp.pvt_price_4_pax, tp.pvt_price_6_pax,
        tp.pvt_price_8_pax, tp.pvt_price_10_pax, tp.notes, tp.status
       FROM tours t
       LEFT JOIN tour_pricing tp ON t.id = tp.tour_id AND tp.status = 'active'
       WHERE t.organization_id = ? AND t.status = 'active'
       ORDER BY t.city, t.tour_name`,
      [decoded.organizationId]
    );

    return NextResponse.json(tours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
