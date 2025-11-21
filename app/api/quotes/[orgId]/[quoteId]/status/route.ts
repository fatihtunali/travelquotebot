import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';
import { sendQuoteEmail } from '@/lib/email';

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

    // Fetch quote data for email if status is being changed to 'sent'
    let quoteData: any = null;
    if (status === 'sent') {
      const [quotes]: any = await pool.query(
        `SELECT q.*, o.name as organization_name, o.email as organization_email, o.phone as organization_phone
         FROM quotes q
         LEFT JOIN organizations o ON q.organization_id = o.id
         WHERE q.id = ? AND q.organization_id = ?`,
        [quoteId, orgId]
      );
      if (quotes.length > 0) {
        quoteData = quotes[0];
      }
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

    // Send email to client when status changes to 'sent'
    if (status === 'sent' && quoteData && quoteData.customer_email) {
      try {
        await sendQuoteEmail(
          quoteData.customer_email,
          quoteData.customer_name,
          quoteData.quote_number,
          quoteData.destination,
          quoteData.total_amount || 0,
          quoteData.currency || 'USD',
          quoteData.expires_at,
          quoteData.organization_name || 'Travel Agency',
          quoteData.organization_email || '',
          quoteData.organization_phone || ''
        );
      } catch (emailError) {
        console.error('Failed to send quote email to client:', emailError);
        // Don't fail the request if email fails
      }
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
