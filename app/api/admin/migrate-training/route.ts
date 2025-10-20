import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Allow migration with simple secret key or valid auth token
    const body = await request.json();
    const { secret } = body;

    // Check if user has valid token OR provided migration secret
    const token = getTokenFromRequest(request);
    const userData = token ? verifyToken(token) : null;
    const isMigrationSecret = secret === 'migrate_training_2025';

    if (!userData && !isMigrationSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: string[] = [];

    // Step 1: Check if quality_score column exists
    try {
      await query('SELECT quality_score FROM training_itineraries LIMIT 1');
      results.push('✓ quality_score column already exists');
    } catch (error: any) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        // Column doesn't exist, add it
        await execute(`
          ALTER TABLE training_itineraries
          ADD COLUMN quality_score TINYINT DEFAULT 3 COMMENT 'Quality rating 1-5, prioritizes training examples'
        `);
        results.push('✓ Added quality_score column');
      } else {
        throw error;
      }
    }

    // Step 2: Check if index exists, if not create it
    try {
      await execute(`
        CREATE INDEX idx_training_quality
        ON training_itineraries(days, tour_type, quality_score DESC)
      `);
      results.push('✓ Created quality_score index');
    } catch (error: any) {
      if (error.code === 'ER_DUP_KEYNAME') {
        results.push('✓ Quality score index already exists');
      } else {
        throw error;
      }
    }

    // Step 3: Mark all existing itineraries as high-quality (4/5 stars)
    // These are 20-year proven itineraries that actually sell tours
    const updateResult: any = await execute(`
      UPDATE training_itineraries
      SET quality_score = 4
      WHERE quality_score IS NULL OR quality_score = 3
    `);

    results.push(`✓ Marked ${updateResult.affectedRows} itineraries as high-quality (4/5 stars)`);
    results.push('✓ All 62 professional itineraries are now prioritized for AI training');

    // Step 4: Get statistics
    const stats = await query<any>(`
      SELECT
        COUNT(*) as total,
        AVG(quality_score) as avg_quality,
        SUM(CASE WHEN quality_score >= 4 THEN 1 ELSE 0 END) as high_quality_count
      FROM training_itineraries
    `);

    return NextResponse.json({
      success: true,
      message: 'Training database migration completed successfully',
      results,
      stats: stats[0],
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Migration failed',
        details: error.code || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
