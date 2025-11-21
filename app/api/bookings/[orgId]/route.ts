import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - List all bookings for an organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    let query = `
      SELECT
        b.*,
        q.quote_number,
        q.destination,
        a.company_name as agent_name,
        c.name as client_name,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE booking_id = b.id AND payment_type != 'refund') as total_paid
      FROM bookings b
      LEFT JOIN quotes q ON b.quote_id = q.id
      LEFT JOIN agents a ON b.agent_id = a.id
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.organization_id = ?
    `;
    const queryParams: any[] = [orgId];

    if (status !== 'all') {
      query += ' AND b.status = ?';
      queryParams.push(status);
    }

    if (search) {
      query += ' AND (b.customer_name LIKE ? OR b.booking_number LIKE ? OR b.customer_email LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY b.created_at DESC';

    const [bookings] = await pool.execute<RowDataPacket[]>(query, queryParams);

    // Get stats
    const [stats] = await pool.execute<RowDataPacket[]>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'deposit_received' THEN 1 ELSE 0 END) as deposit_received,
        SUM(CASE WHEN status = 'fully_paid' THEN 1 ELSE 0 END) as fully_paid,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status NOT IN ('cancelled') THEN total_amount ELSE 0 END), 0) as active_revenue
      FROM bookings
      WHERE organization_id = ?
    `, [orgId]);

    return NextResponse.json({
      bookings,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking (usually from accepted quote)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const body = await request.json();

    const {
      quote_id,
      customer_name,
      customer_email,
      customer_phone,
      agent_id,
      client_id,
      total_amount,
      deposit_amount,
      deposit_due_date,
      balance_due_date,
      start_date,
      end_date,
      internal_notes
    } = body;

    if (!quote_id || !customer_name || !total_amount || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Quote ID, customer name, total amount, and dates are required' },
        { status: 400 }
      );
    }

    // Generate booking number
    const [lastBooking]: any = await pool.query(
      `SELECT booking_number FROM bookings ORDER BY id DESC LIMIT 1`
    );

    let bookingNumber;
    if (lastBooking.length > 0) {
      const lastNumber = parseInt(lastBooking[0].booking_number.split('-')[2]);
      bookingNumber = `BK-2025-${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      bookingNumber = 'BK-2025-0001';
    }

    // Calculate balance
    const balance = total_amount - (deposit_amount || 0);

    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO bookings (
        organization_id, quote_id, booking_number, customer_name, customer_email,
        customer_phone, agent_id, client_id, total_amount, deposit_amount,
        deposit_due_date, balance_amount, balance_due_date, start_date, end_date,
        internal_notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `, [
      orgId,
      quote_id,
      bookingNumber,
      customer_name,
      customer_email || null,
      customer_phone || null,
      agent_id || null,
      client_id || null,
      total_amount,
      deposit_amount || 0,
      deposit_due_date || null,
      balance,
      balance_due_date || null,
      start_date,
      end_date,
      internal_notes || null
    ]);

    // Update quote status to accepted
    await pool.execute(`
      UPDATE quotes SET status = 'accepted', accepted_at = NOW() WHERE id = ?
    `, [quote_id]);

    return NextResponse.json({
      success: true,
      bookingId: result.insertId,
      bookingNumber: bookingNumber,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PUT - Update a booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Handle status changes
    if (updateData.status === 'cancelled') {
      fields.push('cancelled_at = NOW()');
    }

    values.push(id, orgId);

    await pool.execute(`
      UPDATE bookings SET ${fields.join(', ')}
      WHERE id = ? AND organization_id = ?
    `, values);

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Cancelled by operator';

    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Soft delete - mark as cancelled
    await pool.execute(`
      UPDATE bookings
      SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = ?
      WHERE id = ? AND organization_id = ?
    `, [reason, id, orgId]);

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
