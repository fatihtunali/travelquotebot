import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Get single invoice with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; id: string }> }
) {
  try {
    const { orgId, id } = await params;

    const [invoices] = await pool.execute<RowDataPacket[]>(`
      SELECT
        i.*,
        b.booking_number,
        b.destination,
        b.customer_name as booking_customer,
        b.start_date,
        b.end_date
      FROM invoices i
      LEFT JOIN bookings b ON i.booking_id = b.id
      WHERE i.id = ? AND i.organization_id = ?
    `, [id, orgId]);

    if (invoices.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get invoice items
    const [items] = await pool.execute<RowDataPacket[]>(`
      SELECT * FROM invoice_items
      WHERE invoice_id = ?
      ORDER BY id ASC
    `, [id]);

    // Get payments for this invoice
    const [payments] = await pool.execute<RowDataPacket[]>(`
      SELECT * FROM payments
      WHERE invoice_id = ?
      ORDER BY payment_date DESC
    `, [id]);

    return NextResponse.json({
      invoice: invoices[0],
      items,
      payments
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; id: string }> }
) {
  try {
    const { orgId, id } = await params;
    const body = await request.json();

    const {
      bill_to_name,
      bill_to_email,
      bill_to_address,
      items,
      tax_rate,
      discount_amount,
      due_date,
      notes,
      terms,
      status
    } = body;

    // Recalculate totals if items provided
    if (items && items.length > 0) {
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
      const taxAmount = subtotal * ((tax_rate || 0) / 100);
      const totalAmount = subtotal + taxAmount - (discount_amount || 0);

      // Get current amount_paid
      const [current]: any = await pool.query(
        'SELECT amount_paid FROM invoices WHERE id = ?',
        [id]
      );
      const amountPaid = current[0]?.amount_paid || 0;
      const balanceDue = totalAmount - amountPaid;

      // Update invoice
      await pool.execute(`
        UPDATE invoices SET
          bill_to_name = COALESCE(?, bill_to_name),
          bill_to_email = COALESCE(?, bill_to_email),
          bill_to_address = COALESCE(?, bill_to_address),
          subtotal = ?,
          tax_rate = ?,
          tax_amount = ?,
          discount_amount = ?,
          total_amount = ?,
          balance_due = ?,
          due_date = COALESCE(?, due_date),
          notes = COALESCE(?, notes),
          terms = COALESCE(?, terms),
          status = COALESCE(?, status),
          updated_at = NOW()
        WHERE id = ? AND organization_id = ?
      `, [
        bill_to_name, bill_to_email, bill_to_address,
        subtotal, tax_rate || 0, taxAmount, discount_amount || 0,
        totalAmount, balanceDue,
        due_date, notes, terms, status,
        id, orgId
      ]);

      // Delete existing items and insert new ones
      await pool.execute('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);

      for (const item of items) {
        await pool.execute(`
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
          VALUES (?, ?, ?, ?, ?)
        `, [
          id,
          item.description,
          item.quantity || 1,
          item.unit_price,
          (item.quantity || 1) * item.unit_price
        ]);
      }
    } else {
      // Simple update without items
      const fields: string[] = [];
      const values: any[] = [];

      if (bill_to_name) { fields.push('bill_to_name = ?'); values.push(bill_to_name); }
      if (bill_to_email) { fields.push('bill_to_email = ?'); values.push(bill_to_email); }
      if (bill_to_address) { fields.push('bill_to_address = ?'); values.push(bill_to_address); }
      if (due_date) { fields.push('due_date = ?'); values.push(due_date); }
      if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }
      if (terms !== undefined) { fields.push('terms = ?'); values.push(terms); }
      if (status) { fields.push('status = ?'); values.push(status); }

      if (fields.length > 0) {
        fields.push('updated_at = NOW()');
        values.push(id, orgId);
        await pool.execute(
          `UPDATE invoices SET ${fields.join(', ')} WHERE id = ? AND organization_id = ?`,
          values
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; id: string }> }
) {
  try {
    const { orgId, id } = await params;

    await pool.execute(`
      UPDATE invoices
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ? AND organization_id = ?
    `, [id, orgId]);

    return NextResponse.json({
      success: true,
      message: 'Invoice cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invoice' },
      { status: 500 }
    );
  }
}
