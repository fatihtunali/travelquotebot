import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { markInvoiceAsPaid } from '@/lib/credits';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('tqb_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    // Check if user is admin
    if (!decoded || !decoded.role || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { invoiceId, paymentMethod, paymentReference, paymentNotes } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Mark invoice as paid and add credits
    const invoice = await markInvoiceAsPaid(invoiceId, {
      paymentMethod: paymentMethod || 'bank_transfer',
      paymentReference,
      paymentNotes,
      markedBy: decoded.userId,
    });

    // TODO: Send email notification to operator

    return NextResponse.json({
      success: true,
      invoice,
      message: `Invoice ${invoice.invoice_number} marked as paid. ₺${invoice.credits_to_add} credits added to operator account.`,
    });
  } catch (error: any) {
    console.error('Error marking invoice as paid:', error);
    return NextResponse.json(
      { error: 'Failed to mark invoice as paid', details: error.message },
      { status: 500 }
    );
  }
}
