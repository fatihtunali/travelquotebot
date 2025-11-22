import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - List all suppliers
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = `
      SELECT s.*,
        (SELECT COUNT(*) FROM supplier_invoices WHERE supplier_id = s.id) as invoice_count,
        (SELECT SUM(total_amount) FROM supplier_invoices WHERE supplier_id = s.id) as total_invoiced,
        (SELECT SUM(total_amount - amount_paid) FROM supplier_invoices WHERE supplier_id = s.id AND status != 'paid' AND status != 'cancelled') as outstanding_balance
      FROM suppliers s
      WHERE s.organization_id = ?
    `;
    const queryParams: (string | number)[] = [orgId];

    if (status) {
      query += ' AND s.status = ?';
      queryParams.push(status);
    }

    if (category) {
      query += ' AND s.category = ?';
      queryParams.push(category);
    }

    if (search) {
      query += ' AND (s.name LIKE ? OR s.contact_person LIKE ? OR s.email LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY s.name ASC';

    const [suppliers] = await pool.execute<RowDataPacket[]>(query, queryParams);

    // Calculate summary
    let totalSuppliers = suppliers.length;
    let activeSuppliers = 0;
    let totalOutstanding = 0;

    suppliers.forEach((supplier: RowDataPacket) => {
      if (supplier.status === 'active') activeSuppliers++;
      totalOutstanding += Number(supplier.outstanding_balance) || 0;
    });

    return NextResponse.json({
      suppliers,
      summary: {
        total_suppliers: totalSuppliers,
        active_suppliers: activeSuppliers,
        total_outstanding: totalOutstanding
      }
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

// POST - Create a new supplier
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
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
      notes
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Supplier name is required' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO suppliers (
        organization_id, name, contact_person, email, phone, address, city, country,
        tax_id, payment_terms, currency, bank_name, bank_account, bank_iban, bank_swift,
        category, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orgId,
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
      notes || null
    ]);

    return NextResponse.json({
      success: true,
      supplierId: result.insertId,
      message: 'Supplier created successfully'
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}
