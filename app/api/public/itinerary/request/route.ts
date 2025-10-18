import { NextResponse } from 'next/server';
import { execute, queryOne, query, getTrainingExamples } from '@/lib/db';
import { getAnthropicClient } from '@/lib/ai';
import { v4 as uuidv4 } from 'uuid';

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
      cities,
      arrivalCity,
      departureCity,
      accommodationType,
      additionalRequests,
    } = body;

    if (
      !operatorId ||
      !customerName ||
      !email ||
      !numberOfTravelers ||
      !duration ||
      !startDate ||
      !cities ||
      cities.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedInterests =
      Array.isArray(interests) && interests.length > 0
        ? interests
        : typeof interests === 'string'
        ? interests
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0)
        : [];

    const operator: any = await queryOne(
      `SELECT id, monthly_quota FROM operators WHERE id = ? AND is_active = 1`,
      [operatorId]
    );

    if (!operator) {
      return NextResponse.json({ error: 'Invalid operator' }, { status: 404 });
    }

    const usageCount: any = await queryOne(
      `SELECT COUNT(*) as count FROM itineraries
       WHERE operator_id = ?
       AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`,
      [operatorId]
    );

    const usedThisMonth = usageCount?.count ?? 0;

    if (usedThisMonth >= operator.monthly_quota) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please contact us directly.' },
        { status: 503 }
      );
    }

    // Use the cities array from the request (already selected by customer)

    // Fetch real operator services from database
    // Create placeholders for IN clause
    const cityPlaceholders = cities.map(() => '?').join(',');

    const accommodations = await query(
      `SELECT id, name, city, star_rating, base_price_per_night
       FROM accommodations
       WHERE operator_id = ? AND city IN (${cityPlaceholders}) AND is_active = 1
       ORDER BY star_rating DESC
       LIMIT 10`,
      [operatorId, ...cities]
    );

    const activities = await query(
      `SELECT id, name, city, base_price, duration_hours, description
       FROM activities
       WHERE operator_id = ? AND city IN (${cityPlaceholders}) AND is_active = 1
       LIMIT 20`,
      [operatorId, ...cities]
    );

    const restaurants = await query(
      `SELECT id, name, city, cuisine_type, lunch_price, dinner_price
       FROM operator_restaurants
       WHERE operator_id = ? AND city IN (${cityPlaceholders}) AND is_active = 1
       LIMIT 10`,
      [operatorId, ...cities]
    );

    // Check if custom AI is enabled
    const useCustomAI = process.env.USE_CUSTOM_AI === 'true';
    const customAIUrl = process.env.ITINERARY_AI_URL;

    // Fetch training examples for AI learning (same approach for both AI systems)
    const trainingExamples = await getTrainingExamples(duration, 'Private', 2);

    let itineraryData;

    if (useCustomAI && customAIUrl) {
      // Use custom Ollama AI service with training examples
      console.log('Using custom AI service for public itinerary generation');

      const aiResponse = await fetch(`${customAIUrl}/tqb-ai/generate-itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator_id: operatorId,
          days: duration,
          cities: cities,
          tour_type: 'Private',
          pax: numberOfTravelers,
          interests: normalizedInterests,
          start_date: startDate,
          budget: budget,
          accommodations: accommodations,
          activities: activities,
          restaurants: restaurants,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('Custom AI service failed');
      }

      const aiData = await aiResponse.json();
      itineraryData = aiData.itinerary;
    } else {
      // Use Claude 3.5 Sonnet with enhanced prompt and training examples
      console.log('Using Claude for public itinerary generation');

      const anthropic = getAnthropicClient();
      if (!anthropic) {
        return NextResponse.json(
          { error: 'AI service is not configured' },
          { status: 503 }
        );
      }

      // Build training examples text
      const trainingText = trainingExamples.length > 0
        ? `\n\nHere are ${trainingExamples.length} example(s) of similar ${duration}-day itineraries for reference:\n\n` +
          trainingExamples.map((ex, idx) =>
            `Example ${idx + 1}: ${ex.title}\nCities: ${ex.cities}\n${ex.content}\n`
          ).join('\n---\n\n')
        : '';

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

AVAILABLE OPERATOR SERVICES:
Accommodations (${accommodations.length} available):
${accommodations.map(a => `- ${a.name} (${a.city}) - ${a.star_rating}⭐ | $${a.base_price_per_night}/night`).join('\n')}

Activities (${activities.length} available):
${activities.map(a => `- ${a.name} (${a.city}) | $${a.base_price}/person | ${a.duration_hours}hrs`).join('\n')}

Restaurants (${restaurants.length} available):
${restaurants.map(r => `- ${r.name} (${r.city}) - ${r.cuisine_type} | Lunch: $${r.lunch_price} Dinner: $${r.dinner_price}`).join('\n')}
${trainingText}

Please create a comprehensive day-by-day itinerary that includes:
1. Daily activities and attractions (use services from the list above when possible)
2. Recommended accommodations (use exact names from the list)
3. Transportation between cities
4. Estimated costs per day
5. Local tips and cultural insights
6. Restaurant recommendations (use names from the list)
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

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : '';

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          itineraryData = JSON.parse(jsonMatch[0]);
        } else {
          itineraryData = JSON.parse(responseText);
        }
      } catch {
        console.error('Failed to parse Claude response');
        return NextResponse.json(
          { error: 'Failed to generate itinerary' },
          { status: 500 }
        );
      }

      // Track Claude API usage
      const totalTokens =
        message.usage.input_tokens + message.usage.output_tokens;
      const estimatedCost = (totalTokens / 1000) * 0.003;

      await execute(
        `INSERT INTO api_usage (
          id, operator_id, api_type, endpoint, cost, success
        ) VALUES (?, ?, 'anthropic', 'claude-itinerary-public', ?, ?)`,
        [uuidv4(), operatorId, estimatedCost, true]
      );
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    const preferences = {
      budget,
      interests: normalizedInterests,
      cities,
      arrivalCity,
      departureCity,
      accommodationType,
      additionalRequests,
      phone,
    };

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

    return NextResponse.json({
      success: true,
      message: 'Itinerary generated successfully',
      itineraryId,
      itinerary: itineraryData,
    });
  } catch (error: any) {
    console.error('Itinerary request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}
