import { NextRequest, NextResponse } from 'next/server';
import { isSubdomainAvailable } from '@/lib/subdomain-resolver';

/**
 * Check if a subdomain is available
 * GET /api/subdomain/check?subdomain=example
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain parameter is required' },
        { status: 400 }
      );
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json({
        available: false,
        error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens (3-63 characters).'
      });
    }

    const available = await isSubdomainAvailable(subdomain);

    return NextResponse.json({
      subdomain,
      available,
      message: available
        ? `${subdomain}.travelquoteai.com is available!`
        : `${subdomain}.travelquoteai.com is already taken.`
    });

  } catch (error) {
    console.error('Error checking subdomain:', error);
    return NextResponse.json(
      { error: 'Failed to check subdomain availability' },
      { status: 500 }
    );
  }
}
