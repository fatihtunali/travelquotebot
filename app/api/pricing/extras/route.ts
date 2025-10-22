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
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all extra expenses for this organization
    const [expenses]: any = await pool.query(
      `SELECT
        id, expense_name as expenseName, expense_category as category,
        city, currency, unit_price as unitPrice, unit_type as unitType,
        description, status
       FROM extra_expenses
       WHERE organization_id = ? AND status = 'active'
       ORDER BY expense_category, expense_name`,
      [decoded.organizationId]
    );

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching extra expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
