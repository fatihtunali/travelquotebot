import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Get single supplier with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; supplierId: string }> }
) {
  try {
    const { supplierId } = await params;

    const [suppliers] = await pool.execute<RowDataPacket[]>(`
      SELECT s.*,
        (SELECT COUNT(*) FROM supplier_invoices WHERE supplier_id = s.id) as invoice_count,
        (SELECT SUM(total_amount) FROM supplier_invoices WHERE supplier_id = s.id) as total_invoiced,
        (SELECT SUM(amount_paid) FROM supplier_invoices WHERE supplier_id = s.id) as total_paid,
        (SELECT SUM(total_amount - amount_paid) FROM supplier_invoices WHERE supplier_id = s.id AND status != 'paid' AND status != 'cancelled') as outstanding_balance
      FROM suppliers s
      WHERE s.id = ?
    `, [supplierId]);

    if (suppliers.length === 0) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Get recent invoices
    const [recentInvoices] = await pool.execute<RowDataPacket[]>(`
      SELECT * FROM supplier_invoices
      WHERE supplier_id = ?
      ORDER BY invoice_date DESC
      LIMIT 10
    `, [supplierId]);

    // Get recent payments
    const [recentPayments] = await pool.execute<RowDataPacket[]>(`
      SELECT p.*, si.invoice_number
      FROM ap_payments p
      LEFT JOIN supplier_invoices si ON p.supplier_invoice_id = si.id
      WHERE p.supplier_id = ?
      ORDER BY p.payment_date DESC
      LIMIT 10
    `, [supplierId]);

    return NextResponse.json({
      supplier: suppliers[0],
      recentInvoices,
      recentPayments
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    );
  }
}

// PUT - Update supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; supplierId: string }> }
) {
  try {
    const { supplierId } = await params;
    const body = await request.json();

    const {
      name,
      contact_person,
      email,
      phone,
      address,
      city,
      country,
      tax_id,
      payment_terms,
      currency,
      bank_name,
      bank_account,
      bank_iban,
      bank_swift,
      category,
      status,
      notes
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Supplier name is required' },
        { status: 400 }
      );
    }

    await pool.execute(`
      UPDATE suppliers SET
        name = ?,
        contact_person = ?,
        email = ?,
        phone = ?,
        address = ?,
        city = ?,
        country = ?,
        tax_id = ?,
        payment_terms = ?,
        currency = ?,
        bank_name = ?,
        bank_account = ?,
        bank_iban = ?,
        bank_swift = ?,
        category = ?,
        status = ?,
        notes = ?
      WHERE id = ?
    `, [
      name,
      contact_person || null,
      email || null,
      phone || null,
      address || null,
      city || null,
      country || null,
      tax_id || null,
      payment_terms || 30,
      currency || 'EUR',
      bank_name || null,
      bank_account || null,
      bank_iban || null,
      bank_swift || null,
      category || 'other',
      status || 'active',
      notes || null,
      supplierId
    ]);

    return NextResponse.json({
      success: true,
      message: 'Supplier updated successfully'
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

// DELETE - Delete supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; supplierId: string }> }
) {
  try {
    const { supplierId } = await params;

    // Check for existing invoices
    const [invoices] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM supplier_invoices WHERE supplier_id = ?',
      [supplierId]
    );

    if (invoices[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier with existing invoices. Set to inactive instead.' },
        { status: 400 }
      );
    }

    await pool.execute('DELETE FROM suppliers WHERE id = ?', [supplierId]);

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
