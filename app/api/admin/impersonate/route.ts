import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { authenticateRequest } from '@/lib/security';
import { logActivity, getClientIP } from '@/lib/activityLog';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Only super_admin can impersonate
  const auth = await authenticateRequest(request, {
    allowedRoles: ['super_admin']
  });

  if (!auth.authorized) {
    return auth.error!;
  }

  try {
    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Get organization details
    const [orgs]: any = await pool.query(
      'SELECT id, name, slug FROM organizations WHERE id = ? AND status = "active"',
      [organizationId]
    );

    if (orgs.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found or inactive' },
        { status: 404 }
      );
    }

    const organization = orgs[0];

    // Find an org_admin user for this organization (or any active user)
    const [users]: any = await pool.query(
      `SELECT id, email, first_name, last_name, role
       FROM users
       WHERE organization_id = ? AND status = 'active'
       ORDER BY FIELD(role, 'org_admin', 'org_user') ASC
       LIMIT 1`,
      [organizationId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No active users found for this organization' },
        { status: 404 }
      );
    }

    const targetUser = users[0];

    // Generate impersonation token with special flag
    const token = generateToken({
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      organizationId: organizationId,
      impersonatedBy: auth.user!.userId,
      impersonatedByEmail: auth.user!.email
    });

    // Log the impersonation action
    await logActivity({
      organizationId: organizationId,
      userId: auth.user!.userId,
      action: 'impersonate_start',
      resourceType: 'auth',
      details: `Super admin ${auth.user!.email} started impersonating organization "${organization.name}" as user ${targetUser.email}`,
      ipAddress: clientIP,
    });

    return NextResponse.json({
      token,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.first_name,
        lastName: targetUser.last_name,
        role: targetUser.role,
        organizationId: organizationId
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      },
      impersonation: {
        active: true,
        adminId: auth.user!.userId,
        adminEmail: auth.user!.email
      }
    });
  } catch (error) {
    console.error('Impersonation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
