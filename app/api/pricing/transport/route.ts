import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Verify authentication
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

    // Fetch transport services for this operator
    const services = await query(
      `SELECT
        id,
        name,
        type,
        from_location,
        to_location,
        distance_km,
        duration_minutes,
        base_price,
        price_per_person,
        currency,
        max_passengers,
        vehicle_type,
        amenities,
        is_active,
        created_at
      FROM operator_transport
      WHERE operator_id = ?
      ORDER BY created_at DESC`,
      [operatorId]
    );

    // Parse JSON fields
    const servicesWithParsedJson = (services as any[]).map((service) => ({
      ...service,
      amenities: service.amenities ? JSON.parse(service.amenities) : null,
    }));

    return NextResponse.json(servicesWithParsedJson);
  } catch (error: any) {
    console.error('Failed to fetch transport services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
