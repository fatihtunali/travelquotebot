import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    // Await params for Next.js 15
    const { subdomain } = await params;

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      );
    }

    // Fetch operator by subdomain
    const operator: any = await queryOne(
      `SELECT id, company_name, subdomain, logo_url, brand_colors, is_active
       FROM operators
       WHERE subdomain = ? AND is_active = 1`,
      [subdomain]
    );

    if (!operator) {
      return NextResponse.json(
        { error: 'Operator not found or inactive' },
        { status: 404 }
      );
    }

    // Parse brand colors
    let brandColors = { primary: '#3b82f6', secondary: '#8b5cf6' };
    if (operator.brand_colors) {
      try {
        brandColors = JSON.parse(operator.brand_colors);
      } catch (err) {
        console.error('Failed to parse brand colors:', err);
      }
    }

    return NextResponse.json({
      success: true,
      operator: {
        id: operator.id,
        companyName: operator.company_name,
        subdomain: operator.subdomain,
        logoUrl: operator.logo_url,
        brandColors: brandColors,
      },
    });
  } catch (error: any) {
    console.error('Operator fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch operator', message: error.message },
      { status: 500 }
    );
  }
}
