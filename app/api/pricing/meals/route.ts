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

    // Get all meal pricing for this organization
    const [meals]: any = await pool.query(
      `SELECT
        id, restaurant_name as restaurantName, city, country_id, meal_type as mealType,
        season_name as seasonName, start_date as startDate, end_date as endDate,
        currency,
        adult_lunch_price as adultLunch, child_lunch_price as childLunch,
        adult_dinner_price as adultDinner, child_dinner_price as childDinner,
        menu_description as menuDescription, notes, status
       FROM meal_pricing
       WHERE ${whereClause}
       ORDER BY city, restaurant_name`,
      params
    );

    // Get all unique countries for this organization
    const [countries]: any = await pool.query(
      `SELECT DISTINCT mp.country_id, c.country_name, c.flag_emoji
       FROM meal_pricing mp
       JOIN countries c ON mp.country_id = c.id
       WHERE mp.organization_id = ? AND mp.status = 'active'
       ORDER BY c.country_name`,
      [decoded.organizationId]
    );

    // Get all unique cities for this organization
    const [citiesResult]: any = await pool.query(
      `SELECT DISTINCT city FROM meal_pricing
       WHERE organization_id = ? AND status = 'active' AND city IS NOT NULL
       ORDER BY city`,
      [decoded.organizationId]
    );
    const cities = citiesResult.map((row: any) => row.city);

    return NextResponse.json({
      data: meals,
      filters: {
        countries: countries,
        cities: cities
      }
    });
  } catch (error) {
    console.error('Error fetching meals:', error);
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
    const {
      restaurantName,
      city,
      mealType,
      seasonName,
      startDate,
      endDate,
      currency,
      adultLunch,
      childLunch,
      adultDinner,
      childDinner,
      menuDescription,
      notes
    } = body;

    // Validate required fields
    if (!restaurantName || !city || !mealType || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: restaurantName, city, mealType, currency' },
        { status: 400 }
      );
    }

    // Insert meal pricing record
    const [result]: any = await pool.query(
      `INSERT INTO meal_pricing (
        organization_id, restaurant_name, city, meal_type,
        season_name, start_date, end_date, currency,
        adult_lunch_price, child_lunch_price,
        adult_dinner_price, child_dinner_price,
        menu_description, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        decoded.organizationId,
        restaurantName,
        city,
        mealType,
        seasonName || null,
        startDate || null,
        endDate || null,
        currency,
        adultLunch || null,
        childLunch || null,
        adultDinner || null,
        childDinner || null,
        menuDescription || null,
        notes || null
      ]
    );

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'meal_created',
      resourceType: 'meal',
      resourceId: result.insertId,
      details: `Meal created: ${restaurantName} in ${city}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({
      message: 'Meal pricing created successfully',
      id: result.insertId,
      summary: {
        restaurant: restaurantName,
        city,
        mealType,
        season: seasonName || 'N/A',
        currency
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating meal pricing:', error);
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
    const {
      id,
      restaurantName,
      city,
      mealType,
      seasonName,
      startDate,
      endDate,
      currency,
      adultLunch,
      childLunch,
      adultDinner,
      childDinner,
      menuDescription,
      notes
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Check if record exists and belongs to the organization
    const [existing]: any = await pool.query(
      'SELECT id FROM meal_pricing WHERE id = ? AND organization_id = ?',
      [id, decoded.organizationId]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: 'Meal pricing not found or access denied' },
        { status: 404 }
      );
    }

    // Update meal pricing record
    await pool.query(
      `UPDATE meal_pricing SET
        restaurant_name = COALESCE(?, restaurant_name),
        city = COALESCE(?, city),
        meal_type = COALESCE(?, meal_type),
        season_name = ?,
        start_date = ?,
        end_date = ?,
        currency = COALESCE(?, currency),
        adult_lunch_price = ?,
        child_lunch_price = ?,
        adult_dinner_price = ?,
        child_dinner_price = ?,
        menu_description = ?,
        notes = ?
       WHERE id = ? AND organization_id = ?`,
      [
        restaurantName,
        city,
        mealType,
        seasonName,
        startDate,
        endDate,
        currency,
        adultLunch,
        childLunch,
        adultDinner,
        childDinner,
        menuDescription,
        notes,
        id,
        decoded.organizationId
      ]
    );

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'meal_updated',
      resourceType: 'meal',
      resourceId: id,
      details: `Meal updated: ${restaurantName || 'unchanged'} in ${city || 'unchanged'}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({
      message: 'Meal pricing updated successfully',
      id,
      summary: {
        restaurant: restaurantName || 'unchanged',
        city: city || 'unchanged',
        mealType: mealType || 'unchanged',
        season: seasonName || 'N/A',
        currency: currency || 'unchanged'
      }
    });
  } catch (error) {
    console.error('Error updating meal pricing:', error);
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
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Check if record exists and belongs to the organization
    const [existing]: any = await pool.query(
      `SELECT id, restaurant_name, city, meal_type
       FROM meal_pricing
       WHERE id = ? AND organization_id = ?`,
      [id, decoded.organizationId]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: 'Meal pricing not found or access denied' },
        { status: 404 }
      );
    }

    // Soft delete - update status to 'archived'
    await pool.query(
      `UPDATE meal_pricing
       SET status = 'archived'
       WHERE id = ? AND organization_id = ?`,
      [id, decoded.organizationId]
    );

    const record = existing[0];

    await logActivity({
      organizationId: decoded.organizationId,
      userId: decoded.userId,
      action: 'meal_deleted',
      resourceType: 'meal',
      resourceId: parseInt(id),
      details: `Meal archived: ${record.restaurant_name} in ${record.city}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({
      message: 'Meal pricing archived successfully',
      id,
      summary: {
        restaurant: record.restaurant_name,
        city: record.city,
        mealType: record.meal_type,
        status: 'archived'
      }
    });
  } catch (error) {
    console.error('Error deleting meal pricing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
