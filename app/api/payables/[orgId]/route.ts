import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET - List all payables (unpaid/partial invoices)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');
    const overdue = searchParams.get('overdue');

    let query = `
      SELECT si.*, s.name as supplier_name, s.email as supplier_email,
        (si.total_amount - si.amount_paid) as balance_due,
        DATEDIFF(CURDATE(), si.due_date) as days_overdue
      FROM supplier_invoices si
      JOIN suppliers s ON si.supplier_id = s.id
      WHERE si.organization_id = ? AND si.status != 'paid' AND si.status != 'cancelled'
    `;
    const queryParams: (string | number)[] = [orgId];

    if (status) {
      query += ' AND si.status = ?';
      queryParams.push(status);
    }

    if (supplierId) {
      query += ' AND si.supplier_id = ?';
      queryParams.push(supplierId);
    }

    if (overdue === 'true') {
      query += ' AND si.due_date < CURDATE()';
    }

    query += ' ORDER BY si.due_date ASC';

    const [payables] = await pool.execute<RowDataPacket[]>(query, queryParams);

    // Calculate summary
    let totalPayables = 0;
    let overdueAmount = 0;
    let overdueCount = 0;
    let dueSoon = 0; // Due in next 7 days

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    payables.forEach((invoice: RowDataPacket) => {
      const balanceDue = Number(invoice.balance_due);
      totalPayables += balanceDue;

      const dueDate = new Date(invoice.due_date);
      if (dueDate < today) {
        overdueAmount += balanceDue;
        overdueCount++;
      } else if (dueDate <= nextWeek) {
        dueSoon += balanceDue;
      }
    });

    return NextResponse.json({
      payables,
      summary: {
        total_payables: totalPayables,
        overdue_amount: overdueAmount,
        overdue_count: overdueCount,
        due_soon: dueSoon,
        invoice_count: payables.length
      }
    });
  } catch (error) {
    console.error('Error fetching payables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payables' },
      { status: 500 }
    );
  }
}
