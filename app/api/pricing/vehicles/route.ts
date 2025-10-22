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

    // Get all vehicles with their pricing for this organization
    const [vehicles]: any = await pool.query(
      `SELECT
        v.id, v.vehicle_type, v.max_capacity, v.city,
        vp.id as pricing_id, vp.season_name, vp.start_date, vp.end_date, vp.currency,
        vp.price_per_day as fullDay, vp.price_half_day as halfDay,
        vp.airport_to_hotel as airportToHotel, vp.hotel_to_airport as hotelToAirport,
        vp.airport_roundtrip as roundTrip, vp.notes, vp.status
       FROM vehicles v
       LEFT JOIN vehicle_pricing vp ON v.id = vp.vehicle_id AND vp.status = 'active'
       WHERE v.organization_id = ? AND v.status = 'active'
       ORDER BY v.city, v.vehicle_type`,
      [decoded.organizationId]
    );

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
