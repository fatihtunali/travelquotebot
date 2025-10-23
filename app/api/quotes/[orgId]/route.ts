import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// POST - Create new quote
export async function POST(
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
      total_price
    } = body;

    // Generate quote number
    const [lastQuote]: any = await pool.query(
      `SELECT quote_number FROM quotes WHERE organization_id = ? ORDER BY id DESC LIMIT 1`,
      [orgId]
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
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW())`,
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
        total_price
      ]
    );

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
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM quotes q
      LEFT JOIN users u ON q.created_by_user_id = u.id
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
