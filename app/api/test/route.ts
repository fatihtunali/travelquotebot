import { NextResponse } from 'next/server';
import { query, testConnection } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const isConnected = await testConnection();

    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get sample data
    const accommodations = await query(
      'SELECT id, name, city, base_price_per_night FROM accommodations LIMIT 5'
    );

    const activities = await query(
      'SELECT id, name, city, base_price FROM activities LIMIT 5'
    );

    // Get table counts
    const [accCount] = await query('SELECT COUNT(*) as count FROM accommodations');
    const [actCount] = await query('SELECT COUNT(*) as count FROM activities');

    return NextResponse.json({
      status: 'success',
      message: 'TravelQuoteBot API is running',
      version: '1.0.0',
      database: {
        connected: true,
        tables: {
          accommodations: accCount,
          activities: actCount,
        },
      },
      sampleData: {
        accommodations,
        activities,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API Test Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
