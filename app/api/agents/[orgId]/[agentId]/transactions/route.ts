import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - List transactions for an agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');

    let query = `
      SELECT t.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        CASE
          WHEN t.reference_type = 'booking' THEN b.booking_number
          WHEN t.reference_type = 'invoice' THEN i.invoice_number
          ELSE NULL
        END as reference_number
      FROM agent_transactions t
      LEFT JOIN users u ON t.created_by_user_id = u.id
      LEFT JOIN bookings b ON t.reference_type = 'booking' AND t.reference_id = b.id
      LEFT JOIN invoices i ON t.reference_type = 'invoice' AND t.reference_id = i.id
      WHERE t.agent_id = ?
    `;
    const queryParams: (string | number)[] = [agentId];

    if (type) {
      query += ' AND t.transaction_type = ?';
      queryParams.push(type);
    }

    query += ' ORDER BY t.transaction_date DESC, t.id DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [transactions] = await pool.execute<RowDataPacket[]>(query, queryParams);

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM agent_transactions WHERE agent_id = ?' +
      (type ? ' AND transaction_type = ?' : ''),
      type ? [agentId, type] : [agentId]
    );

    return NextResponse.json({
      transactions,
      total: countResult[0].total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching agent transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST - Create a transaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; agentId: string }> }
) {
  try {
    const { orgId, agentId } = await params;
    const body = await request.json();

    const {
      transaction_type,
      reference_type,
      reference_id,
      amount,
      description,
      currency,
      transaction_date,
      created_by_user_id
    } = body;

    if (!transaction_type || amount === undefined || !transaction_date) {
      return NextResponse.json(
        { error: 'Transaction type, amount, and date are required' },
        { status: 400 }
      );
    }

    // Get current balance
    const [lastTransaction] = await pool.execute<RowDataPacket[]>(
      'SELECT running_balance FROM agent_transactions WHERE agent_id = ? ORDER BY id DESC LIMIT 1',
      [agentId]
    );

    const currentBalance = lastTransaction.length > 0
      ? Number(lastTransaction[0].running_balance)
      : 0;

    // Calculate new balance
    const transactionAmount = Number(amount);
    let newBalance: number;

    if (transaction_type === 'payment') {
      newBalance = currentBalance - Math.abs(transactionAmount);
    } else if (transaction_type === 'refund') {
      newBalance = currentBalance - Math.abs(transactionAmount);
    } else {
      newBalance = currentBalance + transactionAmount;
    }

    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO agent_transactions (
        organization_id, agent_id, transaction_type, reference_type, reference_id,
        amount, running_balance, description, currency, transaction_date, created_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orgId,
      agentId,
      transaction_type,
      reference_type || null,
      reference_id || null,
      transactionAmount,
      newBalance,
      description || null,
      currency || 'EUR',
      transaction_date,
      created_by_user_id || null
    ]);

    return NextResponse.json({
      success: true,
      transactionId: result.insertId,
      newBalance,
      message: 'Transaction recorded successfully'
    });
  } catch (error) {
    console.error('Error creating agent transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
