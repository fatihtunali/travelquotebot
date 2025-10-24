import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces, fetchAndSavePlace, getPlaceFromDatabase } from '@/lib/googlePlaces';
import jwt from 'jsonwebtoken';

// C6: Remove fallback - JWT_SECRET is required
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * GET /api/places?query=istanbul&action=search
 * GET /api/places?placeId=ChIJxxx&action=get
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const query = searchParams.get('query');
    const placeId = searchParams.get('placeId');
    const location = searchParams.get('location');

    if (action === 'search' && query) {
      // Search for places
      const results = await searchPlaces(query, location || undefined);
      return NextResponse.json({ results });
    } else if (action === 'get' && placeId) {
      // Get place from database
      const place = await getPlaceFromDatabase(placeId);
      if (place) {
        return NextResponse.json({ place });
      } else {
        return NextResponse.json({ error: 'Place not found' }, { status: 404 });
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing parameters' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in places API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/places
 * Body: { placeId: string }
 * Fetches place details from Google and saves to database
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { placeId } = body;

    if (!placeId) {
      return NextResponse.json(
        { error: 'placeId is required' },
        { status: 400 }
      );
    }

    // Fetch from Google and save to database
    const success = await fetchAndSavePlace(placeId);

    if (success) {
      // Get the saved place from database
      const place = await getPlaceFromDatabase(placeId);
      return NextResponse.json({
        success: true,
        message: 'Place saved successfully',
        place
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to fetch and save place' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving place:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
