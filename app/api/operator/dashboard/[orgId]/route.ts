import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const orgId = parseInt(resolvedParams.orgId);

    // Verify user belongs to this organization
    if (decoded.role !== 'super_admin' && decoded.organizationId !== orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get organization details
    const [orgResult]: any = await pool.query(
      'SELECT * FROM organizations WHERE id = ?',
      [orgId]
    );

    if (orgResult.length === 0) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get credits
    const [creditsResult]: any = await pool.query(
      'SELECT * FROM organization_credits WHERE organization_id = ?',
      [orgId]
    );

    // Get subscription
    const [subscriptionResult]: any = await pool.query(
      'SELECT * FROM subscriptions WHERE organization_id = ? ORDER BY created_at DESC LIMIT 1',
      [orgId]
    );

    // Get quotes count for this month
    const [quotesResult]: any = await pool.query(
      `SELECT COUNT(*) as count FROM quotes
       WHERE organization_id = ?
       AND MONTH(created_at) = MONTH(CURRENT_DATE())
       AND YEAR(created_at) = YEAR(CURRENT_DATE())`,
      [orgId]
    );

    return NextResponse.json({
      organization: orgResult[0],
      credits: creditsResult[0] || { credits_total: 0, credits_used: 0, credits_available: 0 },
      subscription: subscriptionResult[0] || null,
      stats: {
        quotesThisMonth: quotesResult[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
