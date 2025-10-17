import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPendingInvoices } from '@/lib/credits';

export async function GET(request: NextRequest) {
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

    // Get pending invoices
    const invoices = await getPendingInvoices(100);

    return NextResponse.json({
      success: true,
      invoices,
      count: invoices.length,
    });
  } catch (error: any) {
    console.error('Error fetching pending invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending invoices', details: error.message },
      { status: 500 }
    );
  }
}
