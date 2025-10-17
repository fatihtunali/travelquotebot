import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Fetch single additional service
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userData;
    try {
      userData = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 }
      );
    }

    const operatorId = userData.operatorId;
    const { id } = await params;

    const services = await query(
      `SELECT
        id, name, service_type, price, price_type, currency,
        description, mandatory, included_in_packages, is_active
      FROM operator_additional_services
      WHERE id = ? AND operator_id = ?`,
      [id, operatorId]
    );

    if (!services || (services as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const service = (services as any[])[0];

    return NextResponse.json({
      ...service,
      included_in_packages: service.included_in_packages ? JSON.parse(service.included_in_packages) : null,
    });
  } catch (error: any) {
    console.error('Failed to fetch service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT - Update additional service
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userData;
    try {
      userData = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 }
      );
    }

    const operatorId = userData.operatorId;
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      service_type,
      price,
      price_type,
      currency,
      description,
      mandatory,
      included_in_packages,
      is_active,
    } = body;

    await query(
      `UPDATE operator_additional_services
      SET name = ?, service_type = ?, price = ?, price_type = ?,
          currency = ?, description = ?, mandatory = ?,
          included_in_packages = ?, is_active = ?, updated_at = NOW()
      WHERE id = ? AND operator_id = ?`,
      [
        name,
        service_type,
        price,
        price_type,
        currency,
        description,
        mandatory,
        JSON.stringify(included_in_packages),
        is_active,
        id,
        operatorId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE - Delete additional service
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userData;
    try {
      userData = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 }
      );
    }

    const operatorId = userData.operatorId;
    const { id } = await params;

    await query(
      'DELETE FROM operator_additional_services WHERE id = ? AND operator_id = ?',
      [id, operatorId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
