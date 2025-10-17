import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here_change_in_production';

export async function GET() {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as { operatorId: string };
    const operatorId = decoded.operatorId;

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
