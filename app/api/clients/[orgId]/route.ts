import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - List all clients for an organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all';
    const agentId = searchParams.get('agent_id');
    const search = searchParams.get('search') || '';

    let query = `
      SELECT
        c.*,
        a.company_name as agent_name,
        (SELECT COUNT(*) FROM quotes WHERE client_id = c.id) as total_quotes,
        (SELECT COUNT(*) FROM customer_itineraries WHERE client_id = c.id) as total_itineraries,
        (SELECT COALESCE(SUM(total_price), 0) FROM quotes WHERE client_id = c.id AND status = 'accepted') as total_spent
      FROM clients c
      LEFT JOIN agents a ON c.agent_id = a.id
      WHERE c.organization_id = ?
    `;
    const queryParams: any[] = [orgId];

    if (source !== 'all') {
      query += ' AND c.source = ?';
      queryParams.push(source);
    }

    if (agentId) {
      query += ' AND c.agent_id = ?';
      queryParams.push(agentId);
    }

    if (search) {
      query += ' AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY c.created_at DESC';

    const [clients] = await pool.execute<RowDataPacket[]>(query, queryParams);

    // Get stats
    const [stats] = await pool.execute<RowDataPacket[]>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN source = 'direct' THEN 1 ELSE 0 END) as direct,
        SUM(CASE WHEN source = 'agent' THEN 1 ELSE 0 END) as via_agent,
        SUM(CASE WHEN source = 'website' THEN 1 ELSE 0 END) as website,
        SUM(CASE WHEN source = 'referral' THEN 1 ELSE 0 END) as referral
      FROM clients
      WHERE organization_id = ?
    `, [orgId]);

    return NextResponse.json({
      clients,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST - Create a new client
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const body = await request.json();

    const {
      agent_id,
      name,
      email,
      phone,
      country,
      nationality,
      passport_number,
      date_of_birth,
      preferences,
      tags,
      source,
      notes
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO clients (
        organization_id, agent_id, name, email, phone, country, nationality,
        passport_number, date_of_birth, preferences, tags, source, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orgId,
      agent_id || null,
      name,
      email || null,
      phone || null,
      country || null,
      nationality || null,
      passport_number || null,
      date_of_birth || null,
      preferences ? JSON.stringify(preferences) : null,
      tags || null,
      source || 'direct',
      notes || null
    ]);

    return NextResponse.json({
      success: true,
      clientId: result.insertId,
      message: 'Client created successfully'
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// PUT - Update a client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const body = await request.json();
    const { id, preferences, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
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

    if (preferences !== undefined) {
      fields.push('preferences = ?');
      values.push(JSON.stringify(preferences));
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id, orgId);

    await pool.execute(`
      UPDATE clients SET ${fields.join(', ')}
      WHERE id = ? AND organization_id = ?
    `, values);

    return NextResponse.json({
      success: true,
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a client
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
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Check if client has any quotes or itineraries
    const [quotes] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM quotes WHERE client_id = ?',
      [id]
    );
    const [itineraries] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM customer_itineraries WHERE client_id = ?',
      [id]
    );

    if (quotes[0].count > 0 || itineraries[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with existing quotes or itineraries' },
        { status: 400 }
      );
    }

    await pool.execute(
      'DELETE FROM clients WHERE id = ? AND organization_id = ?',
      [id, orgId]
    );

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
