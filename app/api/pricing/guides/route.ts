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

    const guides = await query(
      `SELECT
        id,
        name,
        guide_type,
        languages,
        specialization,
        price_per_day,
        price_per_hour,
        price_half_day,
        currency,
        max_group_size,
        cities,
        description,
        is_active,
        created_at
      FROM operator_guide_services
      WHERE operator_id = ?
      ORDER BY created_at DESC`,
      [operatorId]
    );

    const guidesWithParsedJson = (guides as any[]).map((guide) => ({
      ...guide,
      languages: guide.languages ? JSON.parse(guide.languages) : null,
      cities: guide.cities ? JSON.parse(guide.cities) : null,
    }));

    return NextResponse.json(guidesWithParsedJson);
  } catch (error: any) {
    console.error('Failed to fetch guide services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide services' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const body = await request.json();

    const {
      name,
      guide_type,
      languages = [],
      specialization = '',
      price_per_day,
      price_per_hour = 0,
      price_half_day = 0,
      currency = 'USD',
      max_group_size = 10,
      cities = [],
      description = '',
      is_active = true
    } = body;

    if (!name || !price_per_day || languages.length === 0 || cities.length === 0) {
      return NextResponse.json(
        { error: 'Name, price_per_day, languages, and cities are required' },
        { status: 400 }
      );
    }

    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    const languagesJson = JSON.stringify(languages);
    const citiesJson = JSON.stringify(cities);

    await query(
      `INSERT INTO operator_guide_services (
        id,
        operator_id,
        name,
        guide_type,
        languages,
        specialization,
        price_per_day,
        price_per_hour,
        price_half_day,
        currency,
        max_group_size,
        cities,
        description,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        operatorId,
        name,
        guide_type,
        languagesJson,
        specialization,
        price_per_day,
        price_per_hour,
        price_half_day,
        currency,
        max_group_size,
        citiesJson,
        description,
        is_active ? 1 : 0
      ]
    );

    return NextResponse.json({
      id,
      name,
      guide_type,
      languages,
      specialization,
      price_per_day,
      price_per_hour,
      price_half_day,
      currency,
      max_group_size,
      cities,
      description,
      is_active
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create guide:', error);
    return NextResponse.json(
      { error: 'Failed to create guide' },
      { status: 500 }
    );
  }
}
