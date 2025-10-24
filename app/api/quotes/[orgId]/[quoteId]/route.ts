import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

// C6: Remove fallback - JWT_SECRET is required
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// GET - Get single quote by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; quoteId: string }> }
) {
  try {
    const { orgId, quoteId } = await params;
    const authHeader = request.headers.get('authorization');

    // Allow public access if no auth header (for guest view)
    let isPublicAccess = false;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      isPublicAccess = true;
    } else {
      const token = authHeader.substring(7);
      try {
        jwt.verify(token, JWT_SECRET);
      } catch (error) {
        isPublicAccess = true;
      }
    }

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
      WHERE q.id = ? AND q.organization_id = ?`,
      [quoteId, orgId]
    );

    if (quotes.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
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

    return NextResponse.json({ quote });

  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

// PUT - Update quote (including itinerary)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; quoteId: string }> }
) {
  try {
    const { orgId, quoteId } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      destination,
      start_date,
      end_date,
      adults,
      children,
      total_price,
      itinerary,
      status
    } = body;

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (customer_name !== undefined) {
      updates.push('customer_name = ?');
      values.push(customer_name);
    }
    if (customer_email !== undefined) {
      updates.push('customer_email = ?');
      values.push(customer_email);
    }
    if (customer_phone !== undefined) {
      updates.push('customer_phone = ?');
      values.push(customer_phone);
    }
    if (destination !== undefined) {
      updates.push('destination = ?');
      values.push(destination);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      // Convert ISO timestamp to DATE format (YYYY-MM-DD)
      const startDateOnly = start_date.includes('T') ? start_date.split('T')[0] : start_date;
      values.push(startDateOnly);
    }
    if (end_date !== undefined) {
      updates.push('end_date = ?');
      // Convert ISO timestamp to DATE format (YYYY-MM-DD)
      const endDateOnly = end_date.includes('T') ? end_date.split('T')[0] : end_date;
      values.push(endDateOnly);
    }
    if (adults !== undefined) {
      updates.push('adults = ?');
      values.push(adults);
    }
    if (children !== undefined) {
      updates.push('children = ?');
      values.push(children);
    }
    if (total_price !== undefined) {
      updates.push('total_price = ?');
      values.push(total_price);
    }
    if (itinerary !== undefined) {
      updates.push('itinerary = ?');
      values.push(JSON.stringify(itinerary));
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add WHERE clause values
    values.push(quoteId, orgId);

    await pool.query(
      `UPDATE quotes SET ${updates.join(', ')} WHERE id = ? AND organization_id = ?`,
      values
    );

    // Fetch updated quote
    const [quotes]: any = await pool.query(
      `SELECT
        q.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM quotes q
      LEFT JOIN users u ON q.created_by_user_id = u.id
      WHERE q.id = ? AND q.organization_id = ?`,
      [quoteId, orgId]
    );

    if (quotes.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
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

    return NextResponse.json({
      success: true,
      quote
    });

  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

// DELETE - Delete quote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; quoteId: string }> }
) {
  try {
    const { orgId, quoteId } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await pool.query(
      `DELETE FROM quotes WHERE id = ? AND organization_id = ?`,
      [quoteId, orgId]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}
