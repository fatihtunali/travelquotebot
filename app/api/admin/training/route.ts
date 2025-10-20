import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET all training itineraries with filters
export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    const userData = verifyToken(token);

    if (!userData || !userData.operatorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days');
    const tourType = searchParams.get('tourType');
    const minQuality = searchParams.get('minQuality') || '0';

    let sql = `
      SELECT id, title, tour_type, days, cities,
             LENGTH(content) as content_length,
             COALESCE(quality_score, 3) as quality_score,
             created_at, updated_at
      FROM training_itineraries
      WHERE quality_score >= ?
    `;
    const params: any[] = [parseInt(minQuality)];

    if (days) {
      sql += ' AND days = ?';
      params.push(parseInt(days));
    }

    if (tourType) {
      sql += ' AND tour_type = ?';
      params.push(tourType);
    }

    sql += ' ORDER BY quality_score DESC, created_at DESC';

    const itineraries = await query(sql, params);

    // Get statistics
    const stats = await query<any>(`
      SELECT
        COUNT(*) as total,
        AVG(COALESCE(quality_score, 3)) as avg_quality,
        SUM(CASE WHEN quality_score >= 4 THEN 1 ELSE 0 END) as high_quality_count,
        COUNT(DISTINCT days) as unique_durations,
        COUNT(DISTINCT tour_type) as unique_tour_types
      FROM training_itineraries
    `);

    return NextResponse.json({
      itineraries,
      stats: stats[0] || {},
    });
  } catch (error: any) {
    console.error('Error fetching training itineraries:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch training data' },
      { status: 500 }
    );
  }
}

// POST - Add new training itinerary
export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    const userData = verifyToken(token);

    if (!userData || !userData.operatorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, tourType, days, cities, content, qualityScore } = body;

    // Validate required fields
    if (!title || !tourType || !days || !cities || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, tourType, days, cities, content' },
        { status: 400 }
      );
    }

    // Validate days and quality score
    if (days < 2 || days > 30) {
      return NextResponse.json(
        { error: 'Days must be between 2 and 30' },
        { status: 400 }
      );
    }

    const quality = qualityScore || 3;
    if (quality < 1 || quality > 5) {
      return NextResponse.json(
        { error: 'Quality score must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Insert training itinerary
    await execute(
      `INSERT INTO training_itineraries
       (title, tour_type, days, cities, content, quality_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [title, tourType, days, cities, content, quality]
    );

    return NextResponse.json({
      success: true,
      message: 'Training itinerary added successfully',
    });
  } catch (error: any) {
    console.error('Error adding training itinerary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add training itinerary' },
      { status: 500 }
    );
  }
}
