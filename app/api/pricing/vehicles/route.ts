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

    // Get filter parameters
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country_id');
    const city = (searchParams.get('city') || '').trim();

    // Build WHERE clause
    let whereClause = 'v.organization_id = ? AND v.status = ?';
    const params: any[] = [decoded.organizationId, 'active'];

    if (countryId && countryId !== 'all') {
      whereClause += ' AND v.country_id = ?';
      params.push(parseInt(countryId));
    }

    if (city && city !== 'All') {
      whereClause += ' AND v.city = ?';
      params.push(city);
    }

    // Get all vehicles with their pricing for this organization
    const [vehicles]: any = await pool.query(
      `SELECT
        v.id, v.vehicle_type, v.max_capacity, v.city, v.country_id,
        vp.id as pricing_id, vp.season_name, vp.start_date, vp.end_date, vp.currency,
        vp.price_per_day as fullDay, vp.price_half_day as halfDay,
        vp.notes, vp.status
       FROM vehicles v
       LEFT JOIN vehicle_pricing vp ON v.id = vp.vehicle_id AND vp.status = 'active'
       WHERE ${whereClause}
       ORDER BY v.city, v.vehicle_type`,
      params
    );

    // Get all unique countries for this organization
    const [countries]: any = await pool.query(
      `SELECT DISTINCT v.country_id, c.country_name, c.flag_emoji
       FROM vehicles v
       JOIN countries c ON v.country_id = c.id
       WHERE v.organization_id = ? AND v.status = 'active'
       ORDER BY c.country_name`,
      [decoded.organizationId]
    );

    // Get all unique cities for this organization
    const [citiesResult]: any = await pool.query(
      `SELECT DISTINCT city FROM vehicles
       WHERE organization_id = ? AND status = 'active' AND city IS NOT NULL
       ORDER BY city`,
      [decoded.organizationId]
    );
    const cities = citiesResult.map((row: any) => row.city);

    return NextResponse.json({
      data: vehicles,
      filters: {
        countries: countries,
        cities: cities
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();

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
    const { vehicle, pricing } = body;

    if (!vehicle || !pricing) {
      return NextResponse.json(
        { error: 'Vehicle and pricing data are required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!vehicle.vehicle_type || !vehicle.max_capacity || !vehicle.city) {
      return NextResponse.json(
        { error: 'Vehicle type, max capacity, and city are required' },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // Insert vehicle
    const [vehicleResult]: any = await connection.query(
      `INSERT INTO vehicles (vehicle_type, max_capacity, city, organization_id, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [
        vehicle.vehicle_type,
        vehicle.max_capacity,
        vehicle.city,
        decoded.organizationId
      ]
    );

    const vehicleId = vehicleResult.insertId;

    // Insert pricing
    const [pricingResult]: any = await connection.query(
      `INSERT INTO vehicle_pricing (
        vehicle_id, season_name, start_date, end_date, currency,
        price_per_day, price_half_day, notes, status, created_by
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [
        vehicleId,
        pricing.season_name || null,
        pricing.start_date || null,
        pricing.end_date || null,
        pricing.currency || 'USD',
        pricing.price_per_day || 0,
        pricing.price_half_day || 0,
        pricing.notes || null,
        decoded.userId
      ]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Vehicle and pricing created successfully',
      data: {
        vehicleId,
        pricingId: pricingResult.insertId,
        vehicle: {
          id: vehicleId,
          vehicle_type: vehicle.vehicle_type,
          max_capacity: vehicle.max_capacity,
          city: vehicle.city
        }
      }
    }, { status: 201 });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function PUT(request: NextRequest) {
  const connection = await pool.getConnection();

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
    const { vehicleId, vehicle, pricing } = body;

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // Verify vehicle belongs to user's organization
    const [existingVehicle]: any = await connection.query(
      'SELECT id FROM vehicles WHERE id = ? AND organization_id = ? AND status = "active"',
      [vehicleId, decoded.organizationId]
    );

    if (existingVehicle.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Vehicle not found or access denied' },
        { status: 404 }
      );
    }

    // Update vehicle if data provided
    if (vehicle) {
      await connection.query(
        `UPDATE vehicles
         SET vehicle_type = COALESCE(?, vehicle_type),
             max_capacity = COALESCE(?, max_capacity),
             city = COALESCE(?, city)
         WHERE id = ?`,
        [
          vehicle.vehicle_type || null,
          vehicle.max_capacity || null,
          vehicle.city || null,
          vehicleId
        ]
      );
    }

    // Update or create pricing if data provided
    let pricingId = null;
    if (pricing) {
      if (pricing.id) {
        // Update existing pricing
        await connection.query(
          `UPDATE vehicle_pricing
           SET season_name = COALESCE(?, season_name),
               start_date = COALESCE(?, start_date),
               end_date = COALESCE(?, end_date),
               currency = COALESCE(?, currency),
               price_per_day = COALESCE(?, price_per_day),
               price_half_day = COALESCE(?, price_half_day),
               notes = COALESCE(?, notes)
           WHERE id = ? AND vehicle_id = ?`,
          [
            pricing.season_name || null,
            pricing.start_date || null,
            pricing.end_date || null,
            pricing.currency || null,
            pricing.price_per_day !== undefined ? pricing.price_per_day : null,
            pricing.price_half_day !== undefined ? pricing.price_half_day : null,
            pricing.notes || null,
            pricing.id,
            vehicleId
          ]
        );
        pricingId = pricing.id;
      } else {
        // Create new pricing
        const [newPricing]: any = await connection.query(
          `INSERT INTO vehicle_pricing (
            vehicle_id, season_name, start_date, end_date, currency,
            price_per_day, price_half_day, notes, status, created_by
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
          [
            vehicleId,
            pricing.season_name || null,
            pricing.start_date || null,
            pricing.end_date || null,
            pricing.currency || 'USD',
            pricing.price_per_day || 0,
            pricing.price_half_day || 0,
            pricing.notes || null,
            decoded.userId
          ]
        );
        pricingId = newPricing.insertId;
      }
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Vehicle and pricing updated successfully',
      data: {
        vehicleId,
        pricingId
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function DELETE(request: NextRequest) {
  const connection = await pool.getConnection();

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
    const vehicleId = searchParams.get('id');

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // Verify vehicle belongs to user's organization
    const [existingVehicle]: any = await connection.query(
      'SELECT id FROM vehicles WHERE id = ? AND organization_id = ? AND status = "active"',
      [vehicleId, decoded.organizationId]
    );

    if (existingVehicle.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Vehicle not found or access denied' },
        { status: 404 }
      );
    }

    // Soft delete vehicle
    await connection.query(
      'UPDATE vehicles SET status = "inactive" WHERE id = ?',
      [vehicleId]
    );

    // Soft delete associated pricing
    await connection.query(
      'UPDATE vehicle_pricing SET status = "archived" WHERE vehicle_id = ?',
      [vehicleId]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Vehicle and associated pricing deleted successfully',
      data: {
        vehicleId: parseInt(vehicleId)
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
