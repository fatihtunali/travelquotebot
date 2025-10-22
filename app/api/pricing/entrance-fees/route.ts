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

    // Get all entrance fees with their pricing for this organization
    const [fees]: any = await pool.query(
      `SELECT
        ef.id, ef.site_name as siteName, ef.city,
        efp.id as pricing_id, efp.season_name as seasonName, efp.start_date as startDate,
        efp.end_date as endDate, efp.currency,
        efp.adult_price as adultPrice, efp.child_price as childPrice,
        efp.student_price as studentPrice, efp.notes, efp.status
       FROM entrance_fees ef
       LEFT JOIN entrance_fee_pricing efp ON ef.id = efp.entrance_fee_id AND efp.status = 'active'
       WHERE ef.organization_id = ? AND ef.status = 'active'
       ORDER BY ef.city, ef.site_name`,
      [decoded.organizationId]
    );

    return NextResponse.json(fees);
  } catch (error) {
    console.error('Error fetching entrance fees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
