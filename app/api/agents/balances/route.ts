import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET - List all agents with their balances
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Get all agents with their latest balance
    const [agents] = await pool.execute<RowDataPacket[]>(`
      SELECT
        a.id,
        a.name,
        a.email,
        a.phone,
        a.company_name,
        a.commission_rate,
        a.commission_type,
        COALESCE(
          (SELECT running_balance
           FROM agent_transactions
           WHERE agent_id = a.id
           ORDER BY id DESC LIMIT 1),
          0
        ) as current_balance,
        (SELECT COUNT(*) FROM bookings WHERE agent_id = a.id) as total_bookings,
        (SELECT SUM(total_amount) FROM bookings WHERE agent_id = a.id) as total_booking_value,
        (SELECT MAX(transaction_date) FROM agent_transactions WHERE agent_id = a.id) as last_transaction_date
      FROM agents a
      WHERE a.organization_id = ?
      ORDER BY a.name ASC
    `, [orgId]);

    // Calculate totals
    let totalBalance = 0;
    let totalAgentsWithBalance = 0;
    let totalAgentsOwing = 0;

    agents.forEach((agent: RowDataPacket) => {
      const balance = Number(agent.current_balance);
      totalBalance += balance;
      if (balance !== 0) totalAgentsWithBalance++;
      if (balance > 0) totalAgentsOwing++;
    });

    return NextResponse.json({
      agents,
      summary: {
        total_agents: agents.length,
        total_balance: totalBalance,
        agents_with_balance: totalAgentsWithBalance,
        agents_owing: totalAgentsOwing
      }
    });
  } catch (error) {
    console.error('Error fetching agent balances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent balances' },
      { status: 500 }
    );
  }
}
