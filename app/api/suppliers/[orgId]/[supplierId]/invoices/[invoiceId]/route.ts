import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET - Get single invoice with payments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; supplierId: string; invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;

    const [invoices] = await pool.execute<RowDataPacket[]>(`
      SELECT si.*, s.name as supplier_name, s.email as supplier_email
      FROM supplier_invoices si
      JOIN suppliers s ON si.supplier_id = s.id
      WHERE si.id = ?
    `, [invoiceId]);

    if (invoices.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get payments for this invoice
    const [payments] = await pool.execute<RowDataPacket[]>(`
      SELECT * FROM ap_payments
      WHERE supplier_invoice_id = ?
      ORDER BY payment_date DESC
    `, [invoiceId]);

    return NextResponse.json({
      invoice: invoices[0],
      payments
    });
  } catch (error) {
    console.error('Error fetching supplier invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; supplierId: string; invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;
    const body = await request.json();

    const {
      invoice_number,
      invoice_date,
      due_date,
      subtotal,
      tax_amount,
      total_amount,
      status,
      description,
      notes
    } = body;

    await pool.execute(`
      UPDATE supplier_invoices SET
        invoice_number = ?,
        invoice_date = ?,
        due_date = ?,
        subtotal = ?,
        tax_amount = ?,
        total_amount = ?,
        status = ?,
        description = ?,
        notes = ?
      WHERE id = ?
    `, [
      invoice_number,
      invoice_date,
      due_date,
      subtotal || 0,
      tax_amount || 0,
      total_amount,
      status || 'pending',
      description || null,
      notes || null,
      invoiceId
    ]);

    return NextResponse.json({
      success: true,
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Error updating supplier invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; supplierId: string; invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;

    // Check for payments
    const [payments] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM ap_payments WHERE supplier_invoice_id = ?',
      [invoiceId]
    );

    if (payments[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete invoice with payments. Cancel it instead.' },
        { status: 400 }
      );
    }

    await pool.execute('DELETE FROM supplier_invoices WHERE id = ?', [invoiceId]);

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
