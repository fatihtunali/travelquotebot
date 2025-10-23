import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    // Get quote statistics
    const [quoteStats]: any = await pool.query(
      `SELECT
        COUNT(*) as total_quotes,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_quotes,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_quotes,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_quotes,
        AVG(total_price) as avg_quote_value,
        SUM(total_price) as total_quote_value
      FROM quotes
      WHERE organization_id = ?`,
      [orgId]
    );

    // Get bookings statistics
    const [bookingStats]: any = await pool.query(
      `SELECT
        COUNT(*) as total_bookings,
        AVG(total_amount) as avg_booking_value,
        SUM(total_amount) as total_revenue,
        SUM(payment_amount) as total_paid
      FROM bookings
      WHERE organization_id = ?`,
      [orgId]
    );

    // Calculate conversion rate
    const totalQuotes = quoteStats[0]?.total_quotes || 0;
    const totalBookings = bookingStats[0]?.total_bookings || 0;
    const conversionRate = totalQuotes > 0 ? ((totalBookings / totalQuotes) * 100).toFixed(1) : '0.0';

    // Get revenue trends (last 6 months)
    const [revenueTrends]: any = await pool.query(
      `SELECT
        DATE_FORMAT(booking_date, '%Y-%m') as month,
        COUNT(*) as bookings_count,
        SUM(total_amount) as revenue,
        SUM(payment_amount) as paid_amount
      FROM bookings
      WHERE organization_id = ?
        AND booking_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC`,
      [orgId]
    );

    // Fill in missing months with zero revenue
    const revenueMonths = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const monthData = revenueTrends.find((item: any) => item.month === monthKey);

      revenueMonths.push({
        month: monthLabel,
        bookings: monthData?.bookings_count || 0,
        revenue: monthData?.revenue || 0,
        paid: monthData?.paid_amount || 0
      });
    }

    // Get most popular destinations (from quotes)
    const [popularDestinations]: any = await pool.query(
      `SELECT
        destination,
        COUNT(*) as quote_count,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as bookings_count,
        AVG(total_price) as avg_price
      FROM quotes
      WHERE organization_id = ?
        AND destination IS NOT NULL
        AND destination != ''
      GROUP BY destination
      ORDER BY quote_count DESC
      LIMIT 10`,
      [orgId]
    );

    // Get busiest seasons (by month)
    const [seasonalData]: any = await pool.query(
      `SELECT
        MONTH(start_date) as month_num,
        DATE_FORMAT(start_date, '%M') as month_name,
        COUNT(*) as bookings_count,
        SUM(adults + children) as total_travelers
      FROM quotes
      WHERE organization_id = ?
        AND status = 'accepted'
        AND start_date IS NOT NULL
      GROUP BY month_num, month_name
      ORDER BY bookings_count DESC`,
      [orgId]
    );

    // Get top performing tour types (by destination)
    const [topTours]: any = await pool.query(
      `SELECT
        destination,
        COUNT(*) as bookings,
        AVG(total_price) as avg_value,
        SUM(total_price) as total_value,
        AVG(adults + children) as avg_group_size
      FROM quotes
      WHERE organization_id = ?
        AND status = 'accepted'
        AND destination IS NOT NULL
      GROUP BY destination
      ORDER BY bookings DESC
      LIMIT 5`,
      [orgId]
    );

    // Get customer demographics (adults vs children)
    const [demographics]: any = await pool.query(
      `SELECT
        SUM(adults) as total_adults,
        SUM(children) as total_children,
        COUNT(*) as total_bookings,
        AVG(adults) as avg_adults,
        AVG(children) as avg_children
      FROM quotes
      WHERE organization_id = ?
        AND status = 'accepted'`,
      [orgId]
    );

    // Get recent analytics events
    const [recentEvents]: any = await pool.query(
      `SELECT
        event_type,
        COUNT(*) as count,
        MAX(created_at) as last_event
      FROM analytics_events
      WHERE organization_id = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY event_type
      ORDER BY count DESC`,
      [orgId]
    );

    // Get quote status distribution
    const [quoteStatusDist]: any = await pool.query(
      `SELECT
        status,
        COUNT(*) as count,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM quotes WHERE organization_id = ?)) as percentage
      FROM quotes
      WHERE organization_id = ?
      GROUP BY status`,
      [orgId, orgId]
    );

    return NextResponse.json({
      overview: {
        totalQuotes: quoteStats[0]?.total_quotes || 0,
        acceptedQuotes: quoteStats[0]?.accepted_quotes || 0,
        pendingQuotes: quoteStats[0]?.pending_quotes || 0,
        rejectedQuotes: quoteStats[0]?.rejected_quotes || 0,
        totalBookings: bookingStats[0]?.total_bookings || 0,
        conversionRate: conversionRate,
        avgQuoteValue: quoteStats[0]?.avg_quote_value || 0,
        avgBookingValue: bookingStats[0]?.avg_booking_value || 0,
        totalRevenue: bookingStats[0]?.total_revenue || 0,
        totalPaid: bookingStats[0]?.total_paid || 0
      },
      revenueTrends: revenueMonths,
      popularDestinations: popularDestinations || [],
      seasonalData: seasonalData || [],
      topTours: topTours || [],
      demographics: {
        totalAdults: demographics[0]?.total_adults || 0,
        totalChildren: demographics[0]?.total_children || 0,
        totalBookings: demographics[0]?.total_bookings || 0,
        avgAdults: demographics[0]?.avg_adults || 0,
        avgChildren: demographics[0]?.avg_children || 0
      },
      recentEvents: recentEvents || [],
      quoteStatusDistribution: quoteStatusDist || []
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
