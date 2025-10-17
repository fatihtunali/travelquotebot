import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Verify authentication
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

    // Fetch all itinerary requests for this operator
    const requests: any[] = await query(
      `SELECT
        id,
        customer_name,
        customer_email,
        num_travelers,
        start_date,
        end_date,
        preferences,
        status,
        created_at
       FROM itineraries
       WHERE operator_id = ?
       ORDER BY created_at DESC`,
      [userData.operatorId]
    );

    // Parse preferences JSON for each request
    const formattedRequests = requests.map(req => {
      let preferences = {};
      try {
        preferences = req.preferences ? JSON.parse(req.preferences) : {};
      } catch (err) {
        console.error('Failed to parse preferences:', err);
      }

      return {
        id: req.id,
        customerName: req.customer_name,
        customerEmail: req.customer_email,
        numTravelers: req.num_travelers,
        startDate: req.start_date,
        endDate: req.end_date,
        preferences,
        status: req.status,
        createdAt: req.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      requests: formattedRequests,
    });
  } catch (error: any) {
    console.error('Requests fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load requests', message: error.message },
      { status: 500 }
    );
  }
}
