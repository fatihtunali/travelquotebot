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

    const operatorId = userData.operatorId;

    // Get counts for each category
    const [accommodations] = await query(
      'SELECT COUNT(*) as count FROM accommodations WHERE operator_id = ?',
      [operatorId]
    ) as any[];

    const [activities] = await query(
      'SELECT COUNT(*) as count FROM activities WHERE operator_id = ?',
      [operatorId]
    ) as any[];

    const [transport] = await query(
      'SELECT COUNT(*) as count FROM operator_transport WHERE operator_id = ?',
      [operatorId]
    ) as any[];

    const [guides] = await query(
      'SELECT COUNT(*) as count FROM operator_guide_services WHERE operator_id = ?',
      [operatorId]
    ) as any[];

    const [restaurants] = await query(
      'SELECT COUNT(*) as count FROM operator_restaurants WHERE operator_id = ?',
      [operatorId]
    ) as any[];

    const [additionalServices] = await query(
      'SELECT COUNT(*) as count FROM operator_additional_services WHERE operator_id = ?',
      [operatorId]
    ) as any[];

    const stats = {
      accommodations: accommodations.count,
      activities: activities.count,
      transport: transport.count,
      guides: guides.count,
      restaurants: restaurants.count,
      additionalServices: additionalServices.count,
      total:
        accommodations.count +
        activities.count +
        transport.count +
        guides.count +
        restaurants.count +
        additionalServices.count,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Failed to fetch pricing stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
