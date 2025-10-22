import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// PATCH - Update team member status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only org_admin can update team members
    if (decoded.role !== 'org_admin') {
      return NextResponse.json({ error: 'Only administrators can update team members' }, { status: 403 });
    }

    const { status } = await request.json();

    if (!status || (status !== 'active' && status !== 'inactive')) {
      return NextResponse.json(
        { error: 'Valid status is required (active or inactive)' },
        { status: 400 }
      );
    }

    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    // Verify the user belongs to the same organization
    const [users]: any = await pool.query(
      'SELECT id FROM users WHERE id = ? AND organization_id = ?',
      [userId, decoded.organizationId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found or does not belong to your organization' },
        { status: 404 }
      );
    }

    // Prevent admin from deactivating themselves
    if (parseInt(userId) === decoded.userId) {
      return NextResponse.json(
        { error: 'You cannot change your own status' },
        { status: 400 }
      );
    }

    // Update status
    await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Team member status updated successfully'
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
