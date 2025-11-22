import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET - Get single booking with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; bookingId: string }> }
) {
  try {
    const { orgId, bookingId } = await params;

    const [bookings] = await pool.execute<RowDataPacket[]>(`
      SELECT
        b.*,
        q.quote_number,
        q.destination,
        q.itinerary_data,
        a.company_name as agent_name,
        a.email as agent_email,
        a.phone as agent_phone,
        a.commission_rate,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone
      FROM bookings b
      LEFT JOIN quotes q ON b.quote_id = q.id
      LEFT JOIN agents a ON b.agent_id = a.id
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.id = ? AND b.organization_id = ?
    `, [bookingId, orgId]);

    if (bookings.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Get payments for this booking
    const [payments] = await pool.execute<RowDataPacket[]>(`
      SELECT * FROM payments
      WHERE booking_id = ?
      ORDER BY payment_date DESC
    `, [bookingId]);

    // Get suppliers for this booking
    const [suppliers] = await pool.execute<RowDataPacket[]>(`
      SELECT * FROM booking_suppliers
      WHERE booking_id = ?
      ORDER BY service_date ASC
    `, [bookingId]);

    // Calculate totals
    const totalPaid = payments.reduce((sum: number, p: any) => {
      if (p.payment_type === 'refund') return sum - p.amount;
      return sum + Number(p.amount);
    }, 0);

    return NextResponse.json({
      booking: bookings[0],
      payments,
      suppliers,
      totalPaid,
      balanceRemaining: Number(bookings[0].total_amount) - totalPaid
    });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to fetch booking', details: error.message },
      { status: 500 }
    );
  }
}
