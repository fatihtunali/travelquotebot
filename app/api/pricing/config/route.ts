import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/pricing/config - Get operator's pricing configuration
export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = verifyToken(token);
  if (!userData || !userData.operatorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get operator pricing config
    const config = await queryOne<any>(`
      SELECT *
      FROM operator_pricing_config
      WHERE operator_id = ?
    `, [userData.operatorId]);

    if (!config) {
      // Create default config if it doesn't exist
      const newConfigId = uuidv4();
      await execute(`
        INSERT INTO operator_pricing_config (
          id, operator_id,
          single_supplement_type, single_supplement_value,
          triple_room_discount_percentage,
          three_star_multiplier, four_star_multiplier, five_star_multiplier,
          default_markup_percentage, default_tax_percentage,
          currency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newConfigId, userData.operatorId,
        'percentage', 50.00, 10.00,
        0.70, 1.00, 1.40,
        15.00, 0.00,
        'USD'
      ]);

      const newConfig = await queryOne<any>(`
        SELECT * FROM operator_pricing_config WHERE id = ?
      `, [newConfigId]);

      return NextResponse.json(newConfig);
    }

    // Get child pricing slabs
    const childSlabs = await query<any>(`
      SELECT *
      FROM operator_child_pricing
      WHERE operator_id = ? AND is_active = TRUE
      ORDER BY display_order, min_age
    `, [userData.operatorId]);

    return NextResponse.json({
      ...config,
      childSlabs
    });

  } catch (error) {
    console.error('Failed to fetch pricing config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing configuration' },
      { status: 500 }
    );
  }
}

// PUT /api/pricing/config - Update operator's pricing configuration
export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userData = verifyToken(token);
  if (!userData || !userData.operatorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const {
      single_supplement_type,
      single_supplement_value,
      triple_room_discount_percentage,
      three_star_multiplier,
      four_star_multiplier,
      five_star_multiplier,
      default_markup_percentage,
      default_tax_percentage,
      currency
    } = body;

    // Update configuration
    await execute(`
      UPDATE operator_pricing_config
      SET
        single_supplement_type = ?,
        single_supplement_value = ?,
        triple_room_discount_percentage = ?,
        three_star_multiplier = ?,
        four_star_multiplier = ?,
        five_star_multiplier = ?,
        default_markup_percentage = ?,
        default_tax_percentage = ?,
        currency = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE operator_id = ?
    `, [
      single_supplement_type,
      single_supplement_value,
      triple_room_discount_percentage,
      three_star_multiplier,
      four_star_multiplier,
      five_star_multiplier,
      default_markup_percentage,
      default_tax_percentage,
      currency,
      userData.operatorId
    ]);

    // Fetch updated config
    const updatedConfig = await queryOne<any>(`
      SELECT * FROM operator_pricing_config WHERE operator_id = ?
    `, [userData.operatorId]);

    return NextResponse.json(updatedConfig);

  } catch (error) {
    console.error('Failed to update pricing config:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing configuration' },
      { status: 500 }
    );
  }
}
