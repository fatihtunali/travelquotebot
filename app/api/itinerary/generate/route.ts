import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { query, queryOne, execute } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
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
      console.log('User data from token:', userData);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!userData || !userData.operatorId) {
      return NextResponse.json(
        { error: 'Invalid token data - missing operatorId' },
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

    // Validate required fields
    if (!customerName || !email || !numberOfTravelers || !duration || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check operator quota
    const operator: any = await queryOne(
      `SELECT subscription_tier, monthly_quota FROM operators WHERE id = ?`,
      [userData.operatorId]
    );

    if (!operator) {
      return NextResponse.json(
        { error: 'Operator not found' },
        { status: 404 }
      );
    }

    // Count this month's itineraries
    const usageCount: any = await queryOne(
      `SELECT COUNT(*) as count FROM itineraries
       WHERE operator_id = ?
       AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`,
      [userData.operatorId]
    );

    if (usageCount.count >= operator.monthly_quota) {
      return NextResponse.json(
        { error: 'Monthly quota exceeded. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    // Fetch relevant accommodations and activities from database
    const accommodations: any[] = await query(
      `SELECT * FROM accommodations WHERE city IN (?, ?) AND type LIKE ? LIMIT 10`,
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
Interests: ${interests.join(', ')}
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
    console.log('Calling Claude API to generate itinerary...');
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
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: responseText },
        { status: 500 }
      );
    }

    // Save to database
    const itineraryId = uuidv4();
    await execute(
      `INSERT INTO itineraries (
        id, operator_id, customer_name, customer_email,
        number_of_travelers, duration, budget, interests,
        start_date, arrival_city, departure_city,
        accommodation_type, itinerary_data, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        itineraryId,
        userData.operatorId,
        customerName,
        email,
        numberOfTravelers,
        duration,
        budget,
        JSON.stringify(interests),
        startDate,
        arrivalCity,
        departureCity,
        accommodationType,
        JSON.stringify(itineraryData),
      ]
    );

    // Track API usage
    await execute(
      `INSERT INTO api_usage (
        id, operator_id, endpoint, tokens_used, created_at
      ) VALUES (?, ?, 'claude-itinerary', ?, NOW())`,
      [uuidv4(), userData.operatorId, message.usage.input_tokens + message.usage.output_tokens]
    );

    return NextResponse.json({
      success: true,
      message: 'Itinerary generated successfully',
      itineraryId,
      itinerary: itineraryData,
      usage: {
        monthly: usageCount.count + 1,
        quota: operator.monthly_quota,
      },
    });
  } catch (error: any) {
    console.error('Itinerary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary', message: error.message },
      { status: 500 }
    );
  }
}
