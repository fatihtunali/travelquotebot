import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET single training itinerary
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = verifyToken(token);
    if (!userData || !userData.operatorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const itinerary = await queryOne(
      `SELECT * FROM training_itineraries WHERE id = ?`,
      [id]
    );

    if (!itinerary) {
      return NextResponse.json(
        { error: 'Training itinerary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(itinerary);
  } catch (error: any) {
    console.error('Error fetching training itinerary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch training itinerary' },
      { status: 500 }
    );
  }
}

// PATCH - Update training itinerary (mainly for rating)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = verifyToken(token);
    if (!userData || !userData.operatorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { qualityScore, title, content } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const queryParams: any[] = [];

    if (qualityScore !== undefined) {
      if (qualityScore < 1 || qualityScore > 5) {
        return NextResponse.json(
          { error: 'Quality score must be between 1 and 5' },
          { status: 400 }
        );
      }
      updates.push('quality_score = ?');
      queryParams.push(qualityScore);
    }

    if (title !== undefined) {
      updates.push('title = ?');
      queryParams.push(title);
    }

    if (content !== undefined) {
      updates.push('content = ?');
      queryParams.push(content);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push('updated_at = NOW()');
    queryParams.push(id);

    await execute(
      `UPDATE training_itineraries SET ${updates.join(', ')} WHERE id = ?`,
      queryParams
    );

    return NextResponse.json({
      success: true,
      message: 'Training itinerary updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating training itinerary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update training itinerary' },
      { status: 500 }
    );
  }
}

// DELETE training itinerary
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = verifyToken(token);
    if (!userData || !userData.operatorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await execute('DELETE FROM training_itineraries WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Training itinerary deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting training itinerary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete training itinerary' },
      { status: 500 }
    );
  }
}
