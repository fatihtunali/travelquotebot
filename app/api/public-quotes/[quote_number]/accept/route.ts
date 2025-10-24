import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST to accept a quote (PUBLIC - no authentication required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quote_number: string }> }
) {
  try {
    const { quote_number } = await params;

    // First check if quote exists and is in valid status
    const [quotes]: any = await pool.query(
      `SELECT id, status
      FROM quotes
      WHERE quote_number = ?
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

    // Only allow accepting quotes that are in 'sent' status
    if (quote.status !== 'sent') {
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
