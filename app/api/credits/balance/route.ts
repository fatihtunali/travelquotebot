import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getOrCreateCreditAccount, getCurrentPricing } from '@/lib/credits';

export async function GET(request: NextRequest) {
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

    // Get credit account
    const account = await getOrCreateCreditAccount(decoded.operatorId);

    // Get current pricing
    const pricing = await getCurrentPricing('itinerary_generation');

    return NextResponse.json({
      success: true,
      balance: account.balance,
      totalPurchased: account.total_purchased,
      totalSpent: account.total_spent,
      pricing: {
        pricePerItinerary: pricing.price_per_unit,
        currency: pricing.currency,
      },
      itinerariesRemaining: Math.floor(account.balance / pricing.price_per_unit),
    });
  } catch (error: any) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit balance', details: error.message },
      { status: 500 }
    );
  }
}
