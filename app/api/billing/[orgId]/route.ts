import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    // Get usage analytics (last 6 months from quotes table)
    const [usageData]: any = await pool.query(
      `SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as quotes_count
      FROM quotes
      WHERE organization_id = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC`,
      [orgId]
    );

    // Get credits info
    const [creditsData]: any = await pool.query(
      'SELECT * FROM organization_credits WHERE organization_id = ?',
      [orgId]
    );

    // Get subscription info
    const [subscriptionData]: any = await pool.query(
      'SELECT * FROM subscriptions WHERE organization_id = ? ORDER BY created_at DESC LIMIT 1',
      [orgId]
    );

    // Get payment methods
    const [paymentMethods]: any = await pool.query(
      'SELECT * FROM payment_methods WHERE organization_id = ? ORDER BY is_default DESC, created_at DESC',
      [orgId]
    );

    // Get invoices
    const [invoices]: any = await pool.query(
      `SELECT
        id,
        invoice_number,
        DATE_FORMAT(invoice_date, '%b %d, %Y') as date,
        total_amount as amount,
        status,
        bill_to_name as plan,
        CONCAT('/api/invoices/', id, '/download') as downloadUrl
      FROM invoices
      WHERE organization_id = ?
      ORDER BY invoice_date DESC
      LIMIT 12`,
      [orgId]
    );

    // Format usage history with all 6 months (fill in missing months with 0)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const usage = usageData.find((item: any) => item.month === monthKey);
      const monthlyCredits = subscriptionData[0]?.monthly_credits || 50;

      months.push({
        month: monthLabel,
        used: usage ? usage.quotes_count : 0,
        total: monthlyCredits
      });
    }

    return NextResponse.json({
      usageHistory: months,
      credits: creditsData[0] || { credits_total: 0, credits_used: 0, credits_available: 0 },
      subscription: subscriptionData[0] || null,
      paymentMethods: paymentMethods || [],
      invoices: invoices || []
    });

  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
      { status: 500 }
    );
  }
}
