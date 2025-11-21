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

    // Get alerts data
    // 1. Expiring quotes (sent/viewed status, expiring in next 3 days)
    const [expiringQuotes]: any = await pool.query(
      `SELECT id, quote_number, customer_name, expires_at
       FROM quotes
       WHERE organization_id = ?
         AND status IN ('sent', 'viewed')
         AND expires_at IS NOT NULL
         AND expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
       ORDER BY expires_at ASC
       LIMIT 5`,
      [orgId]
    );

    // 2. Deposits due this week
    const [depositsDue]: any = await pool.query(
      `SELECT id, booking_number, customer_name, deposit_amount, deposit_due_date
       FROM bookings
       WHERE organization_id = ?
         AND status = 'confirmed'
         AND deposit_due_date IS NOT NULL
         AND deposit_due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       ORDER BY deposit_due_date ASC
       LIMIT 5`,
      [orgId]
    );

    // 3. Balances due this week
    const [balancesDue]: any = await pool.query(
      `SELECT id, booking_number, customer_name,
              (total_amount - COALESCE(deposit_amount, 0)) as balance_amount,
              balance_due_date
       FROM bookings
       WHERE organization_id = ?
         AND status = 'deposit_received'
         AND balance_due_date IS NOT NULL
         AND balance_due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       ORDER BY balance_due_date ASC
       LIMIT 5`,
      [orgId]
    );

    // 4. Upcoming trips (next 7 days)
    const [upcomingTrips]: any = await pool.query(
      `SELECT id, booking_number, customer_name, destination, start_date
       FROM bookings
       WHERE organization_id = ?
         AND status IN ('deposit_received', 'fully_paid')
         AND start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       ORDER BY start_date ASC
       LIMIT 5`,
      [orgId]
    );

    // 5. Overdue follow-ups
    const [overdueFollowups]: any = await pool.query(
      `SELECT id, quote_number, customer_name, follow_up_date
       FROM quotes
       WHERE organization_id = ?
         AND status IN ('sent', 'viewed')
         AND follow_up_date IS NOT NULL
         AND follow_up_date < CURDATE()
       ORDER BY follow_up_date ASC
       LIMIT 5`,
      [orgId]
    );

    return NextResponse.json({
      organization: orgResult[0],
      credits: creditsResult[0] || { credits_total: 0, credits_used: 0, credits_available: 0 },
      subscription: subscriptionResult[0] || null,
      stats: {
        quotesThisMonth: quotesResult[0].count
      },
      alerts: {
        expiringQuotes,
        depositsDue,
        balancesDue,
        upcomingTrips,
        overdueFollowups
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
