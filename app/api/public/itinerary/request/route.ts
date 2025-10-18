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

    // Fetch training examples
    const trainingExamples = await getTrainingExamples(duration, 'Private', 2);
    const trainingExamplesText = trainingExamples.length > 0
      ? `\nHere are ${trainingExamples.length} example(s) of similar ${duration}-day itineraries for reference:\n\n` +
        trainingExamples.map((ex, idx) =>
          `Example ${idx + 1}: ${ex.title}\nCities: ${ex.cities}\n${ex.content}\n`
        ).join('\n---\n\n')
      : '';

    // Prepare city-related data
    const citiesArray = Array.isArray(cities) ? cities : [cities];
    const nights = duration - 1;
    const nightsPerCity = Math.floor(nights / citiesArray.length);
    const remainingNights = nights % citiesArray.length;

    // Create placeholders for IN clause
    const cityPlaceholders = citiesArray.map(() => '?').join(',');

    // Fetch accommodations by city
    const accommodations = await query(
      `SELECT id, name, city, star_rating, base_price_per_night
       FROM accommodations
       WHERE operator_id = ? AND city IN (${cityPlaceholders}) AND is_active = 1
       ORDER BY city, star_rating DESC
       LIMIT 30`,
      [operatorId, ...citiesArray]
    );

    // Fetch activities by city
    const activities = await query(
      `SELECT id, name, city, base_price, duration_hours, description
       FROM activities
       WHERE operator_id = ? AND city IN (${cityPlaceholders}) AND is_active = 1
       ORDER BY city
       LIMIT 30`,
      [operatorId, ...citiesArray]
    );

    // Fetch restaurants by city
    const restaurants = await query(
      `SELECT id, name, city, cuisine_type, lunch_price, dinner_price
       FROM operator_restaurants
       WHERE operator_id = ? AND city IN (${cityPlaceholders}) AND is_active = 1
       ORDER BY city
       LIMIT 20`,
      [operatorId, ...citiesArray]
    );

    // Group data by city
    const hotelsByCity: Record<string, any[]> = {};
    const activitiesByCity: Record<string, any[]> = {};
    const restaurantsByCity: Record<string, any[]> = {};

    citiesArray.forEach(city => {
      hotelsByCity[city] = accommodations.filter(a => a.city === city);
      activitiesByCity[city] = activities.filter(a => a.city === city);
      restaurantsByCity[city] = restaurants.filter(r => r.city === city);
    });

    // Build comprehensive prompt (EXACTLY like operator route)
    const prompt = `You are a professional Turkey tour operator creating an engaging multi-city itinerary.
${trainingExamplesText}

TRIP DETAILS:
- Duration: ${duration} days (${nights} night${nights > 1 ? 's' : ''})
- Travelers: ${numberOfTravelers} people
- Cities to Visit (in order): ${citiesArray.join(' → ')}
- Start Date: ${startDate}
- Arrival City: ${arrivalCity || citiesArray[0]}
- Departure City: ${departureCity || citiesArray[citiesArray.length - 1]}
- Budget: ${budget || 'moderate'}
- Interests: ${normalizedInterests.join(', ') || 'history, culture'}

MULTI-CITY ROUTING STRATEGY:
- Total ${nights} nights to distribute across ${citiesArray.length} cities
- Each city should get minimum 2 nights (except if single-city trip)
- Suggested distribution: ${citiesArray.map((city, idx) => {
    const cityNights = nightsPerCity + (idx < remainingNights ? 1 : 0);
    return `${city}: ~${cityNights} nights`;
  }).join(', ')}
- Include travel days between cities (bus/flight) as part of the itinerary
- Arrival on Day 1 to ${arrivalCity || citiesArray[0]}
- Departure on Day ${duration} from ${departureCity || citiesArray[citiesArray.length - 1]}

AVAILABLE HOTELS BY CITY (use exact names):
${citiesArray.map(city => {
  const cityHotels = hotelsByCity[city] || [];
  if (cityHotels.length === 0) {
    return `\n${city.toUpperCase()}: ⚠️ NO HOTELS AVAILABLE - Skip this city or suggest nearby alternative`;
  }
  return `\n${city.toUpperCase()}:\n${cityHotels.map(a => `  - ${a.name} - ${a.star_rating}⭐ | $${parseFloat(a.base_price_per_night).toFixed(0)}/night`).join('\n')}`;
}).join('\n')}

AVAILABLE ACTIVITIES BY CITY (use exact names):
${citiesArray.map(city => {
  const cityActs = activitiesByCity[city] || [];
  if (cityActs.length === 0) {
    return `\n${city.toUpperCase()}: ℹ️ Limited activities in database - use general sightseeing`;
  }
  return `\n${city.toUpperCase()}:\n${cityActs.map(a => `  - ${a.name} | $${parseFloat(a.base_price).toFixed(0)}/person | ${a.duration_hours}hrs`).join('\n')}`;
}).join('\n')}

AVAILABLE RESTAURANTS BY CITY (use exact names):
${citiesArray.map(city => {
  const cityRests = restaurantsByCity[city] || [];
  if (cityRests.length === 0) {
    return `\n${city.toUpperCase()}: ℹ️ No specific restaurants listed`;
  }
  return `\n${city.toUpperCase()}:\n${cityRests.map(r => `  - ${r.name} (${r.cuisine_type || 'Turkish'})`).join('\n')}`;
}).join('\n')}

PACKAGE REQUIREMENTS:
1. Accommodation: ${nights} night${nights > 1 ? 's' : ''} TOTAL (NOT ${duration} nights!)
2. Transfer IN on Day 1 (arrival to ${arrivalCity || citiesArray[0]})
3. Transfer OUT on Day ${duration} (departure from ${departureCity || citiesArray[citiesArray.length - 1]})
4. Inter-city transfers (bus/flight) between cities as needed
5. Daily sightseeing activities/tours
6. Follow the city order: ${citiesArray.join(' → ')}

HANDLING MISSING DATA:
- If a city has NO HOTELS: Skip that city or suggest returning to previous city
- If a city has LIMITED ACTIVITIES: Include general sightseeing (historic sites, local markets, etc.)
- Be flexible but maintain logical routing

MEAL CODE RULES:
- (-) = No meals
- (B) = Breakfast only
- (B/L) = Breakfast + Lunch
- (B/L/D) = All meals

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "tourName": "Captivating Turkey: ${citiesArray.join(' & ')} Adventure",
  "duration": "${nights} Night${nights > 1 ? 's' : ''} / ${duration} Days",
  "days": [
    {
      "dayNumber": 1,
      "date": "${startDate}",
      "title": "Day 1 - Arrival in ${arrivalCity || citiesArray[0]}",
      "mealCode": "(-)",
      "description": "Upon your arrival at ${arrivalCity || citiesArray[0]} Airport, you will be privately transferred to your hotel. Check-in at the hotel (standard check-in time is 14:00). Rest of the day is free to explore the city at your own pace or relax at the hotel. Overnight in ${arrivalCity || citiesArray[0]}.",
      "selectedHotel": "[Pick ONE hotel from ${arrivalCity || citiesArray[0]} list]",
      "selectedActivities": [],
      "selectedRestaurants": []
    }
    // ... Continue for ${duration} days total
    // - Spend ${nightsPerCity}+ nights in each city
    // - Include travel days between cities (e.g., "Day 4 - Transfer to Cappadocia")
    // - Change hotel when moving to new city
    // - Final day is departure with (B) meal code only
  ],
  "inclusions": "- ${nights} night${nights > 1 ? 's' : ''} accommodation in mentioned hotels\\n- Meals as per itinerary (B=Breakfast, L=Lunch, D=Dinner)\\n- Airport transfers on Private basis\\n- Inter-city transfers (bus/flight)\\n- Professional English-speaking guide on tour days\\n- Sightseeing as per itinerary on SIC (Group Tours) basis with entrance fees\\n- Local taxes",
  "exclusions": "- International flights\\n- Personal expenses\\n- Drinks at meals\\n- Tips and porterage at hotels\\n- Tips to driver and guide",
  "information": "- Grand Bazaar closed on Sundays\\n- Topkapi Palace closed on Tuesdays\\n- Please be ready at lobby 5 minutes before pickup time\\n- Dress modestly when visiting mosques\\n- Travel times between cities: Istanbul-Cappadocia ~10hrs bus, Istanbul-Antalya ~1hr flight"
}

CRITICAL HOTEL SELECTION RULES (READ CAREFULLY):
⚠️ VERY IMPORTANT: Each city has its OWN hotel list. You MUST use the correct hotel for each city!

${citiesArray.map((city, idx) => {
  const cityHotels = hotelsByCity[city] || [];
  if (cityHotels.length > 0) {
    return `📍 When in ${city.toUpperCase()}, use ONLY these hotels:
   ${cityHotels.map(h => `✓ ${h.name}`).join('\n   ')}`;
  }
  return `📍 ${city.toUpperCase()}: ⚠️ No hotels available - skip this city`;
}).join('\n\n')}

SELECTION EXAMPLES:
${citiesArray.map((city, idx) => {
  const cityHotels = hotelsByCity[city] || [];
  if (cityHotels.length > 0) {
    const exampleHotel = cityHotels[0];
    return `✓ Day in ${city}: "selectedHotel": "${exampleHotel.name}"`;
  }
  return '';
}).filter(Boolean).join('\n')}

❌ WRONG: Using Istanbul hotel when staying in Cappadocia
✓ CORRECT: Using Cappadocia hotel when staying in Cappadocia

CRITICAL RULES:
1. Create EXACTLY ${duration} days (not more, not less)
2. Use EXACT hotel/activity/restaurant names from city lists above
3. **MATCH HOTEL TO CITY**: If staying in Cappadocia, use ONLY Cappadocia hotels!
4. If no hotel exists for a city, SKIP that city or suggest alternative routing
5. Distribute ${nights} nights across cities logically (minimum 2 nights per city if multi-city)
6. Include travel days: "Day X - Transfer from City A to City B" with (B) meal code
7. Day 1 is arrival with (-) meals, final day is departure with (B) only
8. Write engaging narrative descriptions (like professional tour brochure)
9. Include "Overnight in [City]" at end of each day's description (except final day)
10. Return ONLY JSON - no markdown, no explanations

RESPOND WITH JSON ONLY:`;

    // Check if custom AI is enabled
    const useCustomAI = process.env.USE_CUSTOM_AI === 'true';
    const customAIUrl = process.env.ITINERARY_AI_URL;

    let itineraryData;

    if (useCustomAI && customAIUrl) {
      // Use custom Ollama AI service with comprehensive prompt
      console.log('Using custom AI service for public itinerary generation');

      const aiResponse = await fetch(`${customAIUrl}/tqb-ai/generate-itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator_id: operatorId,
          days: duration,
          cities: citiesArray,
          tour_type: 'Private',
          pax: numberOfTravelers,
          interests: normalizedInterests,
          start_date: startDate,
          budget: budget || 'moderate',
          prompt: prompt, // Send the full comprehensive prompt
          accommodations: accommodations,
          activities: activities,
          restaurants: restaurants,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('Custom AI service failed');
      }

      const aiData = await aiResponse.json();
      const responseData = aiData.itinerary || aiData;
      const responseText = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);

      // Parse JSON response
      try {
        let cleanedText = responseText.trim();
        if (cleanedText.includes('```json')) {
          cleanedText = cleanedText.split('```json')[1].split('```')[0].trim();
        } else if (cleanedText.includes('```')) {
          cleanedText = cleanedText.split('```')[1].split('```')[0].trim();
        }
        itineraryData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse custom AI response:', responseText);
        return NextResponse.json(
          { error: 'Failed to parse AI response' },
          { status: 500 }
        );
      }
    } else {
      // Use Claude with same comprehensive prompt
      console.log('Using Claude for public itinerary generation');

      const anthropic = getAnthropicClient();
      if (!anthropic) {
        return NextResponse.json(
          { error: 'AI service is not configured' },
          { status: 503 }
        );
      }

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
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
        let cleanedText = responseText.trim();
        if (cleanedText.includes('```json')) {
          cleanedText = cleanedText.split('```json')[1].split('```')[0].trim();
        } else if (cleanedText.includes('```')) {
          cleanedText = cleanedText.split('```')[1].split('```')[0].trim();
        }
        itineraryData = JSON.parse(cleanedText);
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
      cities: citiesArray,
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
