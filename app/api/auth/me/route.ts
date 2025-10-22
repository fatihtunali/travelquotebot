import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

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

    // Get operator details
    const operators = await query(
      'SELECT id, company_name, email, subdomain FROM operators WHERE id = ?',
      [userData.operatorId]
    );

    if (!operators || (operators as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Operator not found' },
        { status: 404 }
      );
    }

    const operator = (operators as any[])[0];

    return NextResponse.json({
      userId: userData.userId,
      operatorId: userData.operatorId,
      operator: operator,
      tokenData: userData
    });
  } catch (error: any) {
    console.error('Failed to fetch user info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user info' },
      { status: 500 }
    );
  }
}
