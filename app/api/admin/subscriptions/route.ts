import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [subscriptions]: any = await pool.query(
      `SELECT s.*, o.name as organization_name
       FROM subscriptions s
       JOIN organizations o ON s.organization_id = o.id
       ORDER BY s.created_at DESC`
    );

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organization_id, plan_type, monthly_credits, price } = await request.json();

    if (!organization_id || !plan_type || !monthly_credits) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate period end (1 month from now)
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Create subscription
    await pool.query(
      `INSERT INTO subscriptions
       (organization_id, plan_type, monthly_credits, price, status, current_period_end)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [organization_id, plan_type, monthly_credits, price, 'active', periodEnd]
    );

    // Update organization credits
    await pool.query(
      `UPDATE organization_credits
       SET credits_total = credits_total + ?
       WHERE organization_id = ?`,
      [monthly_credits, organization_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
