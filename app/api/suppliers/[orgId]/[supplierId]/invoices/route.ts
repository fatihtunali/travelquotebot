import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - List invoices for a supplier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; supplierId: string }> }
) {
  try {
    const { supplierId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `
      SELECT si.*, s.name as supplier_name
      FROM supplier_invoices si
      JOIN suppliers s ON si.supplier_id = s.id
      WHERE si.supplier_id = ?
    `;
    const queryParams: (string | number)[] = [supplierId];

    if (status) {
      query += ' AND si.status = ?';
      queryParams.push(status);
    }

    query += ' ORDER BY si.invoice_date DESC';

    const [invoices] = await pool.execute<RowDataPacket[]>(query, queryParams);

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching supplier invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST - Create a supplier invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; supplierId: string }> }
) {
  try {
    const { orgId, supplierId } = await params;
    const body = await request.json();

    const {
      invoice_number,
      invoice_date,
      due_date,
      subtotal,
      tax_amount,
      total_amount,
      currency,
      reference_type,
      reference_id,
      description,
      notes
    } = body;

    if (!invoice_number || !invoice_date || !due_date || !total_amount) {
      return NextResponse.json(
        { error: 'Invoice number, dates, and total amount are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO supplier_invoices (
        organization_id, supplier_id, invoice_number, invoice_date, due_date,
        subtotal, tax_amount, total_amount, currency, reference_type, reference_id,
        description, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      orgId,
      supplierId,
      invoice_number,
      invoice_date,
      due_date,
      subtotal || 0,
      tax_amount || 0,
      total_amount,
      currency || 'EUR',
      reference_type || null,
      reference_id || null,
      description || null,
      notes || null
    ]);

    return NextResponse.json({
      success: true,
      invoiceId: result.insertId,
      message: 'Supplier invoice created successfully'
    });
  } catch (error) {
    console.error('Error creating supplier invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
