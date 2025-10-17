import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { execute, queryOne, query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      operatorId,
      customerName,
      email,
      phone,
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
    if (!operatorId || !customerName || !email || !numberOfTravelers || !duration || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify operator exists and is active
    const operator: any = await queryOne(
      `SELECT id, monthly_quota FROM operators WHERE id = ? AND is_active = 1`,
      [operatorId]
    );

    if (!operator) {
      return NextResponse.json(
        { error: 'Invalid operator' },
        { status: 404 }
      );
    }

    // Check operator quota
    const usageCount: any = await queryOne(
      `SELECT COUNT(*) as count FROM itineraries
       WHERE operator_id = ?
       AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`,
      [operatorId]
    );

    if (usageCount.count >= operator.monthly_quota) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please contact us directly.' },
        { status: 503 }
      );
    }

    // Fetch relevant accommodations and activities
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
    console.log('🤖 Generating itinerary with Claude AI...');
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20250219',
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

    // Parse JSON from response
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
        { error: 'Failed to generate itinerary', details: responseText },
        { status: 500 }
      );
    }

    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    // Store preferences
    const preferences = {
      budget,
      interests,
      arrivalCity,
      departureCity,
      accommodationType,
      additionalRequests,
      phone,
    };

    // Save itinerary to database with generated data
    const itineraryId = uuidv4();
    await execute(
      `INSERT INTO itineraries (
        id, operator_id, customer_name, customer_email,
        num_travelers, start_date, end_date,
        itinerary_data, preferences, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated')`,
      [
        itineraryId,
        operatorId,
        customerName,
        email,
        numberOfTravelers,
        startDate,
        endDate.toISOString().split('T')[0],
        JSON.stringify(itineraryData),
        JSON.stringify(preferences),
      ]
    );

    // Track API usage
    const totalTokens = message.usage.input_tokens + message.usage.output_tokens;
    const estimatedCost = (totalTokens / 1000) * 0.003;

    await execute(
      `INSERT INTO api_usage (
        id, operator_id, api_type, endpoint, cost, success
      ) VALUES (?, ?, 'anthropic', 'claude-itinerary-public', ?, ?)`,
      [uuidv4(), operatorId, estimatedCost, true]
    );

    console.log('✅ Itinerary generated successfully');

    return NextResponse.json({
      success: true,
      message: 'Itinerary generated successfully',
      itineraryId,
      itinerary: itineraryData,
    });
  } catch (error: any) {
    console.error('Itinerary request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit request', message: error.message },
      { status: 500 }
    );
  }
}
