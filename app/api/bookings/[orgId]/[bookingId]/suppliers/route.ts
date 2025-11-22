import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// GET - Fetch all suppliers for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; bookingId: string }> }
) {
  try {
    const { orgId, bookingId } = await params;

    // Verify token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.organizationId !== parseInt(orgId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [suppliers] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM booking_suppliers
       WHERE booking_id = ?
       ORDER BY service_date ASC`,
      [bookingId]
    );

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

// POST - Add a new supplier
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; bookingId: string }> }
) {
  try {
    const { orgId, bookingId } = await params;

    // Verify token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.organizationId !== parseInt(orgId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      type,
      service_date,
      service_details,
      cost,
      currency,
      confirmation_number,
      notes
    } = body;

    // Validate required fields
    if (!name || !type || !service_date || !service_details || cost === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO booking_suppliers
       (booking_id, name, type, service_date, service_details, cost, currency, confirmation_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        name,
        type,
        service_date,
        service_details,
        cost,
        currency || 'EUR',
        confirmation_number || null,
        notes || null
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Supplier added successfully'
    });
  } catch (error) {
    console.error('Error adding supplier:', error);
    return NextResponse.json(
      { error: 'Failed to add supplier' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; bookingId: string }> }
) {
  try {
    const { orgId, bookingId } = await params;

    // Verify token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.organizationId !== parseInt(orgId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('id');

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM booking_suppliers WHERE id = ? AND booking_id = ?`,
      [supplierId, bookingId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}
