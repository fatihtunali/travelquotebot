import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/security';
import { fetchGoogleAdsData } from '@/lib/googleSheets';

// GET - Fetch Google Ads data from Google Sheet
export async function GET(request: NextRequest) {
  // Only super_admin can access Google Ads data
  const auth = await authenticateRequest(request, {
    allowedRoles: ['super_admin']
  });

  if (!auth.authorized) {
    return auth.error!;
  }

  try {
    // Check if required env vars are set
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
      return NextResponse.json({
        error: 'Google Sheets not configured',
        message: 'Please set GOOGLE_SHEETS_CREDENTIALS environment variable',
        configured: false
      }, { status: 200 });
    }

    if (!process.env.GOOGLE_ADS_SHEET_ID) {
      return NextResponse.json({
        error: 'Google Ads Sheet not configured',
        message: 'Please set GOOGLE_ADS_SHEET_ID environment variable',
        configured: false
      }, { status: 200 });
    }

    const data = await fetchGoogleAdsData();

    return NextResponse.json({
      success: true,
      configured: true,
      ...data
    });

  } catch (error: any) {
    console.error('Error fetching Google Ads data:', error);

    return NextResponse.json({
      error: 'Failed to fetch Google Ads data',
      message: error.message,
      configured: true
    }, { status: 500 });
  }
}
