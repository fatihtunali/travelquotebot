import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { getAnthropicClient } from '@/lib/ai';
import { checkAndDeductForItinerary, getCurrentPricing } from '@/lib/credits';
import { v4 as uuidv4 } from 'uuid';

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

    // Fetch relevant accommodations and activities from database
    const accommodations: any[] = await query(
      `SELECT * FROM accommodations WHERE city IN (?, ?) AND category LIKE ? LIMIT 10`,
      [arrivalCity, departureCity, `%${accommodationType}%`]
    );

    const activities: any[] = await query(
      `SELECT * FROM activities WHERE city IN (?, ?) LIMIT 20`,
      [arrivalCity, departureCity]
    );

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

Please create a comprehensive day-by-day itinerary that includes:
1. Daily activities and attractions
2. Recommended accommodations
3. Transportation between cities
4. Estimated costs per day
5. Local tips and cultural insights
6. Restaurant recommendations
7. Best times to visit each location

Format the response as a structured JSON with this exact format:
{
  "title": "Trip title",
  "summary": "Brief overview",
  "totalEstimatedCost": {
    "min": number,
    "max": number,
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
          "title": "Activity name",
          "description": "Details",
          "duration": "2 hours",
          "cost": {"min": 0, "max": 0},
          "tips": "Local tips"
        }
      ],
      "accommodation": {
        "name": "Hotel name",
        "type": "hotel/boutique/resort",
        "pricePerNight": {"min": 0, "max": 0},
        "description": "Brief description"
      },
      "meals": [
        {
          "type": "breakfast/lunch/dinner",
          "restaurant": "Name",
          "cuisine": "Type",
          "estimatedCost": {"min": 0, "max": 0}
        }
      ],
      "transportation": {
        "method": "flight/bus/car/walking",
        "from": "Location",
        "to": "Location",
        "duration": "Duration",
        "cost": {"min": 0, "max": 0}
      }
    }
  ],
  "packingList": ["item1", "item2"],
  "importantNotes": ["note1", "note2"]
}

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
      model: 'claude-3-5-sonnet-20241022',
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
