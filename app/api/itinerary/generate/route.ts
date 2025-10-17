import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { getAnthropicClient } from '@/lib/ai';
import { checkAndDeductForItinerary, getCurrentPricing } from '@/lib/credits';
import { v4 as uuidv4 } from 'uuid';

// Increase timeout for Claude AI API calls (60 seconds)
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userData = verifyToken(token);
    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      customerName,
      email,
      numberOfTravelers,
      duration,
      budget,
      interests,
      startDate,
      arrivalCity,
      departureCity,
      accommodationType,
      additionalRequests,
    } = body;

    const normalizedInterests =
      Array.isArray(interests) && interests.length > 0
        ? interests
        : typeof interests === 'string'
        ? interests
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0)
        : [];

    // Validate required fields
    if (!customerName || !email || !numberOfTravelers || !duration || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check and deduct credits
    let creditResult;
    try {
      creditResult = await checkAndDeductForItinerary(userData.operatorId);
    } catch (error: any) {
      // Insufficient credits
      const pricing = await getCurrentPricing('itinerary_generation');
      return NextResponse.json(
        {
          error: error.message || 'Insufficient credits',
          details: {
            message: 'Please add credits to continue generating itineraries',
            costPerItinerary: pricing.price_per_unit,
            currency: pricing.currency,
          },
        },
        { status: 402 } // 402 Payment Required
      );
    }

    // Fetch relevant accommodations with pricing from database
    const accommodations: any[] = await query(
      `SELECT a.*,
              arr.room_type, arr.adult_price_double, arr.single_supplement,
              arr.breakfast_included, arr.half_board_supplement, arr.full_board_supplement,
              COALESCE(apv.price_per_night, a.base_price_per_night) as effective_price,
              apv.season_name
       FROM accommodations a
       LEFT JOIN accommodation_room_rates arr ON a.id = arr.accommodation_id
         AND arr.is_active = 1
         AND ? BETWEEN arr.valid_from AND arr.valid_until
       LEFT JOIN accommodation_price_variations apv ON a.id = apv.accommodation_id
         AND ? BETWEEN apv.start_date AND apv.end_date
       WHERE a.city IN (?, ?)
         AND a.category LIKE ?
         AND a.is_active = 1
       ORDER BY a.star_rating DESC
       LIMIT 20`,
      [startDate, startDate, arrivalCity, departureCity, `%${accommodationType}%`]
    );

    // Fetch relevant activities with pricing from database
    const activities: any[] = await query(
      `SELECT a.*,
              COALESCE(apv.price, a.base_price) as effective_price,
              apv.season_name
       FROM activities a
       LEFT JOIN activity_price_variations apv ON a.id = apv.activity_id
         AND ? BETWEEN apv.start_date AND apv.end_date
       WHERE a.city IN (?, ?)
         AND a.is_active = 1
       ORDER BY a.category
       LIMIT 30`,
      [startDate, arrivalCity, departureCity]
    );

    // Fetch transport options with pricing
    const transport: any[] = await query(
      `SELECT t.*,
              COALESCE(tpv.price, t.base_price) as effective_price,
              tpv.season_name
       FROM operator_transport t
       LEFT JOIN transport_price_variations tpv ON t.id = tpv.transport_id
         AND ? BETWEEN tpv.start_date AND tpv.end_date
       WHERE t.operator_id = ?
         AND t.is_active = 1
       ORDER BY t.type
       LIMIT 20`,
      [startDate, userData.operatorId]
    );

    // Fetch restaurants
    const restaurants: any[] = await query(
      `SELECT r.*
       FROM operator_restaurants r
       WHERE r.operator_id = ?
         AND r.is_active = 1
       ORDER BY r.city, r.cuisine_type
       LIMIT 30`,
      [userData.operatorId]
    );

    // Fetch guides with pricing
    let guides: any[] = [];
    try {
      guides = await query(
        `SELECT g.*,
                COALESCE(gpv.price_per_day, g.price_per_day) as effective_price_per_day,
                COALESCE(gpv.price_half_day, g.price_half_day) as effective_price_half_day,
                gpv.season_name
         FROM operator_guide_services g
         LEFT JOIN guide_price_variations gpv ON g.id = gpv.guide_id
           AND ? BETWEEN gpv.start_date AND gpv.end_date
         WHERE g.operator_id = ?
           AND g.is_active = 1
         ORDER BY g.guide_type, g.languages
         LIMIT 10`,
        [startDate, userData.operatorId]
      );
    } catch (error: any) {
      // Silently skip if guides table doesn't exist
      if (error?.code !== 'ER_NO_SUCH_TABLE') {
        console.error('Error fetching guides:', error);
      }
    }

    // Format the available services for the prompt
    const accommodationsList = accommodations.map(acc => {
      const amenities = acc.amenities ? JSON.parse(acc.amenities) : [];
      const roomInfo = acc.room_type ?
        `${acc.room_type}: Double $${Number(acc.adult_price_double).toFixed(2)}/night${acc.breakfast_included ? ' (breakfast included)' : ''}` :
        '';
      return `- ${acc.name} (${acc.city}) - ${acc.star_rating}⭐ ${acc.category}
        Base Price: $${Number(acc.effective_price || acc.base_price_per_night).toFixed(2)}/night
        ${roomInfo}
        Amenities: ${amenities.join(', ')}
        ${acc.description || ''}`;
    }).join('\n');

    const activitiesList = activities.map(act => {
      const highlights = act.highlights ? JSON.parse(act.highlights) : [];
      return `- ${act.name} (${act.city}) - ${act.category}
        Price: $${Number(act.effective_price || act.base_price).toFixed(2)} per person
        Duration: ${act.duration_hours} hours
        ${act.min_participants ? `Min participants: ${act.min_participants}` : ''}
        ${act.description || ''}
        ${highlights.length > 0 ? `Highlights: ${highlights.join(', ')}` : ''}`;
    }).join('\n');

    const transportList = transport.map(t => {
      return `- ${t.name}: ${t.from_location} → ${t.to_location} (${t.type})
        Vehicle: ${t.vehicle_type} (${t.capacity} capacity)
        Price: $${Number(t.effective_price || t.base_price).toFixed(2)}`;
    }).join('\n');

    const restaurantsList = restaurants.map(r => {
      const meals = [];
      if (r.breakfast_price && Number(r.breakfast_price) > 0) meals.push(`Breakfast: $${Number(r.breakfast_price).toFixed(2)}/person`);
      if (r.lunch_price && Number(r.lunch_price) > 0) meals.push(`Lunch: $${Number(r.lunch_price).toFixed(2)}/person`);
      if (r.dinner_price && Number(r.dinner_price) > 0) meals.push(`Dinner: $${Number(r.dinner_price).toFixed(2)}/person`);
      return `- ${r.name} (${r.city}) - ${r.cuisine_type}
        ${meals.length > 0 ? meals.join(', ') : ''}
        ${r.specialties || ''}`;
    }).join('\n');

    const guidesList = guides.map(g => {
      const langs = g.languages ? JSON.parse(g.languages) : [];
      return `- ${g.name} (${g.guide_type}) - ${g.specialization}
        Languages: ${langs.join(', ')}
        Full day: $${Number(g.effective_price_per_day || g.price_per_day || 0).toFixed(2)} | Half day: $${Number(g.effective_price_half_day || g.price_half_day || 0).toFixed(2)}`;
    }).join('\n');

    // Build the prompt for Claude
    const prompt = `You are an expert Turkey travel planner. Create a detailed ${duration}-day itinerary for Turkey based on these requirements:

Customer: ${customerName} (${email})
Travelers: ${numberOfTravelers} people
Start Date: ${startDate}
Duration: ${duration} days
Budget: ${budget}
Arrival City: ${arrivalCity}
Departure City: ${departureCity}
Accommodation Type: ${accommodationType}
Interests: ${normalizedInterests.join(', ')}
${additionalRequests ? `Additional Requests: ${additionalRequests}` : ''}

IMPORTANT: You MUST use ONLY the accommodations, activities, transport, restaurants, and guides listed below. These are the actual services available with real pricing. DO NOT make up or suggest any services not in these lists.

AVAILABLE ACCOMMODATIONS:
${accommodationsList || 'No accommodations found in database for these cities'}

AVAILABLE ACTIVITIES & TOURS:
${activitiesList || 'No activities found in database for these cities'}

AVAILABLE TRANSPORT:
${transportList || 'No transport options found in database'}

AVAILABLE RESTAURANTS:
${restaurantsList || 'No restaurants found in database'}
${guides.length > 0 ? `
AVAILABLE TOUR GUIDES:
${guidesList}` : ''}

Please create a comprehensive day-by-day itinerary that includes:
1. Daily activities ONLY from the available activities list above with EXACT prices
2. Accommodations ONLY from the available accommodations list above with EXACT prices
3. Transportation ONLY from the available transport list above with EXACT prices
4. Restaurant recommendations ONLY from the available restaurants list above with EXACT prices
${guides.length > 0 ? '5. Guide assignments from the available guides list when appropriate with EXACT prices' : ''}
${guides.length > 0 ? '6' : '5'}. Local tips and cultural insights
${guides.length > 0 ? '7' : '6'}. Calculate accurate total costs based on the EXACT prices provided

Format the response as a structured JSON with this exact format:
{
  "title": "Trip title",
  "summary": "Brief overview",
  "totalEstimatedCost": {
    "min": number (exact calculation from all costs),
    "max": number (same as min for exact pricing),
    "currency": "USD"
  },
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "city": "City name",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name from database (use exact name)",
          "description": "Details from database",
          "duration": "X hours",
          "cost": {
            "min": number (exact price from database),
            "max": number (same as min)
          },
          "tips": "Local tips"
        }
      ],
      "accommodation": {
        "name": "Hotel name from database (use exact name)",
        "type": "hotel/boutique/resort",
        "pricePerNight": {
          "min": number (exact price from database),
          "max": number (same as min)
        },
        "description": "Brief description from database"
      },
      "meals": [
        {
          "type": "breakfast/lunch/dinner",
          "restaurant": "Restaurant name from database (use exact name)",
          "cuisine": "Cuisine type from database",
          "estimatedCost": {
            "min": number (exact price from database per person),
            "max": number (same as min)
          }
        }
      ],
      "transportation": {
        "method": "Type from database",
        "from": "Location",
        "to": "Location",
        "duration": "Duration",
        "cost": {
          "min": number (exact price from database),
          "max": number (same as min)
        }
      }
    }
  ],
  "packingList": ["item1", "item2"],
  "importantNotes": ["note1", "note2"]
}

CRITICAL REMINDERS:
- Use EXACT names from the lists above for hotels, activities, restaurants
- Use EXACT prices from the lists above - put the same price in both min and max
- For activities and meals, the price shown is per person, multiply by ${numberOfTravelers} travelers for total
- Calculate totalEstimatedCost by summing ALL costs across all days
- If no suitable service exists in the database lists, mention it in importantNotes rather than making up a service

Make the itinerary realistic, engaging, and optimized for the given budget and interests.`;

    // Call Claude API
    const anthropic = getAnthropicClient();
    if (!anthropic) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse JSON from response (handle potential markdown code blocks)
    let itineraryData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        itineraryData = JSON.parse(jsonMatch[0]);
      } else {
        itineraryData = JSON.parse(responseText);
      }
    } catch (err) {
      console.error('Failed to parse Claude response');
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Save to database
    const itineraryId = uuidv4();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    // Store trip preferences in preferences JSON
    const preferences = {
      budget,
      interests: normalizedInterests,
      arrivalCity,
      departureCity,
      accommodationType,
      additionalRequests
    };

    await execute(
      `INSERT INTO itineraries (
        id, operator_id, customer_name, customer_email,
        num_travelers, start_date, end_date,
        itinerary_data, preferences, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        itineraryId,
        userData.operatorId,
        customerName,
        email,
        numberOfTravelers,
        startDate,
        endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        JSON.stringify(itineraryData),
        JSON.stringify(preferences),
      ]
    );

    // Track API usage
    const totalTokens = message.usage.input_tokens + message.usage.output_tokens;
    const estimatedCost = (totalTokens / 1000) * 0.003; // Approximate cost per 1K tokens

    await execute(
      `INSERT INTO api_usage (
        id, operator_id, api_type, endpoint, cost, success
      ) VALUES (?, ?, 'anthropic', 'claude-itinerary', ?, ?)`,
      [uuidv4(), userData.operatorId, estimatedCost, true]
    );

    return NextResponse.json({
      success: true,
      message: 'Itinerary generated successfully',
      itineraryId,
      itinerary: itineraryData,
      credits: {
        cost: creditResult.cost,
        newBalance: creditResult.newBalance,
        currency: 'TRY',
      },
    });
  } catch (error: any) {
    console.error('Itinerary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
}
