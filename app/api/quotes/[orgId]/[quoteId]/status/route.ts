import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

// PUT - Update quote status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; quoteId: string }> }
) {
  try {
    const { orgId, quoteId } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Build update query based on status
    let updateFields = 'status = ?';
    const updateValues: any[] = [status];

    // Set timestamp fields based on status
    if (status === 'sent') {
      updateFields += ', sent_at = NOW()';
    } else if (status === 'viewed') {
      updateFields += ', viewed_at = NOW()';
    } else if (status === 'accepted') {
      updateFields += ', accepted_at = NOW()';
    } else if (status === 'rejected') {
      updateFields += ', rejected_at = NOW()';
    }

    updateValues.push(quoteId, orgId);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE quotes SET ${updateFields} WHERE id = ? AND organization_id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Quote status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating quote status:', error);
    return NextResponse.json(
      { error: 'Failed to update quote status' },
      { status: 500 }
    );
  }
}
