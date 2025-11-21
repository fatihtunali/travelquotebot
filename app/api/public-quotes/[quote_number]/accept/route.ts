import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendQuoteAcceptedNotification } from '@/lib/email';

// POST to accept a quote (PUBLIC - no authentication required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quote_number: string }> }
) {
  try {
    const { quote_number } = await params;

    // First check if quote exists and is in valid status
    const [quotes]: any = await pool.query(
      `SELECT q.id, q.status, q.customer_name, q.customer_email, q.destination,
              q.total_amount, q.currency, q.organization_id,
              o.email as operator_email
       FROM quotes q
       LEFT JOIN organizations o ON q.organization_id = o.id
       WHERE q.quote_number = ?
       LIMIT 1`,
      [quote_number]
    );

    if (!quotes || quotes.length === 0) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    const quote = quotes[0];

    // Allow accepting quotes that are in 'sent' or 'viewed' status
    if (quote.status !== 'sent' && quote.status !== 'viewed') {
      return NextResponse.json(
        { error: `Quote cannot be accepted. Current status: ${quote.status}` },
        { status: 400 }
      );
    }

    // Update quote status to 'accepted'
    await pool.query(
      `UPDATE quotes
      SET status = 'accepted',
          accepted_at = NOW()
      WHERE id = ?`,
      [quote.id]
    );

    // Send email notification to operator
    if (quote.operator_email) {
      try {
        await sendQuoteAcceptedNotification(
          quote.operator_email,
          quote_number,
          quote.customer_name,
          quote.customer_email || '',
          quote.destination,
          quote.total_amount || 0,
          quote.currency || 'USD'
        );
      } catch (emailError) {
        console.error('Failed to send acceptance notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Quote accepted successfully',
      quote_number
    });

  } catch (error) {
    console.error('Error accepting quote:', error);
    return NextResponse.json(
      { error: 'Failed to accept quote' },
      { status: 500 }
    );
  }
}
