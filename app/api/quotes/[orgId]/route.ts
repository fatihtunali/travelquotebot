import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { logActivity, getClientIP } from '@/lib/activityLog';

// C6: Remove fallback - JWT_SECRET is required
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// POST - Create new quote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const clientIP = getClientIP(request);

  try {
    const { orgId } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      destination,
      start_date,
      end_date,
      adults,
      children,
      total_price,
      agent_id,
      client_id
    } = body;

    // Auto-save customer to clients table if not already exists
    let finalClientId = client_id;
    if (!client_id && !agent_id && customer_email) {
      // Check if client with this email already exists for this organization
      const [existingClient]: any = await pool.query(
        `SELECT id FROM clients WHERE organization_id = ? AND email = ?`,
        [orgId, customer_email]
      );

      if (existingClient.length > 0) {
        // Use existing client
        finalClientId = existingClient[0].id;
        console.log(`📋 Found existing client: ${finalClientId}`);
      } else {
        // Create new client
        const [newClientResult]: any = await pool.query(
          `INSERT INTO clients (organization_id, name, email, phone, source, created_at)
           VALUES (?, ?, ?, ?, 'manual_quote', NOW())`,
          [orgId, customer_name, customer_email, customer_phone || null]
        );
        finalClientId = newClientResult.insertId;
        console.log(`✨ Auto-created new client: ${finalClientId} (${customer_name})`);
      }
    }

    // Generate quote number (globally unique across all organizations)
    const [lastQuote]: any = await pool.query(
      `SELECT quote_number FROM quotes ORDER BY id DESC LIMIT 1`
    );

    let quoteNumber;
    if (lastQuote.length > 0) {
      const lastNumber = parseInt(lastQuote[0].quote_number.split('-')[2]);
      quoteNumber = `ITA-2025-${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      quoteNumber = 'ITA-2025-0001';
    }

    // Insert quote
    const [result]: any = await pool.query(
      `INSERT INTO quotes (
        organization_id,
        created_by_user_id,
        quote_number,
        customer_name,
        customer_email,
        customer_phone,
        destination,
        start_date,
        end_date,
        adults,
        children,
        total_price,
        agent_id,
        client_id,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW())`,
      [
        orgId,
        decoded.userId,
        quoteNumber,
        customer_name,
        customer_email,
        customer_phone,
        destination,
        start_date,
        end_date,
        adults,
        children,
        total_price,
        agent_id || null,
        finalClientId || null
      ]
    );

    // Log quote creation
    await logActivity({
      organizationId: parseInt(orgId),
      userId: decoded.userId,
      action: 'quote_created',
      resourceType: 'quote',
      resourceId: result.insertId,
      details: `Quote ${quoteNumber} created for ${customer_name} - ${destination}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({
      success: true,
      quoteId: result.insertId,
      quoteNumber: quoteNumber
    });

  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

// GET - Get all quotes for organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const [quotes]: any = await pool.query(
      `SELECT
        q.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        a.company_name as agent_name,
        c.name as client_name
      FROM quotes q
      LEFT JOIN users u ON q.created_by_user_id = u.id
      LEFT JOIN agents a ON q.agent_id = a.id
      LEFT JOIN clients c ON q.client_id = c.id
      WHERE q.organization_id = ?
      ORDER BY q.created_at DESC`,
      [orgId]
    );

    return NextResponse.json({ quotes });

  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}
