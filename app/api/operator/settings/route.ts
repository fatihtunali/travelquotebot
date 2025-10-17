import { NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userData;
    try {
      userData = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 }
      );
    }

    // Fetch operator settings
    const operator: any = await queryOne(
      `SELECT id, company_name, subdomain, logo_url, brand_colors
       FROM operators
       WHERE id = ?`,
      [userData.operatorId]
    );

    if (!operator) {
      return NextResponse.json(
        { error: 'Operator not found' },
        { status: 404 }
      );
    }

    // Parse brand colors JSON
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
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load settings', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userData;
    try {
      userData = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyName, logoUrl, primaryColor, secondaryColor } = body;

    // Validate inputs
    if (!companyName || companyName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Validate color format (basic hex color validation)
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (primaryColor && !hexColorRegex.test(primaryColor)) {
      return NextResponse.json(
        { error: 'Invalid primary color format. Use hex format like #3b82f6' },
        { status: 400 }
      );
    }

    if (secondaryColor && !hexColorRegex.test(secondaryColor)) {
      return NextResponse.json(
        { error: 'Invalid secondary color format. Use hex format like #8b5cf6' },
        { status: 400 }
      );
    }

    // Build brand colors JSON
    const brandColors = {
      primary: primaryColor || '#3b82f6',
      secondary: secondaryColor || '#8b5cf6',
    };

    // Update operator settings
    await execute(
      `UPDATE operators
       SET company_name = ?,
           logo_url = ?,
           brand_colors = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        companyName.trim(),
        logoUrl || null,
        JSON.stringify(brandColors),
        userData.operatorId,
      ]
    );

    // Fetch updated operator data
    const updatedOperator: any = await queryOne(
      `SELECT id, company_name, subdomain, logo_url, brand_colors
       FROM operators
       WHERE id = ?`,
      [userData.operatorId]
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      operator: {
        id: updatedOperator.id,
        companyName: updatedOperator.company_name,
        subdomain: updatedOperator.subdomain,
        logoUrl: updatedOperator.logo_url,
        brandColors: JSON.parse(updatedOperator.brand_colors),
      },
    });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings', message: error.message },
      { status: 500 }
    );
  }
}
