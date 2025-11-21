import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - List all agents for an organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    let query = `
      SELECT
        a.*,
        (SELECT COUNT(*) FROM quotes WHERE agent_id = a.id) as total_quotes,
        (SELECT COUNT(*) FROM quotes WHERE agent_id = a.id AND status = 'accepted') as accepted_quotes,
        (SELECT COALESCE(SUM(total_price), 0) FROM quotes WHERE agent_id = a.id AND status = 'accepted') as total_revenue
      FROM agents a
      WHERE a.organization_id = ?
    `;
    const queryParams: any[] = [orgId];

    if (status !== 'all') {
      query += ' AND a.status = ?';
      queryParams.push(status);
    }

    if (search) {
      query += ' AND (a.company_name LIKE ? OR a.contact_person LIKE ? OR a.email LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY a.company_name ASC';

    const [agents] = await pool.execute<RowDataPacket[]>(query, queryParams);

    // Get stats
    const [stats] = await pool.execute<RowDataPacket[]>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM agents
      WHERE organization_id = ?
    `, [orgId]);

    return NextResponse.json({
      agents,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST - Create a new agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const body = await request.json();

    const {
      company_name,
      contact_person,
      email,
      phone,
      address,
      country,
      commission_rate,
      payment_terms,
      currency,
      notes
    } = body;

    if (!company_name || !email) {
      return NextResponse.json(
        { error: 'Company name and email are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO agents (
        organization_id, company_name, contact_person, email, phone,
        address, country, commission_rate, payment_terms, currency, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orgId,
      company_name,
      contact_person || null,
      email,
      phone || null,
      address || null,
      country || null,
      commission_rate || 10.00,
      payment_terms || 30,
      currency || 'EUR',
      notes || null
    ]);

    return NextResponse.json({
      success: true,
      agentId: result.insertId,
      message: 'Agent created successfully'
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

// PUT - Update an agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id, orgId);

    await pool.execute(`
      UPDATE agents SET ${fields.join(', ')}
      WHERE id = ? AND organization_id = ?
    `, values);

    return NextResponse.json({
      success: true,
      message: 'Agent updated successfully'
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Check if agent has any quotes
    const [quotes] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM quotes WHERE agent_id = ?',
      [id]
    );

    if (quotes[0].count > 0) {
      // Soft delete - set to inactive instead
      await pool.execute(
        'UPDATE agents SET status = ? WHERE id = ? AND organization_id = ?',
        ['inactive', id, orgId]
      );
      return NextResponse.json({
        success: true,
        message: 'Agent deactivated (has existing quotes)'
      });
    }

    await pool.execute(
      'DELETE FROM agents WHERE id = ? AND organization_id = ?',
      [id, orgId]
    );

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
