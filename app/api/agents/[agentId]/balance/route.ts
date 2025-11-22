import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET - Get agent balance and summary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    // Get agent details with commission settings
    const [agents] = await pool.execute<RowDataPacket[]>(`
      SELECT id, name, email, commission_rate, commission_type
      FROM agents WHERE id = ?
    `, [agentId]);

    if (agents.length === 0) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const agent = agents[0];

    // Get current balance (from last transaction)
    const [lastTransaction] = await pool.execute<RowDataPacket[]>(
      'SELECT running_balance FROM agent_transactions WHERE agent_id = ? ORDER BY id DESC LIMIT 1',
      [agentId]
    );

    const currentBalance = lastTransaction.length > 0
      ? Number(lastTransaction[0].running_balance)
      : 0;

    // Get transaction summary by type
    const [summary] = await pool.execute<RowDataPacket[]>(`
      SELECT
        transaction_type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM agent_transactions
      WHERE agent_id = ?
      GROUP BY transaction_type
    `, [agentId]);

    // Get totals for each type
    const totals: { [key: string]: { count: number; total: number } } = {};
    summary.forEach((row: RowDataPacket) => {
      totals[row.transaction_type] = {
        count: row.count,
        total: Number(row.total)
      };
    });

    // Calculate total bookings, payments, etc.
    const totalBookings = totals['booking']?.total || 0;
    const totalPayments = totals['payment']?.total || 0;
    const totalCommissions = totals['commission']?.total || 0;
    const totalAdjustments = totals['adjustment']?.total || 0;
    const totalRefunds = totals['refund']?.total || 0;

    // Get recent transactions
    const [recentTransactions] = await pool.execute<RowDataPacket[]>(`
      SELECT t.*,
        CASE
          WHEN t.reference_type = 'booking' THEN b.booking_number
          WHEN t.reference_type = 'invoice' THEN i.invoice_number
          ELSE NULL
        END as reference_number
      FROM agent_transactions t
      LEFT JOIN bookings b ON t.reference_type = 'booking' AND t.reference_id = b.id
      LEFT JOIN invoices i ON t.reference_type = 'invoice' AND t.reference_id = i.id
      WHERE t.agent_id = ?
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT 10
    `, [agentId]);

    // Get booking stats for this agent
    const [bookingStats] = await pool.execute<RowDataPacket[]>(`
      SELECT
        COUNT(*) as total_bookings,
        SUM(total_amount) as total_booking_value,
        SUM(CASE WHEN status = 'fully_paid' THEN 1 ELSE 0 END) as paid_bookings
      FROM bookings
      WHERE agent_id = ?
    `, [agentId]);

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        commission_rate: agent.commission_rate,
        commission_type: agent.commission_type
      },
      balance: {
        current: currentBalance,
        total_bookings: totalBookings,
        total_payments: totalPayments,
        total_commissions: totalCommissions,
        total_adjustments: totalAdjustments,
        total_refunds: totalRefunds
      },
      bookingStats: bookingStats[0] || {
        total_bookings: 0,
        total_booking_value: 0,
        paid_bookings: 0
      },
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching agent balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent balance' },
      { status: 500 }
    );
  }
}
