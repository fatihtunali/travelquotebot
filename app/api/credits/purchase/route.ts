import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createInvoice } from '@/lib/credits';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('tqb_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.operatorId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { amount } = body;

    // Validate amount
    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Minimum purchase amount is ₺100' },
        { status: 400 }
      );
    }

    if (amount > 10000) {
      return NextResponse.json(
        { error: 'Maximum purchase amount is ₺10,000. Contact support for larger purchases.' },
        { status: 400 }
      );
    }

    // Create invoice
    const invoice = await createInvoice(decoded.operatorId, amount, {
      taxRate: 20, // KDV 20%
      currency: 'TRY',
      type: 'deposit',
      paymentLink: process.env.PAYMENT_GATEWAY_URL, // Optional: Add payment link
    });

    // TODO: Send email notification with invoice and payment instructions

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        amount: invoice.amount,
        taxAmount: invoice.tax_amount,
        totalAmount: invoice.total_amount,
        creditsToAdd: invoice.credits_to_add,
        status: invoice.status,
        dueDate: invoice.due_date,
        paymentLink: invoice.payment_link,
      },
      message: 'Invoice created successfully. Please proceed with payment.',
    });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice', details: error.message },
      { status: 500 }
    );
  }
}
