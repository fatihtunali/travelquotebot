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
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [orgsResult]: any = await pool.query(
      'SELECT COUNT(*) as total FROM organizations'
    );
    const [activeOrgsResult]: any = await pool.query(
      'SELECT COUNT(*) as total FROM organizations WHERE status = ?',
      ['active']
    );
    const [usersResult]: any = await pool.query(
      'SELECT COUNT(*) as total FROM users'
    );
    const [quotesResult]: any = await pool.query(
      'SELECT COUNT(*) as total FROM quotes'
    );

    return NextResponse.json({
      totalOrgs: orgsResult[0].total,
      activeOrgs: activeOrgsResult[0].total,
      totalUsers: usersResult[0].total,
      totalQuotes: quotesResult[0].total,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
