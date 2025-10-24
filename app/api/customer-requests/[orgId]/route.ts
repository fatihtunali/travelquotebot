import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest, validators } from '@/lib/security';

// GET - Fetch all customer itineraries for an organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const orgIdNum = parseInt(orgId);

    // C2: Add authorization check with org match
    const auth = await authenticateRequest(request, {
      requireOrgId: true,
      checkOrgMatch: orgIdNum
    });

    if (!auth.authorized || !auth.user) {
      return auth.error!;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const source = searchParams.get('source') || 'all'; // online, manual, or all

    console.log(`🔍 Fetching customer requests: orgId=${orgId}, status=${status}, source=${source}`);

    // C1: Fix SQL injection - use whitelist validation
    if (!validators.status(status)) {
      return NextResponse.json({ error: 'Invalid status parameter' }, { status: 400 });
    }

    // Validate source parameter
    const validSources = ['all', 'online', 'manual'];
    if (!validSources.includes(source)) {
      return NextResponse.json({ error: 'Invalid source parameter' }, { status: 400 });
    }

    // Build query based on filters (now safe from SQL injection)
    const conditions = [];
    const queryParams: any[] = [orgId];

    if (status !== 'all') {
      conditions.push('status = ?');
      queryParams.push(status);
    }

    if (source !== 'all') {
      conditions.push('source = ?');
      queryParams.push(source);
    }

    const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    // Get all customer itineraries
    const [itineraries]: any = await pool.query(
      `SELECT
        id,
        uuid,
        customer_name,
        customer_email,
        customer_phone,
        destination,
        city_nights,
        start_date,
        end_date,
        adults,
        children,
        hotel_category,
        tour_type,
        special_requests,
        total_price,
        price_per_person,
        status,
        source,
        created_at,
        updated_at
      FROM customer_itineraries
      WHERE organization_id = ?
        ${whereClause}
      ORDER BY created_at DESC`,
      queryParams
    );

    console.log(`✅ Found ${itineraries.length} itineraries matching filters`);
    if (itineraries.length > 0 && itineraries.length <= 5) {
      console.log('Itineraries:', itineraries.map((i: any) => ({ id: i.id, name: i.customer_name, source: i.source })));
    }

    // Parse JSON fields
    itineraries.forEach((itinerary: any) => {
      if (itinerary.city_nights && typeof itinerary.city_nights === 'string') {
        itinerary.city_nights = JSON.parse(itinerary.city_nights);
      }
    });

    // Calculate summary stats
    const stats = {
      total: itineraries.length,
      pending: itineraries.filter((i: any) => i.status === 'pending').length,
      confirmed: itineraries.filter((i: any) => i.status === 'confirmed').length,
      completed: itineraries.filter((i: any) => i.status === 'completed').length,
      cancelled: itineraries.filter((i: any) => i.status === 'cancelled').length,
      online: itineraries.filter((i: any) => i.source === 'online').length,
      manual: itineraries.filter((i: any) => i.source === 'manual').length
    };

    return NextResponse.json({
      itineraries,
      stats
    });

  } catch (error) {
    console.error('Error fetching customer requests:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

// PUT - Update customer itinerary status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const connection = await pool.getConnection();

  try {
    const { orgId } = await params;
    const orgIdNum = parseInt(orgId);

    // C2: Add authorization check with org match
    const auth = await authenticateRequest(request, {
      requireOrgId: true,
      checkOrgMatch: orgIdNum
    });

    if (!auth.authorized || !auth.user) {
      return auth.error!;
    }

    const body = await request.json();
    const { itineraryId, action, notes } = body;

    // Validate action parameter
    const validActions = ['confirm', 'cancel', 'complete'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!itineraryId || !Number.isInteger(itineraryId)) {
      return NextResponse.json({ error: 'Invalid itinerary ID' }, { status: 400 });
    }

    // M3: Use database transaction for consistency
    await connection.beginTransaction();

    const statusMap: Record<string, string> = {
      'confirm': 'confirmed',
      'cancel': 'cancelled',
      'complete': 'completed'
    };

    await connection.query(
      `UPDATE customer_itineraries
      SET status = ?, updated_at = NOW()
      WHERE id = ? AND organization_id = ?`,
      [statusMap[action], itineraryId, orgId]
    );

    await connection.commit();

    return NextResponse.json({ success: true });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating customer request:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
