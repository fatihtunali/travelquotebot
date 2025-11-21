import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logActivity, getClientIP } from '@/lib/activityLog';

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

    // Get filter parameters
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country_id');
    const city = (searchParams.get('city') || '').trim();

    // Build WHERE clause
    let whereClause = 'organization_id = ? AND status = ?';
    const params: any[] = [decoded.organizationId, 'active'];

    if (countryId && countryId !== 'all') {
      whereClause += ' AND country_id = ?';
      params.push(parseInt(countryId));
    }

    if (city && city !== 'All') {
      whereClause += ' AND city = ?';
      params.push(city);
    }

    // Get all extra expenses for this organization
    const [expenses]: any = await pool.query(
      `SELECT
        id, expense_name as expenseName, expense_category as category,
        city, country_id, currency, unit_price as unitPrice, unit_type as unitType,
        description, status
       FROM extra_expenses
       WHERE ${whereClause}
       ORDER BY expense_category, expense_name`,
      params
    );

    // Get all unique countries for this organization
    const [countries]: any = await pool.query(
      `SELECT DISTINCT ee.country_id, c.country_name, c.flag_emoji
       FROM extra_expenses ee
       JOIN countries c ON ee.country_id = c.id
       WHERE ee.organization_id = ? AND ee.status = 'active'
       ORDER BY c.country_name`,
      [decoded.organizationId]
    );

    // Get all unique cities for this organization
    const [citiesResult]: any = await pool.query(
      `SELECT DISTINCT city FROM extra_expenses
       WHERE organization_id = ? AND status = 'active' AND city IS NOT NULL
       ORDER BY city`,
      [decoded.organizationId]
    );
    const cities = citiesResult.map((row: any) => row.city);

    return NextResponse.json({
      data: expenses,
      filters: {
        countries: countries,
        cities: cities
      }
    });
  } catch (error) {
    console.error('Error fetching extra expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { expenseName, category, city, currency, unitPrice, unitType, description } = body;

    // Validate required fields
    if (!expenseName || !category || !city || !currency || !unitPrice || !unitType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert extra expense
    const [result]: any = await pool.query(
      `INSERT INTO extra_expenses
       (organization_id, expense_name, expense_category, city, currency, unit_price, unit_type, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [decoded.organizationId, expenseName, category, city, currency, unitPrice, unitType, description || null]
    );

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'extra_created',
      resourceType: 'extra',
      resourceId: result.insertId,
      details: `Extra created: ${expenseName} in ${city}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({
      success: true,
      message: 'Extra expense created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating extra expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, expenseName, category, city, currency, unitPrice, unitType, description } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Missing expense ID' },
        { status: 400 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (expenseName !== undefined) {
      updates.push('expense_name = ?');
      values.push(expenseName);
    }
    if (category !== undefined) {
      updates.push('expense_category = ?');
      values.push(category);
    }
    if (city !== undefined) {
      updates.push('city = ?');
      values.push(city);
    }
    if (currency !== undefined) {
      updates.push('currency = ?');
      values.push(currency);
    }
    if (unitPrice !== undefined) {
      updates.push('unit_price = ?');
      values.push(unitPrice);
    }
    if (unitType !== undefined) {
      updates.push('unit_type = ?');
      values.push(unitType);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add organization_id and id to values
    values.push(decoded.organizationId, id);

    // Update extra expense
    const [result]: any = await pool.query(
      `UPDATE extra_expenses
       SET ${updates.join(', ')}
       WHERE organization_id = ? AND id = ? AND status = 'active'`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Extra expense not found or unauthorized' },
        { status: 404 }
      );
    }

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'extra_updated',
      resourceType: 'extra',
      resourceId: id,
      details: `Extra updated: ID ${id}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({
      success: true,
      message: 'Extra expense updated successfully'
    });
  } catch (error) {
    console.error('Error updating extra expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing expense ID' },
        { status: 400 }
      );
    }

    // Soft delete by setting status to 'inactive'
    const [result]: any = await pool.query(
      `UPDATE extra_expenses
       SET status = 'inactive'
       WHERE organization_id = ? AND id = ? AND status = 'active'`,
      [decoded.organizationId, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Extra expense not found or unauthorized' },
        { status: 404 }
      );
    }

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'extra_deleted',
      resourceType: 'extra',
      resourceId: parseInt(id),
      details: `Extra archived: ID ${id}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({
      success: true,
      message: 'Extra expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting extra expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
