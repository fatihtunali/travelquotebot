import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendQuoteRejectedNotification } from '@/lib/email';

// POST - Reject quote (PUBLIC)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quote_number: string }> }
) {
  try {
    const { quote_number } = await params;

    // Get optional rejection reason from body
    let reason = '';
    try {
      const body = await request.json();
      reason = body.reason || '';
    } catch (e) {
      // No body provided, that's fine
    }

    // Fetch quote with organization details
    const [quotes]: any = await pool.query(
      `SELECT q.id, q.status, q.customer_name, q.destination, q.organization_id,
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

    // Check if quote can be rejected
    if (quote.status === 'accepted') {
      return NextResponse.json(
        { error: 'This quote has already been accepted' },
        { status: 400 }
      );
    }

    if (quote.status === 'rejected') {
      return NextResponse.json(
        { error: 'This quote has already been rejected' },
        { status: 400 }
      );
    }

    // Update quote status to rejected
    await pool.query(
      `UPDATE quotes
       SET status = 'rejected',
           rejected_at = NOW(),
           rejection_reason = ?
       WHERE id = ?`,
      [reason || null, quote.id]
    );

    // Send email notification to operator
    if (quote.operator_email) {
      try {
        await sendQuoteRejectedNotification(
          quote.operator_email,
          quote_number,
          quote.customer_name,
          quote.destination,
          reason || null
        );
      } catch (emailError) {
        console.error('Failed to send rejection notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Quote rejected'
    });

  } catch (error) {
    console.error('Error rejecting quote:', error);
    return NextResponse.json(
      { error: 'Failed to reject quote' },
      { status: 500 }
    );
  }
}
