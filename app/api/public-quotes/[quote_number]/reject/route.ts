import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

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

    // Fetch quote
    const [quotes]: any = await pool.query(
      `SELECT id, status FROM quotes WHERE quote_number = ? LIMIT 1`,
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
