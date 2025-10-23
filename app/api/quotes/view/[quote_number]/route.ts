import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET quote by quote_number (PUBLIC - no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quote_number: string }> }
) {
  try {
    const { quote_number } = await params;

    // Fetch quote with organization details
    const [quotes]: any = await pool.query(
      `SELECT
        q.*,
        o.name as organization_name,
        o.email as organization_email,
        o.phone as organization_phone
      FROM quotes q
      LEFT JOIN organizations o ON q.organization_id = o.id
      WHERE q.quote_number = ?
        AND q.status != 'draft'
      LIMIT 1`,
      [quote_number]
    );

    if (!quotes || quotes.length === 0) {
      return NextResponse.json(
        { error: 'Quote not found or not available' },
        { status: 404 }
      );
    }

    const quote = quotes[0];

    // Parse itinerary JSON if it exists
    if (quote.itinerary && typeof quote.itinerary === 'string') {
      try {
        quote.itinerary = JSON.parse(quote.itinerary);
      } catch (e) {
        console.error('Failed to parse itinerary JSON:', e);
        quote.itinerary = null;
      }
    }

    // Parse city_nights JSON if it exists
    if (quote.city_nights && typeof quote.city_nights === 'string') {
      try {
        quote.city_nights = JSON.parse(quote.city_nights);
      } catch (e) {
        console.error('Failed to parse city_nights JSON:', e);
        quote.city_nights = [];
      }
    }

    return NextResponse.json(quote);

  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
