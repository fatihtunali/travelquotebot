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
