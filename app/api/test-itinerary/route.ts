import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { query, queryOne, execute } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function GET() {
  try {
    console.log('🧪 Starting itinerary generation test...');

    // Test data
    const testData = {
      customerName: 'Test Customer',
      email: 'test@example.com',
      numberOfTravelers: 2,
      duration: 3,
      budget: 'medium',
      interests: ['Historical Sites', 'Food & Cuisine'],
      startDate: '2025-11-15',
      arrivalCity: 'Istanbul',
      departureCity: 'Istanbul',
      accommodationType: 'hotel',
    };

    // Get operator (using the existing one)
    const operator: any = await queryOne(
      `SELECT id, subscription_tier, monthly_quota FROM operators LIMIT 1`
    );

    if (!operator) {
      return NextResponse.json(
        { error: 'No operator found in database' },
        { status: 404 }
      );
    }

    console.log('✅ Operator found:', operator.id);

    // Fetch accommodations (operator-specific only)
    const accommodations: any[] = await query(
      `SELECT * FROM accommodations WHERE city IN (?, ?) AND category LIKE ? AND operator_id = ? LIMIT 10`,
      [testData.arrivalCity, testData.departureCity, `%${testData.accommodationType}%`, operator.id]
    );

    console.log('✅ Found accommodations:', accommodations.length);

    // Fetch activities (operator-specific only)
    const activities: any[] = await query(
      `SELECT * FROM activities WHERE city IN (?, ?) AND operator_id = ? LIMIT 20`,
      [testData.arrivalCity, testData.departureCity, operator.id]
    );

    console.log('✅ Found activities:', activities.length);

    // Build prompt
    const prompt = `You are an expert Turkey travel planner. Create a detailed ${testData.duration}-day itinerary for Turkey based on these requirements:

Customer: ${testData.customerName} (${testData.email})
Travelers: ${testData.numberOfTravelers} people
Start Date: ${testData.startDate}
Duration: ${testData.duration} days
Budget: ${testData.budget}
Arrival City: ${testData.arrivalCity}
Departure City: ${testData.departureCity}
Accommodation Type: ${testData.accommodationType}
Interests: ${testData.interests.join(', ')}

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

    console.log('🤖 Calling Claude API...');

    // Call Claude API
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

    console.log('✅ Claude API response received');
    console.log('📊 Tokens used:', message.usage.input_tokens + message.usage.output_tokens);

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
      console.error('❌ Failed to parse Claude response');
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: responseText.substring(0, 500) },
        { status: 500 }
      );
    }

    console.log('✅ Parsed itinerary data');

    // Save to database
    const itineraryId = uuidv4();
    const endDate = new Date(testData.startDate);
    endDate.setDate(endDate.getDate() + testData.duration);

    const preferences = {
      budget: testData.budget,
      interests: testData.interests,
      arrivalCity: testData.arrivalCity,
      departureCity: testData.departureCity,
      accommodationType: testData.accommodationType,
    };

    await execute(
      `INSERT INTO itineraries (
        id, operator_id, customer_name, customer_email,
        num_travelers, start_date, end_date,
        itinerary_data, preferences, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        itineraryId,
        operator.id,
        testData.customerName,
        testData.email,
        testData.numberOfTravelers,
        testData.startDate,
        endDate.toISOString().split('T')[0],
        JSON.stringify(itineraryData),
        JSON.stringify(preferences),
      ]
    );

    console.log('✅ Saved to database with ID:', itineraryId);

    // Track API usage
    const totalTokens = message.usage.input_tokens + message.usage.output_tokens;
    const estimatedCost = (totalTokens / 1000) * 0.003;

    await execute(
      `INSERT INTO api_usage (
        id, operator_id, api_type, endpoint, cost, success
      ) VALUES (?, ?, 'anthropic', 'claude-itinerary', ?, ?)`,
      [uuidv4(), operator.id, estimatedCost, true]
    );

    console.log('✅ API usage tracked');

    return NextResponse.json({
      success: true,
      message: '🎉 Test completed successfully!',
      itineraryId,
      title: itineraryData.title,
      summary: itineraryData.summary,
      days: itineraryData.days.length,
      tokensUsed: totalTokens,
      estimatedCost: estimatedCost.toFixed(4),
      viewUrl: `http://localhost:3000/itinerary/${itineraryId}`,
    });
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return NextResponse.json(
      {
        error: 'Test failed',
        message: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
