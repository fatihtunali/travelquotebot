import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here_change_in_production';

export async function GET() {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as { operatorId: string };
    const operatorId = decoded.operatorId;

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
