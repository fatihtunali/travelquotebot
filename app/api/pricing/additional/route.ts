import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
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

    const services = await query(
      `SELECT
        id,
        name,
        service_type,
        price,
        price_type,
        currency,
        description,
        mandatory,
        included_in_packages,
        is_active,
        created_at
      FROM operator_additional_services
      WHERE operator_id = ?
      ORDER BY created_at DESC`,
      [operatorId]
    );

    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Failed to fetch additional services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch additional services' },
      { status: 500 }
    );
  }
}
