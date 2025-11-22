import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

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

    // === KEY METRICS ===

    // Revenue this month
    const [revenueThisMonth]: any = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue
      FROM bookings
      WHERE organization_id = ?
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
        AND status NOT IN ('cancelled')
    `, [orgId]);

    // Revenue last month
    const [revenueLastMonth]: any = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue
      FROM bookings
      WHERE organization_id = ?
        AND MONTH(created_at) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
        AND YEAR(created_at) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
        AND status NOT IN ('cancelled')
    `, [orgId]);

    // Active bookings (ongoing or upcoming)
    const [activeBookings]: any = await pool.query(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE organization_id = ?
        AND status IN ('confirmed', 'deposit_received', 'fully_paid')
        AND (end_date >= CURDATE() OR end_date IS NULL)
    `, [orgId]);

    // Quote conversion rate
    const [quoteStats]: any = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted
      FROM quotes
      WHERE organization_id = ?
        AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    `, [orgId]);

    const conversionRate = quoteStats[0].total > 0
      ? Math.round((quoteStats[0].accepted / quoteStats[0].total) * 100)
      : 0;

    // Outstanding receivables (from agent balances)
    const [receivables]: any = await pool.query(`
      SELECT COALESCE(SUM(
        CASE WHEN running_balance > 0 THEN running_balance ELSE 0 END
      ), 0) as total
      FROM (
        SELECT a.id,
          (SELECT running_balance FROM agent_transactions at
           WHERE at.agent_id = a.id ORDER BY at.id DESC LIMIT 1) as running_balance
        FROM agents a
        WHERE a.organization_id = ?
      ) as agent_balances
    `, [orgId]);

    // Payables due (supplier invoices unpaid)
    const [payablesDue]: any = await pool.query(`
      SELECT COALESCE(SUM(total_amount - amount_paid), 0) as total
      FROM supplier_invoices
      WHERE organization_id = ?
        AND status NOT IN ('paid', 'cancelled')
        AND due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `, [orgId]);

    // === REVENUE TREND (Last 12 months) ===
    const [revenueTrend]: any = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        DATE_FORMAT(created_at, '%b') as month_name,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM bookings
      WHERE organization_id = ?
        AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        AND status NOT IN ('cancelled')
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
      ORDER BY month ASC
    `, [orgId]);

    // === BOOKING PIPELINE ===
    const [pipeline]: any = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM quotes WHERE organization_id = ? AND status = 'sent') as quotes_sent,
        (SELECT COUNT(*) FROM quotes WHERE organization_id = ? AND status = 'viewed') as quotes_viewed,
        (SELECT COUNT(*) FROM quotes WHERE organization_id = ? AND status = 'accepted') as quotes_accepted,
        (SELECT COUNT(*) FROM bookings WHERE organization_id = ? AND status = 'confirmed') as bookings_confirmed,
        (SELECT COUNT(*) FROM bookings WHERE organization_id = ? AND status IN ('deposit_received', 'fully_paid')) as bookings_paid
    `, [orgId, orgId, orgId, orgId, orgId]);

    // === TOP AGENTS ===
    const [topAgents]: any = await pool.query(`
      SELECT
        a.id,
        a.company_name as name,
        COUNT(b.id) as booking_count,
        COALESCE(SUM(b.total_amount), 0) as total_value
      FROM agents a
      LEFT JOIN bookings b ON a.id = b.agent_id AND b.status NOT IN ('cancelled')
      WHERE a.organization_id = ?
      GROUP BY a.id, a.company_name
      HAVING total_value > 0
      ORDER BY total_value DESC
      LIMIT 5
    `, [orgId]);

    // === RECENT ACTIVITY ===
    const [recentActivity]: any = await pool.query(`
      (SELECT
        'quote' as type,
        q.id,
        CAST(q.quote_number AS CHAR) COLLATE utf8mb4_unicode_ci as reference,
        CAST(q.customer_name AS CHAR) COLLATE utf8mb4_unicode_ci as description,
        q.created_at as timestamp,
        CAST(q.status AS CHAR) COLLATE utf8mb4_unicode_ci as status
      FROM quotes q
      WHERE q.organization_id = ?
      ORDER BY q.created_at DESC
      LIMIT 5)
      UNION ALL
      (SELECT
        'booking' as type,
        b.id,
        CAST(b.booking_number AS CHAR) COLLATE utf8mb4_unicode_ci as reference,
        CAST(b.customer_name AS CHAR) COLLATE utf8mb4_unicode_ci as description,
        b.created_at as timestamp,
        CAST(b.status AS CHAR) COLLATE utf8mb4_unicode_ci as status
      FROM bookings b
      WHERE b.organization_id = ?
      ORDER BY b.created_at DESC
      LIMIT 5)
      UNION ALL
      (SELECT
        'invoice' as type,
        i.id,
        CAST(i.invoice_number AS CHAR) COLLATE utf8mb4_unicode_ci as reference,
        CAST(CONCAT('€', FORMAT(i.total_amount, 0)) AS CHAR) COLLATE utf8mb4_unicode_ci as description,
        i.created_at as timestamp,
        CAST(i.status AS CHAR) COLLATE utf8mb4_unicode_ci as status
      FROM invoices i
      WHERE i.organization_id = ?
      ORDER BY i.created_at DESC
      LIMIT 5)
      ORDER BY timestamp DESC
      LIMIT 10
    `, [orgId, orgId, orgId]);

    // === FINANCIAL HEALTH ===
    const [financialHealth]: any = await pool.query(`
      SELECT
        COALESCE((SELECT SUM(total_amount) FROM bookings WHERE organization_id = ? AND status NOT IN ('cancelled') AND MONTH(created_at) = MONTH(CURRENT_DATE())), 0) as income,
        COALESCE((SELECT SUM(amount_paid) FROM supplier_invoices WHERE organization_id = ? AND MONTH(created_at) = MONTH(CURRENT_DATE())), 0) as expenses
    `, [orgId, orgId]);

    // === UPCOMING ACTIONS ===
    // Invoices due soon (from customers)
    const [invoicesDueSoon]: any = await pool.query(`
      SELECT id, invoice_number, customer_name, total_amount, due_date
      FROM invoices
      WHERE organization_id = ?
        AND status NOT IN ('paid', 'cancelled')
        AND due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY due_date ASC
      LIMIT 5
    `, [orgId]);

    // Payments to make (to suppliers)
    const [paymentsToMake]: any = await pool.query(`
      SELECT si.id, si.invoice_number, s.name as supplier_name,
        (si.total_amount - si.amount_paid) as amount_due, si.due_date
      FROM supplier_invoices si
      JOIN suppliers s ON si.supplier_id = s.id
      WHERE si.organization_id = ?
        AND si.status NOT IN ('paid', 'cancelled')
        AND si.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY si.due_date ASC
      LIMIT 5
    `, [orgId]);

    // Tours starting this week
    const [toursThisWeek]: any = await pool.query(`
      SELECT id, booking_number, customer_name, destination, start_date,
        (SELECT COUNT(*) FROM booking_passengers WHERE booking_id = bookings.id) as pax
      FROM bookings
      WHERE organization_id = ?
        AND status IN ('deposit_received', 'fully_paid')
        AND start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY start_date ASC
      LIMIT 5
    `, [orgId]);

    // Get credits and subscription for legacy support
    const [creditsResult]: any = await pool.query(
      'SELECT * FROM organization_credits WHERE organization_id = ?',
      [orgId]
    );

    const [subscriptionResult]: any = await pool.query(
      'SELECT * FROM subscriptions WHERE organization_id = ? ORDER BY created_at DESC LIMIT 1',
      [orgId]
    );

    // Calculate revenue change percentage
    const thisMonthRev = Number(revenueThisMonth[0].revenue);
    const lastMonthRev = Number(revenueLastMonth[0].revenue);
    const revenueChange = lastMonthRev > 0
      ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100)
      : 0;

    return NextResponse.json({
      organization: orgResult[0],
      credits: creditsResult[0] || { credits_total: 0, credits_used: 0, credits_available: 0 },
      subscription: subscriptionResult[0] || null,

      // Key Metrics
      keyMetrics: {
        revenueThisMonth: thisMonthRev,
        revenueChange,
        activeBookings: activeBookings[0].count,
        conversionRate,
        outstandingReceivables: Number(receivables[0].total),
        payablesDue: Number(payablesDue[0].total)
      },

      // Charts Data
      revenueTrend,

      pipeline: {
        quotesSent: pipeline[0].quotes_sent,
        quotesViewed: pipeline[0].quotes_viewed,
        quotesAccepted: pipeline[0].quotes_accepted,
        bookingsConfirmed: pipeline[0].bookings_confirmed,
        bookingsPaid: pipeline[0].bookings_paid
      },

      topAgents,
      recentActivity,

      // Financial Health
      financialHealth: {
        income: Number(financialHealth[0].income),
        expenses: Number(financialHealth[0].expenses),
        profit: Number(financialHealth[0].income) - Number(financialHealth[0].expenses)
      },

      // Upcoming Actions
      upcomingActions: {
        invoicesDueSoon,
        paymentsToMake,
        toursThisWeek
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
