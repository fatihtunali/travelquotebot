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

    // Get all meal pricing for this organization
    const [meals]: any = await pool.query(
      `SELECT
        id, restaurant_name as restaurantName, city, meal_type as mealType,
        season_name as seasonName, start_date as startDate, end_date as endDate,
        currency,
        adult_lunch_price as adultLunch, child_lunch_price as childLunch,
        adult_dinner_price as adultDinner, child_dinner_price as childDinner,
        menu_description as menuDescription, notes, status
       FROM meal_pricing
       WHERE organization_id = ? AND status = 'active'
       ORDER BY city, restaurant_name`,
      [decoded.organizationId]
    );

    return NextResponse.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
