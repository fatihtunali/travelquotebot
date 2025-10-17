import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// DELETE - Delete price variation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; priceId: string }> }
) {
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
    const { id, priceId } = await params;

    // Verify the service belongs to this operator
    const services = await query(
      'SELECT id FROM operator_additional_services WHERE id = ? AND operator_id = ?',
      [id, operatorId]
    );

    if (!services || (services as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Delete the price variation
    await query(
      'DELETE FROM additional_service_price_variations WHERE id = ? AND service_id = ?',
      [priceId, id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete price variation:', error);
    return NextResponse.json(
      { error: 'Failed to delete price variation' },
      { status: 500 }
    );
  }
}
