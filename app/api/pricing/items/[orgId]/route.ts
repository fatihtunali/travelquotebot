import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

// C6: Remove fallback - JWT_SECRET is required
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// GET all pricing items across all categories for itinerary builder
// Updated to match actual database schema
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

    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || 'Winter 2025-26';
    const category = searchParams.get('category'); // optional filter

    // Fetch hotels with pricing (per person price in double room)
    const [hotels]: any = await pool.query(
      `SELECT
        h.id,
        h.hotel_name as name,
        h.city as location,
        CONCAT(h.star_rating, '-star') as category,
        h.notes as description,
        hp.double_room_bb as price_per_night,
        hp.season_name as season,
        'hotel' as item_type
      FROM hotels h
      LEFT JOIN hotel_pricing hp ON h.id = hp.hotel_id
        AND hp.season_name = ?
        AND hp.status = 'active'
      WHERE h.organization_id = ?
        AND h.status = 'active'
      ORDER BY h.hotel_name`,
      [season, orgId]
    );

    // Fetch tours with pricing (using SIC 2 pax or PVT 2 pax based on tour type)
    const [tours]: any = await pool.query(
      `SELECT
        t.id,
        t.tour_name as name,
        t.city as location,
        t.description,
        t.duration_days,
        t.duration_hours,
        t.duration_type,
        CASE
          WHEN t.duration_hours IS NOT NULL THEN CONCAT(t.duration_hours, ' hrs')
          ELSE CONCAT(t.duration_days, ' days')
        END as duration,
        t.tour_type,
        CASE
          WHEN t.tour_type = 'SIC' THEN tp.sic_price_2_pax
          WHEN t.tour_type = 'PRIVATE' THEN tp.pvt_price_2_pax
          ELSE tp.sic_price_2_pax
        END as price_per_person,
        tp.season_name as season,
        'tour' as item_type
      FROM tours t
      LEFT JOIN tour_pricing tp ON t.id = tp.tour_id
        AND tp.season_name = ?
        AND tp.status = 'active'
      WHERE t.organization_id = ?
        AND t.status = 'active'
      ORDER BY t.tour_name`,
      [season, orgId]
    );

    // Fetch vehicles with pricing (day rentals only)
    const [vehicleData]: any = await pool.query(
      `SELECT
        v.id,
        v.vehicle_type,
        v.max_capacity as capacity,
        v.city as location,
        v.description,
        vp.price_per_day,
        vp.season_name as season
      FROM vehicles v
      LEFT JOIN vehicle_pricing vp ON v.id = vp.vehicle_id
        AND vp.season_name = ?
        AND vp.status = 'active'
      WHERE v.organization_id = ?
        AND v.status = 'active'
      ORDER BY v.vehicle_type`,
      [season, orgId]
    );

    // Fetch airport transfers from intercity_transfers table
    const [transferData]: any = await pool.query(
      `SELECT
        it.id,
        it.vehicle_id,
        it.from_city,
        it.to_city,
        it.price_oneway,
        it.season_name as season,
        v.vehicle_type,
        v.max_capacity as capacity
      FROM intercity_transfers it
      JOIN vehicles v ON it.vehicle_id = v.id
      WHERE it.organization_id = ?
        AND it.status = 'active'
        AND it.season_name = ?
        AND (it.from_city LIKE '%Airport' OR it.to_city LIKE '%Airport')
      ORDER BY it.from_city, it.to_city`,
      [orgId, season]
    );

    // Create separate items for day rentals and airport transfers
    const vehicles: any[] = [];

    // Add day rentals
    vehicleData.forEach((v: any) => {
      if (v.price_per_day) {
        vehicles.push({
          id: `${v.id}_day`,
          vehicle_id: v.id,
          name: `${v.vehicle_type} - Day Rental`,
          type: v.vehicle_type,
          capacity: v.capacity,
          location: v.location,
          description: v.description,
          price_per_day: v.price_per_day,
          season: v.season,
          item_type: 'vehicle',
          transfer_type: 'day_rental'
        });
      }
    });

    // Add airport transfers from intercity_transfers table
    transferData.forEach((t: any) => {
      const isArrival = t.from_city.includes('Airport');
      const city = isArrival ? t.to_city : t.from_city;

      vehicles.push({
        id: `transfer_${t.id}`,
        transfer_id: t.id,
        vehicle_id: t.vehicle_id,
        name: `${t.vehicle_type} - ${isArrival ? 'Airport to Hotel' : 'Hotel to Airport'}`,
        type: t.vehicle_type,
        capacity: t.capacity,
        location: city,
        description: `Transfer from ${t.from_city} to ${t.to_city}`,
        price_per_unit: t.price_oneway,
        season: t.season,
        item_type: 'transfer',
        transfer_type: isArrival ? 'airport_to_hotel' : 'hotel_to_airport',
        unit_type: 'transfer'
      });
    });

    // Add roundtrip transfers (if any exist in the data)
    const roundtripTransfers = transferData.filter((t: any) =>
      t.from_city.includes('Airport') && t.to_city.includes('Airport')
    );
    roundtripTransfers.forEach((t: any) => {
      vehicles.push({
        id: `transfer_${t.id}_rt`,
        transfer_id: t.id,
        vehicle_id: t.vehicle_id,
        name: `${t.vehicle_type} - Airport Roundtrip`,
        type: t.vehicle_type,
        capacity: t.capacity,
        location: t.from_city.replace(' Airport', ''),
        description: 'Roundtrip transfer (airport-hotel-airport)',
        price_per_unit: t.price_oneway * 2,
        season: t.season,
        item_type: 'transfer',
        transfer_type: 'airport_roundtrip',
        unit_type: 'transfer'
      });
    });

    // Fetch guides with pricing (using full_day_price)
    const [guides]: any = await pool.query(
      `SELECT
        g.id,
        CONCAT(g.language, ' Guide') as name,
        g.language as languages,
        g.city as location,
        g.description,
        gp.full_day_price as price_per_day,
        gp.season_name as season,
        'guide' as item_type
      FROM guides g
      LEFT JOIN guide_pricing gp ON g.id = gp.guide_id
        AND gp.season_name = ?
        AND gp.status = 'active'
      WHERE g.organization_id = ?
        AND g.status = 'active'
      ORDER BY g.language`,
      [season, orgId]
    );

    // Fetch entrance fees with pricing (using adult_price)
    const [entranceFees]: any = await pool.query(
      `SELECT
        e.id,
        e.site_name as name,
        e.city as location,
        e.description,
        ep.adult_price as price_per_person,
        ep.season_name as season,
        'entrance_fee' as item_type
      FROM entrance_fees e
      LEFT JOIN entrance_fee_pricing ep ON e.id = ep.entrance_fee_id
        AND ep.season_name = ?
        AND ep.status = 'active'
      WHERE e.organization_id = ?
        AND e.status = 'active'
      ORDER BY e.site_name`,
      [season, orgId]
    );

    // Fetch meals with pricing (meal_pricing is the combined table)
    const [meals]: any = await pool.query(
      `SELECT
        m.id,
        CONCAT(m.restaurant_name, ' - ', m.meal_type) as name,
        m.restaurant_name,
        m.meal_type as type,
        m.city as location,
        m.menu_description as description,
        CASE
          WHEN m.meal_type = 'Lunch' THEN m.adult_lunch_price
          WHEN m.meal_type = 'Dinner' THEN m.adult_dinner_price
          ELSE (m.adult_lunch_price + m.adult_dinner_price) / 2
        END as price_per_person,
        m.season_name as season,
        'meal' as item_type
      FROM meal_pricing m
      WHERE m.organization_id = ?
        AND m.season_name = ?
        AND m.status = 'active'
      ORDER BY m.restaurant_name`,
      [orgId, season]
    );

    // Fetch extras (extra_expenses is the combined table)
    const [extras]: any = await pool.query(
      `SELECT
        e.id,
        e.expense_name as name,
        e.expense_category as category,
        e.city as location,
        e.description,
        e.unit_price as price_per_unit,
        e.unit_type,
        'extra' as item_type
      FROM extra_expenses e
      WHERE e.organization_id = ?
        AND e.status = 'active'
      ORDER BY e.expense_name`,
      [orgId]
    );

    // Organize by category
    const allItems = {
      hotels: hotels,
      tours: tours,
      vehicles: vehicles,
      guides: guides,
      entrance_fees: entranceFees,
      meals: meals,
      extras: extras
    };

    // If category filter is provided, return only that category
    if (category && allItems[category as keyof typeof allItems]) {
      return NextResponse.json({
        category,
        items: allItems[category as keyof typeof allItems],
        season
      });
    }

    // Return all items organized by category
    return NextResponse.json({
      ...allItems,
      season,
      total_items: hotels.length + tours.length + vehicles.length +
                   guides.length + entranceFees.length + meals.length + extras.length
    });

  } catch (error) {
    console.error('Error fetching pricing items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing items' },
      { status: 500 }
    );
  }
}
