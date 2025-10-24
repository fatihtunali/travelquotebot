import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import Anthropic from '@anthropic-ai/sdk';

// C6: Remove fallback - JWT_SECRET is required
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// POST - Generate AI-powered itinerary description
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; quoteId: string }> }
) {
  try {
    const { orgId, quoteId } = await params;
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

    // Fetch quote data
    const [quotes]: any = await pool.query(
      `SELECT * FROM quotes WHERE id = ? AND organization_id = ?`,
      [quoteId, orgId]
    );

    if (!quotes || quotes.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const quote = quotes[0];

    // Parse itinerary JSON
    let itinerary = null;
    if (quote.itinerary && typeof quote.itinerary === 'string') {
      try {
        itinerary = JSON.parse(quote.itinerary);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid itinerary data' }, { status: 400 });
      }
    }

    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
      return NextResponse.json({ error: 'No itinerary data found' }, { status: 400 });
    }

    // Initialize Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    // Build the prompt with quote data
    const prompt = buildItineraryPrompt(quote, itinerary);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const generatedDescription = message.content[0].type === 'text' ? message.content[0].text : '';

    // Store the generated description in the database
    await pool.query(
      `UPDATE quotes SET ai_generated_description = ? WHERE id = ? AND organization_id = ?`,
      [generatedDescription, quoteId, orgId]
    );

    return NextResponse.json({
      success: true,
      description: generatedDescription
    });

  } catch (error: any) {
    console.error('Error generating itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary', details: error.message },
      { status: 500 }
    );
  }
}

function buildItineraryPrompt(quote: any, itinerary: any): string {
  const days = itinerary.days;
  const destination = quote.destination || '';
  const startDate = new Date(quote.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const totalNights = days.length - 1;
  const totalDays = days.length;

  // Build day-by-day breakdown
  let dayBreakdown = '';
  days.forEach((day: any, index: number) => {
    dayBreakdown += `\nDay ${day.day_number} - ${day.location}:\n`;
    day.items.forEach((item: any) => {
      dayBreakdown += `  - ${item.name} (${item.type})\n`;
      if (item.description) {
        dayBreakdown += `    Description: ${item.description}\n`;
      }
    });
  });

  return `You are a professional travel itinerary writer. Generate a detailed, guest-friendly itinerary description based on the following tour data.

**Tour Details:**
- Destination: ${destination}
- Duration: ${totalNights} Nights / ${totalDays} Days
- Start Date: ${startDate}
- Adults: ${quote.adults}, Children: ${quote.children}

**Day-by-Day Breakdown:**
${dayBreakdown}

**Style Guidelines:**
1. Use this format for each day:
   "Day X - Location/Activity (Meal Code)
   Description paragraph mentioning breakfast (if applicable), main activities with specific site names, transfer details, and ending with 'Overnight in [Location]'."

2. Use meal codes: (B) for Breakfast, (L) for Lunch, (D) for Dinner, (-) for no meals
3. Be professional but warm and inviting
4. Mention specific attractions by name
5. Include practical details (transfers, check-in, breakfast)
6. For arrival day, mention "Arrive to [airport]. Arrival transfer to the hotel and check-in. The rest of the day is yours."
7. For departure day, mention "After breakfast, check out from the hotel. Transfer to [airport] for your next destination. The tour ends with great memories."
8. When mentioning tours, list the main highlights visited
9. Keep each day description concise (2-4 sentences)
10. Match the professional, informative tone of a travel agency brochure

**Example Style Reference:**
"Day 2 - Istanbul – Full Day Tour (B)
After breakfast at the hotel, a guided tour to Hippodrome, Topkapi Palace, St. Sophia, Blue Mosque and the Grand Bazaar will commence. After the tour, transfer back to hotel. Overnight in Istanbul."

Generate the complete itinerary description following this exact style:`;
}
