import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Public endpoint to view quote/itinerary (no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;

    // Fetch quote with organization details
    const [quotes]: any = await pool.query(
      `SELECT
        q.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        u.email as created_by_email,
        o.name as organization_name,
        o.email as organization_email,
        o.phone as organization_phone
      FROM quotes q
      LEFT JOIN users u ON q.created_by_user_id = u.id
      LEFT JOIN organizations o ON q.organization_id = o.id
      WHERE q.id = ?
        AND q.status IN ('sent', 'accepted', 'rejected')`,
      [quoteId]
    );

    if (quotes.length === 0) {
      return NextResponse.json(
        { error: 'Quote not found or not available for viewing' },
        { status: 404 }
      );
    }

    const quote = quotes[0];

    // Parse itinerary JSON if exists
    if (quote.itinerary && typeof quote.itinerary === 'string') {
      try {
        quote.itinerary = JSON.parse(quote.itinerary);
      } catch (e) {
        quote.itinerary = null;
      }
    }

    // Mark as viewed if not already viewed
    if (!quote.viewed_at) {
      await pool.query(
        `UPDATE quotes SET viewed_at = NOW() WHERE id = ?`,
        [quoteId]
      );
    }

    return NextResponse.json({ quote });

  } catch (error) {
    console.error('Error fetching public quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
