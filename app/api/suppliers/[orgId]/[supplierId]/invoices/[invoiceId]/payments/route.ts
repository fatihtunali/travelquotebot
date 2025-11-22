import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// POST - Record a payment for an invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; supplierId: string; invoiceId: string }> }
) {
  try {
    const { orgId, supplierId, invoiceId } = await params;
    const body = await request.json();

    const {
      amount,
      payment_date,
      payment_method,
      reference_number,
      notes,
      created_by_user_id
    } = body;

    if (!amount || !payment_date) {
      return NextResponse.json(
        { error: 'Amount and payment date are required' },
        { status: 400 }
      );
    }

    // Get current invoice
    const [invoices] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM supplier_invoices WHERE id = ?',
      [invoiceId]
    );

    if (invoices.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoice = invoices[0];
    const paymentAmount = Number(amount);
    const newAmountPaid = Number(invoice.amount_paid) + paymentAmount;
    const totalAmount = Number(invoice.total_amount);

    // Insert payment
    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO ap_payments (
        organization_id, supplier_id, supplier_invoice_id, payment_date,
        amount, payment_method, reference_number, currency, notes, created_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orgId,
      supplierId,
      invoiceId,
      payment_date,
      paymentAmount,
      payment_method || 'bank_transfer',
      reference_number || null,
      invoice.currency || 'EUR',
      notes || null,
      created_by_user_id || null
    ]);

    // Update invoice amount_paid and status
    let newStatus = invoice.status;
    if (newAmountPaid >= totalAmount) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partial';
    }

    await pool.execute(`
      UPDATE supplier_invoices
      SET amount_paid = ?, status = ?
      WHERE id = ?
    `, [newAmountPaid, newStatus, invoiceId]);

    return NextResponse.json({
      success: true,
      paymentId: result.insertId,
      newAmountPaid,
      newStatus,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}
