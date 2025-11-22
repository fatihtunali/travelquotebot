import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - List all invoices
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
        i.*,
        b.booking_number,
        b.destination
      FROM invoices i
      LEFT JOIN bookings b ON i.booking_id = b.id
      WHERE i.organization_id = ?
    `;
    const queryParams: any[] = [orgId];

    if (status !== 'all') {
      query += ' AND i.status = ?';
      queryParams.push(status);
    }

    if (search) {
      query += ' AND (i.invoice_number LIKE ? OR i.bill_to_name LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    query += ' ORDER BY i.created_at DESC';

    const [invoices] = await pool.execute<RowDataPacket[]>(query, queryParams);

    // Get stats
    const [stats] = await pool.execute<RowDataPacket[]>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'partially_paid' THEN 1 ELSE 0 END) as partially_paid,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
        COALESCE(SUM(total_amount), 0) as total_invoiced,
        COALESCE(SUM(amount_paid), 0) as total_received,
        COALESCE(SUM(balance_due), 0) as total_outstanding
      FROM invoices
      WHERE organization_id = ? AND status != 'cancelled'
    `, [orgId]);

    return NextResponse.json({
      invoices,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST - Create invoice from booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const body = await request.json();

    const {
      booking_id,
      bill_to_type,
      bill_to_id,
      bill_to_name,
      bill_to_email,
      bill_to_address,
      items,
      tax_rate,
      discount_amount,
      due_date,
      notes,
      terms
    } = body;

    if (!booking_id || !bill_to_name || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Booking ID, bill to name, and items are required' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const [lastInvoice]: any = await pool.query(
      `SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1`
    );

    let invoiceNumber;
    if (lastInvoice.length > 0) {
      const lastNumber = parseInt(lastInvoice[0].invoice_number.split('-')[2]);
      invoiceNumber = `INV-2025-${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      invoiceNumber = 'INV-2025-0001';
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = subtotal * ((tax_rate || 0) / 100);
    const totalAmount = subtotal + taxAmount - (discount_amount || 0);
    const balanceDue = totalAmount;

    // Insert invoice
    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO invoices (
        organization_id, booking_id, invoice_number,
        bill_to_type, bill_to_id, bill_to_name, bill_to_email, bill_to_address,
        subtotal, tax_rate, tax_amount, discount_amount,
        total_amount, amount_paid, balance_due,
        invoice_date, due_date, notes, terms, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, CURDATE(), ?, ?, ?, 'draft')
    `, [
      orgId, booking_id, invoiceNumber,
      bill_to_type || 'customer', bill_to_id || null, bill_to_name, bill_to_email || null, bill_to_address || null,
      subtotal, tax_rate || 0, taxAmount, discount_amount || 0,
      totalAmount, balanceDue,
      due_date, notes || null, terms || null
    ]);

    const invoiceId = result.insertId;

    // Insert invoice items
    for (const item of items) {
      await pool.execute(`
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
        VALUES (?, ?, ?, ?, ?)
      `, [
        invoiceId,
        item.description,
        item.quantity || 1,
        item.unit_price,
        (item.quantity || 1) * item.unit_price
      ]);
    }

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceNumber,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
