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

    // Get all guides with their pricing for this organization
    const [guides]: any = await pool.query(
      `SELECT
        g.id, g.city, g.language,
        gp.id as pricing_id, gp.season_name, gp.start_date, gp.end_date, gp.currency,
        gp.full_day_price as fullDay, gp.half_day_price as halfDay,
        gp.night_price as night, gp.notes, gp.status
       FROM guides g
       LEFT JOIN guide_pricing gp ON g.id = gp.guide_id AND gp.status = 'active'
       WHERE g.organization_id = ? AND g.status = 'active'
       ORDER BY g.city, g.language`,
      [decoded.organizationId]
    );

    return NextResponse.json(guides);
  } catch (error) {
    console.error('Error fetching guides:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
