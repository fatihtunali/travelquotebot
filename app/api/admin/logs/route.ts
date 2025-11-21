import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action') || '';
    const resourceType = searchParams.get('resourceType') || '';
    const organizationId = searchParams.get('organizationId') || '';

    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params: (string | number)[] = [];

    if (action) {
      whereClause += ' AND al.action LIKE ?';
      params.push(`%${action}%`);
    }

    if (resourceType) {
      whereClause += ' AND al.resource_type = ?';
      params.push(resourceType);
    }

    if (organizationId) {
      whereClause += ' AND al.organization_id = ?';
      params.push(parseInt(organizationId));
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM activity_logs al WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get logs with user and organization info
    // Note: Using template literals for LIMIT/OFFSET since they're already sanitized via parseInt
    const [logs] = await pool.execute<RowDataPacket[]>(
      `SELECT
        al.id,
        al.organization_id,
        al.user_id,
        al.action,
        al.resource_type,
        al.resource_id,
        al.details,
        al.ip_address,
        al.created_at,
        u.first_name,
        u.last_name,
        u.email as user_email,
        o.name as organization_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN organizations o ON al.organization_id = o.id
      WHERE ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    // Get unique resource types for filter
    const [resourceTypes] = await pool.execute<RowDataPacket[]>(
      `SELECT DISTINCT resource_type FROM activity_logs WHERE resource_type IS NOT NULL ORDER BY resource_type`
    );

    // Get unique actions for filter
    const [actions] = await pool.execute<RowDataPacket[]>(
      `SELECT DISTINCT action FROM activity_logs ORDER BY action`
    );

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: {
        resourceTypes: resourceTypes.map(r => r.resource_type),
        actions: actions.map(a => a.action)
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}
