import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - List payments for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; bookingId: string }> }
) {
  try {
    const { orgId, bookingId } = await params;

    const [payments] = await pool.execute<RowDataPacket[]>(`
      SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM payments p
      LEFT JOIN users u ON p.created_by_user_id = u.id
      WHERE p.booking_id = ? AND p.organization_id = ?
      ORDER BY p.payment_date DESC
    `, [bookingId, orgId]);

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST - Add a payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; bookingId: string }> }
) {
  try {
    const { orgId, bookingId } = await params;
    const body = await request.json();

    const {
      payment_type,
      amount,
      currency,
      payment_method,
      reference_number,
      payment_date,
      notes,
      created_by_user_id
    } = body;

    if (!payment_type || !amount || !payment_date) {
      return NextResponse.json(
        { error: 'Payment type, amount, and date are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO payments (
        organization_id, booking_id, payment_type, amount, currency,
        payment_method, reference_number, payment_date, notes, created_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orgId,
      bookingId,
      payment_type,
      amount,
      currency || 'EUR',
      payment_method || 'bank_transfer',
      reference_number || null,
      payment_date,
      notes || null,
      created_by_user_id || null
    ]);

    // Update booking status based on payments
    const [booking] = await pool.execute<RowDataPacket[]>(
      'SELECT total_amount, deposit_amount FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (booking.length > 0) {
      const [payments] = await pool.execute<RowDataPacket[]>(
        'SELECT SUM(CASE WHEN payment_type = "refund" THEN -amount ELSE amount END) as total_paid FROM payments WHERE booking_id = ?',
        [bookingId]
      );

      const totalPaid = Number(payments[0].total_paid) || 0;
      const totalAmount = Number(booking[0].total_amount);
      const depositAmount = Number(booking[0].deposit_amount);

      let newStatus = 'confirmed';
      if (totalPaid >= totalAmount) {
        newStatus = 'fully_paid';
      } else if (totalPaid >= depositAmount && depositAmount > 0) {
        newStatus = 'deposit_received';
      }

      // Update booking status and payment dates
      if (payment_type === 'deposit') {
        await pool.execute(
          'UPDATE bookings SET status = ?, deposit_paid_date = ? WHERE id = ?',
          [newStatus, payment_date, bookingId]
        );
      } else if (payment_type === 'balance') {
        await pool.execute(
          'UPDATE bookings SET status = ?, balance_paid_date = ? WHERE id = ?',
          [newStatus, payment_date, bookingId]
        );
      } else {
        await pool.execute(
          'UPDATE bookings SET status = ? WHERE id = ?',
          [newStatus, bookingId]
        );
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: result.insertId,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    return NextResponse.json(
      { error: 'Failed to add payment' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; bookingId: string }> }
) {
  try {
    const { orgId, bookingId } = await params;
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    await pool.execute(
      'DELETE FROM payments WHERE id = ? AND booking_id = ? AND organization_id = ?',
      [paymentId, bookingId, orgId]
    );

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
