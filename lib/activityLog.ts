import pool from '@/lib/db';

interface LogActivityParams {
  organizationId?: number | null;
  userId?: number | null;
  action: string;
  resourceType?: string | null;
  resourceId?: number | null;
  details?: string | null;
  ipAddress?: string | null;
}

export async function logActivity({
  organizationId = null,
  userId = null,
  action,
  resourceType = null,
  resourceId = null,
  details = null,
  ipAddress = null,
}: LogActivityParams): Promise<void> {
  try {
    await pool.execute(
      `INSERT INTO activity_logs
       (organization_id, user_id, action, resource_type, resource_id, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [organizationId, userId, action, resourceType, resourceId, details, ipAddress]
    );
  } catch (error) {
    // Log error but don't throw - activity logging should not break main functionality
    console.error('Failed to log activity:', error);
  }
}

// Helper to extract IP from request
export function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return null;
}
