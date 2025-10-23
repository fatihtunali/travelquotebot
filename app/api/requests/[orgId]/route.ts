import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // Build query based on status filter
    let statusCondition = '';
    if (status !== 'all') {
      statusCondition = `AND q.status = '${status}'`;
    }

    // Get all quotes with follow-up tracking data
    const [quotes]: any = await pool.query(
      `SELECT
        q.id,
        q.quote_number,
        q.customer_name,
        q.customer_email,
        q.customer_phone,
        q.destination,
        q.start_date,
        q.end_date,
        q.adults,
        q.children,
        q.total_price,
        q.status,
        q.sent_at,
        q.viewed_at,
        q.last_follow_up_at,
        q.follow_up_notes,
        q.created_at,
        q.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        CASE
          WHEN q.status = 'draft' THEN 'Draft'
          WHEN q.status = 'sent' AND q.viewed_at IS NULL THEN 'Sent - Not Viewed'
          WHEN q.status = 'sent' AND q.viewed_at IS NOT NULL THEN 'Sent - Viewed'
          WHEN q.status = 'accepted' THEN 'Accepted'
          WHEN q.status = 'rejected' THEN 'Rejected'
          WHEN q.status = 'expired' THEN 'Expired'
          ELSE q.status
        END as detailed_status,
        DATEDIFF(NOW(), COALESCE(q.last_follow_up_at, q.sent_at, q.created_at)) as days_since_last_contact
      FROM quotes q
      LEFT JOIN users u ON q.created_by_user_id = u.id
      WHERE q.organization_id = ?
        ${statusCondition}
      ORDER BY
        CASE
          WHEN q.status = 'sent' AND q.viewed_at IS NOT NULL AND q.last_follow_up_at IS NULL THEN 1
          WHEN q.status = 'sent' AND DATEDIFF(NOW(), COALESCE(q.last_follow_up_at, q.sent_at)) > 3 THEN 2
          ELSE 3
        END,
        q.updated_at DESC`,
      [orgId]
    );

    // Calculate summary stats
    const stats = {
      total: quotes.length,
      draft: quotes.filter((q: any) => q.status === 'draft').length,
      sent: quotes.filter((q: any) => q.status === 'sent').length,
      viewed: quotes.filter((q: any) => q.status === 'sent' && q.viewed_at !== null).length,
      accepted: quotes.filter((q: any) => q.status === 'accepted').length,
      rejected: quotes.filter((q: any) => q.status === 'rejected').length,
      needsFollowUp: quotes.filter((q: any) =>
        q.status === 'sent' &&
        q.viewed_at !== null &&
        (!q.last_follow_up_at || q.days_since_last_contact > 3)
      ).length
    };

    return NextResponse.json({
      quotes,
      stats
    });

  } catch (error) {
    console.error('Error fetching customer requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer requests' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
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

    const body = await request.json();
    const { quoteId, action, notes } = body;

    if (action === 'follow_up') {
      // Update last follow-up timestamp and notes
      await pool.query(
        `UPDATE quotes
        SET last_follow_up_at = NOW(),
            follow_up_notes = CONCAT(COALESCE(follow_up_notes, ''), '\n\n[', NOW(), ']: ', ?)
        WHERE id = ? AND organization_id = ?`,
        [notes, quoteId, orgId]
      );
    } else if (action === 'mark_sent') {
      await pool.query(
        `UPDATE quotes
        SET status = 'sent',
            sent_at = NOW()
        WHERE id = ? AND organization_id = ?`,
        [quoteId, orgId]
      );
    } else if (action === 'mark_viewed') {
      await pool.query(
        `UPDATE quotes
        SET viewed_at = NOW()
        WHERE id = ? AND organization_id = ? AND viewed_at IS NULL`,
        [quoteId, orgId]
      );
    } else if (action === 'mark_accepted') {
      // Get quote details
      const [quoteRows]: any = await pool.query(
        `SELECT * FROM quotes WHERE id = ? AND organization_id = ?`,
        [quoteId, orgId]
      );

      if (quoteRows.length === 0) {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
      }

      const quote = quoteRows[0];

      // Generate booking number
      const bookingNumber = `BK-${Date.now()}`;

      // Create booking from quote
      const [result]: any = await pool.query(
        `INSERT INTO bookings (
          organization_id,
          quote_id,
          booking_number,
          customer_name,
          customer_email,
          destination,
          start_date,
          end_date,
          adults,
          children,
          total_amount,
          payment_status,
          booking_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          orgId,
          quoteId,
          bookingNumber,
          quote.customer_name,
          quote.customer_email,
          quote.destination,
          quote.start_date,
          quote.end_date,
          quote.adults,
          quote.children,
          quote.total_price
        ]
      );

      // Update quote status to accepted
      await pool.query(
        `UPDATE quotes SET status = 'accepted' WHERE id = ? AND organization_id = ?`,
        [quoteId, orgId]
      );
    } else if (action === 'mark_rejected') {
      await pool.query(
        `UPDATE quotes SET status = 'rejected' WHERE id = ? AND organization_id = ?`,
        [quoteId, orgId]
      );
    } else if (action === 'mark_expired') {
      await pool.query(
        `UPDATE quotes SET status = 'expired' WHERE id = ? AND organization_id = ?`,
        [quoteId, orgId]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}
