import { NextResponse } from 'next/server';
import { query, queryOne, execute, getTrainingExamples } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { checkAndDeductForItinerary, getCurrentPricing } from '@/lib/credits';
import { getAnthropicClient } from '@/lib/ai';
import { normalizeCities, normalizeCity } from '@/lib/cityMapping';
import { v4 as uuidv4 } from 'uuid';

// Increase timeout for AI API calls - extra buffer for mobile networks
export const maxDuration = 120; // 2 minutes

// Helper function to calculate pricing tiers
async function calculateAndSavePricingTiers(
  itineraryId: string,
  itineraryData: any,
  basePax: number,
  operatorId: string
) {
  // Fetch operator's pricing configuration
  const pricingConfig = await queryOne<any>(`
    SELECT * FROM operator_pricing_config WHERE operator_id = ?
  `, [operatorId]);

  // Use configured values or defaults
  const singleSuppType = pricingConfig?.single_supplement_type || 'percentage';
  const singleSuppValue = pricingConfig?.single_supplement_value || 50.00;
  const tripleDiscount = pricingConfig?.triple_room_discount_percentage || 10.00;
  const threeStarMult = pricingConfig?.three_star_multiplier || 0.70;
  const fourStarMult = pricingConfig?.four_star_multiplier || 1.00;
  const fiveStarMult = pricingConfig?.five_star_multiplier || 1.40;
  const markupPercentage = pricingConfig?.default_markup_percentage || 15.00;
  const taxPercentage = pricingConfig?.default_tax_percentage || 0.00;
  const currency = pricingConfig?.currency || 'USD';

  // Define pax tiers - only generate for the requested pax tier
  const allPaxTiers = [
    { min: 2, max: 3 },
    { min: 4, max: 5 },
    { min: 6, max: 9 },
    { min: 10, max: 15 },
    { min: 16, max: null } // 16+ is unlimited
  ];

  // Find the tier that matches the requested pax
  const requestedTier = allPaxTiers.find(tier =>
    basePax >= tier.min && (tier.max === null || basePax <= tier.max)
  );

  // Only generate pricing for the requested tier
  const paxTiers = requestedTier ? [requestedTier] : [allPaxTiers[0]];

  // Detect which hotel star ratings exist for this operator
  const availableStarRatings = await query<any>(`
    SELECT DISTINCT
      CASE
        WHEN star_rating >= 4.5 THEN 5
        WHEN star_rating >= 3.5 THEN 4
        ELSE 3
      END as star_category
    FROM accommodations
    WHERE operator_id = ? AND is_active = 1
    ORDER BY star_category
  `, [operatorId]);

  const hasThreeStar = availableStarRatings.some((r: any) => r.star_category === 3);
  const hasFourStar = availableStarRatings.some((r: any) => r.star_category === 4);
  const hasFiveStar = availableStarRatings.some((r: any) => r.star_category === 5);

  console.log(`Available hotel categories: 3-star: ${hasThreeStar}, 4-star: ${hasFourStar}, 5-star: ${hasFiveStar}`);

  // Calculate costs from quote_expenses table (not from itinerary JSON)
  let totalAccommodation = 0;
  let totalActivity = 0;
  let totalMeal = 0;
  let totalTransport = 0;

  // Query expenses from database
  const expenses = await query<any>(`
    SELECT qe.category, qe.price_per_person, qe.quantity
    FROM quote_expenses qe
    JOIN quote_days qd ON qe.quote_day_id = qd.id
    WHERE qd.itinerary_id = ?
  `, [itineraryId]);

  for (const expense of expenses) {
    const cost = parseFloat(expense.price_per_person || 0) * parseInt(expense.quantity || 1);

    switch (expense.category) {
      case 'accommodation':
        totalAccommodation += cost;
        break;
      case 'activity':
        totalActivity += cost;
        break;
      case 'meal':
        totalMeal += cost;
        break;
      case 'transport':
        totalTransport += cost;
        break;
    }
  }

  // Calculate base subtotal (for base pax)
  const baseSubtotal = totalAccommodation + totalActivity + totalMeal + totalTransport;

  // Generate pricing for each tier
  for (const tier of paxTiers) {
    const tierPax = tier.min; // Use minimum for calculation

    // Calculate per-person costs
    // Accommodation is fixed (doesn't change with pax)
    // Activities and meals are per-person (scale with pax)
    const scaledActivity = (totalActivity / basePax) * tierPax;
    const scaledMeal = (totalMeal / basePax) * tierPax;

    const tierSubtotal = totalAccommodation + scaledActivity + scaledMeal + totalTransport;

    // Apply operator's configured markup and tax
    const markupAmount = (tierSubtotal * markupPercentage) / 100;
    const subtotalWithMarkup = tierSubtotal + markupAmount;
    const taxAmount = (subtotalWithMarkup * taxPercentage) / 100;
    const total = subtotalWithMarkup + taxAmount;
    const perPerson = total / tierPax;

    // Calculate hotel category pricing ONLY for available star ratings
    let threeStarTotal, threeStarDouble, threeStarTriple, threeStarSingle;
    let fourStarTotal, fourStarDouble, fourStarTriple, fourStarSingle;
    let fiveStarTotal, fiveStarDouble, fiveStarTriple, fiveStarSingle;

    if (hasThreeStar) {
      threeStarTotal = (tierSubtotal * threeStarMult) + markupAmount + taxAmount;
      threeStarDouble = threeStarTotal / tierPax;
      threeStarTriple = threeStarDouble * (1 - tripleDiscount / 100);
      threeStarSingle = singleSuppType === 'percentage'
        ? threeStarDouble * (singleSuppValue / 100)
        : singleSuppValue;
    } else {
      threeStarTotal = threeStarDouble = threeStarTriple = threeStarSingle = null;
    }

    if (hasFourStar) {
      fourStarTotal = (tierSubtotal * fourStarMult) + markupAmount + taxAmount;
      fourStarDouble = fourStarTotal / tierPax;
      fourStarTriple = fourStarDouble * (1 - tripleDiscount / 100);
      fourStarSingle = singleSuppType === 'percentage'
        ? fourStarDouble * (singleSuppValue / 100)
        : singleSuppValue;
    } else {
      fourStarTotal = fourStarDouble = fourStarTriple = fourStarSingle = null;
    }

    if (hasFiveStar) {
      fiveStarTotal = (tierSubtotal * fiveStarMult) + markupAmount + taxAmount;
      fiveStarDouble = fiveStarTotal / tierPax;
      fiveStarTriple = fiveStarDouble * (1 - tripleDiscount / 100);
      fiveStarSingle = singleSuppType === 'percentage'
        ? fiveStarDouble * (singleSuppValue / 100)
        : singleSuppValue;
    } else {
      fiveStarTotal = fiveStarDouble = fiveStarTriple = fiveStarSingle = null;
    }

    // Use the first available tier as the "default" total
    const defaultTotal = fiveStarTotal || fourStarTotal || threeStarTotal || total;
    const defaultPerPerson = fiveStarDouble || fourStarDouble || threeStarDouble || perPerson;

    await execute(
      `INSERT INTO pricing_tiers (
        id, itinerary_id, min_pax, max_pax,
        three_star_double, three_star_triple, three_star_single_supplement,
        four_star_double, four_star_triple, four_star_single_supplement,
        five_star_double, five_star_triple, five_star_single_supplement,
        total_accommodation_cost, total_activity_cost, total_meal_cost, total_transport_cost,
        subtotal, markup_percentage, markup_amount,
        tax_percentage, tax_amount, total, per_person, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        itineraryId,
        tier.min,
        tier.max,
        // 3-star pricing
        threeStarDouble,
        threeStarTriple,
        threeStarSingle,
        // 4-star pricing
        fourStarDouble,
        fourStarTriple,
        fourStarSingle,
        // 5-star pricing
        fiveStarDouble,
        fiveStarTriple,
        fiveStarSingle,
        // Cost breakdown
        totalAccommodation,
        scaledActivity,
        scaledMeal,
        totalTransport,
        // Totals
        tierSubtotal,
        markupPercentage,
        markupAmount,
        taxPercentage,
        taxAmount,
        defaultTotal, // total is based on available tier
        defaultPerPerson, // per_person is based on available tier
        currency
      ]
    );
  }

  console.log(`Saved ${paxTiers.length} pricing tier(s) for ${basePax} pax`);
}

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
      cities, // NEW: array of cities to visit
      arrivalCity: arrivalCityRaw,
      departureCity: departureCityRaw,
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

    // Normalize arrival and departure cities (map districts to parent cities)
    const arrivalCity = arrivalCityRaw ? normalizeCity(arrivalCityRaw) : null;
    const departureCity = departureCityRaw ? normalizeCity(departureCityRaw) : null;

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

    // Build cities list for AI - use cities array if provided, otherwise fallback to arrivalCity/departureCity
    const citiesArrayRaw = Array.isArray(cities) && cities.length > 0
      ? cities
      : [arrivalCity, departureCity].filter((city, index, self) => city && self.indexOf(city) === index);

    // Normalize cities (map districts to parent cities: Göreme → Cappadocia, Taksim → Istanbul, etc.)
    const citiesArray = normalizeCities(citiesArrayRaw);
    console.log(`Cities normalized: ${citiesArrayRaw.join(', ')} → ${citiesArray.join(', ')}`);

    console.log(`Generating itinerary with Claude Sonnet 4.5 for operator ${userData.operatorId}...`);
    const apiStartTime = Date.now();

    // Fetch operator's services from database for ALL selected cities
    const cityPlaceholders = citiesArray.map(() => '?').join(',');

    const accommodations = await query<any>(`
      SELECT id, name, city, star_rating, base_price_per_night, category
      FROM accommodations
      WHERE city IN (${cityPlaceholders}) AND is_active = 1
      ORDER BY city, star_rating DESC
      LIMIT 20
    `, citiesArray);

    const activities = await query<any>(`
      SELECT id, name, city, base_price, duration_hours, category
      FROM activities
      WHERE city IN (${cityPlaceholders}) AND is_active = 1
      ORDER BY city, category
      LIMIT 30
    `, citiesArray);

    const restaurants = await query<any>(`
      SELECT id, name, city, cuisine_type, lunch_price, dinner_price
      FROM operator_restaurants
      WHERE city IN (${cityPlaceholders}) AND is_active = 1
      ORDER BY city
      LIMIT 15
    `, citiesArray);

    const nights = duration - 1;

    // Calculate days distribution across cities (2-night minimum per city)
    const nightsPerCity = Math.floor(nights / citiesArray.length);
    const remainingNights = nights % citiesArray.length;

    // Group hotels and activities by city for easier reference
    const hotelsByCity: Record<string, any[]> = {};
    const activitiesByCity: Record<string, any[]> = {};
    const restaurantsByCity: Record<string, any[]> = {};

    citiesArray.forEach(city => {
      hotelsByCity[city] = accommodations.filter(a => a.city === city);
      activitiesByCity[city] = activities.filter(a => a.city === city);
      restaurantsByCity[city] = restaurants.filter(r => r.city === city);
    });

    // Fetch training examples for AI learning (only when using custom AI)
    const useCustomAI = process.env.USE_CUSTOM_AI === 'true';
    let trainingExamplesText = '';
    if (useCustomAI) {
      const trainingExamples = await getTrainingExamples(duration, accommodationType || 'Private', 1);
      if (trainingExamples.length > 0) {
        trainingExamplesText = `

📚 TRAINING EXAMPLES - LEARN FROM THESE PERFECT ITINERARIES:

${trainingExamples.map((example, idx) => `
EXAMPLE ${idx + 1}: ${example.title}
${example.days} days | Cities: ${example.cities}
${example.content}
`).join('\n' + '='.repeat(80) + '\n')}

⚠️ IMPORTANT: These examples show you the QUALITY and STRUCTURE expected. Use them as guidance for:
- Professional narrative style and storytelling
- Logical day-by-day flow and pacing
- Hotel-to-city matching accuracy
- Activity selection and timing
- Meal planning and restaurant selection
- Transportation coordination

NOW CREATE A SIMILAR QUALITY ITINERARY BASED ON THE REQUIREMENTS BELOW:
${'-'.repeat(80)}
`;
      }
    }

    // Build comprehensive prompt for Claude
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

    // Call AI service (either Claude or custom AI) - useCustomAI already declared above
    let responseText = '';
    let inputTokens = 0;
    let outputTokens = 0;

    if (useCustomAI) {
      // Use custom AI service
      console.log('Using custom AI service at', process.env.ITINERARY_AI_URL);

      const customAIResponse = await fetch(`${process.env.ITINERARY_AI_URL}/tqb-ai/generate-itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operator_id: userData.operatorId,
          days: duration,
          cities: citiesArray,
          tour_type: accommodationType,
          pax: numberOfTravelers,
          interests: normalizedInterests,
          start_date: startDate,
          budget: budget || 'moderate',
          prompt: prompt // Send the full prompt for context
        }),
        signal: AbortSignal.timeout(600000) // 10 minutes timeout for complex multi-city trips
      });

      if (!customAIResponse.ok) {
        throw new Error(`Custom AI service error: ${customAIResponse.status}`);
      }

      const customAIData = await customAIResponse.json();
      // Extract the itinerary field from {success: true, itinerary: {...}}
      const itineraryData = customAIData.itinerary || customAIData;
      responseText = typeof itineraryData === 'string' ? itineraryData : JSON.stringify(itineraryData);

      // Estimate tokens for cost tracking (rough estimate)
      inputTokens = Math.floor(prompt.length / 4);
      outputTokens = Math.floor(responseText.length / 4);

    } else {
      // Use Claude API
      console.log('Using Claude Sonnet 4.5 API');
      const anthropic = getAnthropicClient();
      if (!anthropic) {
        return NextResponse.json(
          { error: 'AI service not configured' },
          { status: 500 }
        );
      }

      const claudeResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      responseText = claudeResponse.content[0].type === 'text'
        ? claudeResponse.content[0].text
        : '';

      inputTokens = claudeResponse.usage.input_tokens;
      outputTokens = claudeResponse.usage.output_tokens;
    }

    // Parse JSON response
    let itineraryData;
    try {
      // Clean any markdown formatting
      let cleanedText = responseText.trim();
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.split('```json')[1].split('```')[0].trim();
      } else if (cleanedText.includes('```')) {
        cleanedText = cleanedText.split('```')[1].split('```')[0].trim();
      }
      itineraryData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
    const apiDuration = Date.now() - apiStartTime;
    console.log(`Claude Sonnet 4.5 response received in ${apiDuration}ms`);
    // This massively reduces code and eliminates context window issues!
    /*
    // Fetch ALL accommodations in relevant cities (don't filter by type - let AI choose best options)
    // This ensures we show boutique, hotel, resort, etc. - giving AI more flexibility
    const accommodations: any[] = await query(
      `SELECT a.*,
              arr.room_type, arr.adult_price_double, arr.single_supplement,
              arr.breakfast_included, arr.half_board_supplement, arr.full_board_supplement,
              COALESCE(apv.price_per_night, a.base_price_per_night) as effective_price,
              apv.season_name,
              a.address, a.phone, a.check_in_time, a.check_out_time, a.website
       FROM accommodations a
       LEFT JOIN accommodation_room_rates arr ON a.id = arr.accommodation_id
         AND arr.is_active = 1
         AND ? BETWEEN arr.valid_from AND arr.valid_until
       LEFT JOIN accommodation_price_variations apv ON a.id = apv.accommodation_id
         AND ? BETWEEN apv.start_date AND apv.end_date
       WHERE a.city IN (${allCities.map(() => '?').join(',')})
         AND a.is_active = 1
       ORDER BY a.city, a.star_rating DESC, a.category
       LIMIT 30`,
      [startDate, startDate, ...allCities]
    );

    // Fetch relevant activities with pricing from database
    const activities: any[] = await query(
      `SELECT a.*,
              COALESCE(apv.price, a.base_price) as effective_price,
              apv.season_name,
              a.meeting_point, a.phone, a.booking_required, a.difficulty_level,
              a.operating_hours, a.best_time_to_visit, a.included_items, a.excluded_items,
              a.cancellation_policy
       FROM activities a
       LEFT JOIN activity_price_variations apv ON a.id = apv.activity_id
         AND ? BETWEEN apv.start_date AND apv.end_date
       WHERE a.city IN (${allCities.map(() => '?').join(',')})
         AND a.is_active = 1
       ORDER BY a.category
       LIMIT 30`,
      [startDate, ...allCities]
    );

    // Fetch transport options with pricing
    const transport: any[] = await query(
      `SELECT t.*,
              COALESCE(tpv.price, t.base_price) as effective_price,
              tpv.season_name,
              t.pickup_location, t.default_departure_time, t.includes_meet_greet,
              t.luggage_capacity, t.contact_phone, t.distance_km, t.duration_minutes
       FROM operator_transport t
       LEFT JOIN transport_price_variations tpv ON t.id = tpv.transport_id
         AND ? BETWEEN tpv.start_date AND tpv.end_date
       WHERE t.operator_id = ?
         AND t.is_active = 1
       ORDER BY t.type
       LIMIT 20`,
      [startDate, userData.operatorId]
    );

    // Fetch restaurants - prioritize cities in itinerary but show some others too
    const restaurants: any[] = await query(
      `SELECT r.*,
              r.phone, r.operating_hours, r.reservation_required,
              r.average_meal_duration, r.dress_code, r.recommended_dishes,
              CASE WHEN r.city IN (${allCities.map(() => '?').join(',')}) THEN 1 ELSE 2 END as priority
       FROM operator_restaurants r
       WHERE r.operator_id = ?
         AND r.is_active = 1
       ORDER BY priority, r.city, r.cuisine_type
       LIMIT 40`,
      [...allCities, userData.operatorId]
    );

    // Fetch additional services (insurance, museum passes, SIM cards, etc.)
    let additionalServices: any[] = [];
    try {
      additionalServices = await query(
        `SELECT s.*,
                COALESCE(spv.price, s.price) as effective_price,
                spv.season_name
         FROM operator_additional_services s
         LEFT JOIN additional_service_price_variations spv ON s.id = spv.service_id
           AND ? BETWEEN spv.start_date AND spv.end_date
         WHERE s.operator_id = ?
           AND s.is_active = 1
         ORDER BY s.service_type, s.name
         LIMIT 20`,
        [startDate, userData.operatorId]
      );
    } catch (error: any) {
      if (error?.code !== 'ER_NO_SUCH_TABLE') {
        console.error('Error fetching additional services:', error);
      }
    }

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
        Address: ${acc.address || 'N/A'}
        Phone: ${acc.phone || 'N/A'}
        Check-in: ${acc.check_in_time || '14:00'} | Check-out: ${acc.check_out_time || '11:00'}
        Amenities: ${amenities.join(', ')}
        ${acc.description || ''}`;
    }).join('\n');

    const activitiesList = activities.map(act => {
      const highlights = act.highlights ? JSON.parse(act.highlights) : [];
      const included = act.included_items ? JSON.parse(act.included_items) : [];
      const excluded = act.excluded_items ? JSON.parse(act.excluded_items) : [];
      return `- ${act.name} (${act.city}) - ${act.category}
        Price: $${Number(act.effective_price || act.base_price).toFixed(2)} per person
        Duration: ${act.duration_hours} hours
        Difficulty: ${act.difficulty_level || 'easy'}
        ${act.meeting_point ? `Meeting point: ${act.meeting_point}` : ''}
        ${act.phone ? `Contact: ${act.phone}` : ''}
        ${act.operating_hours ? `Hours: ${act.operating_hours}` : ''}
        ${act.best_time_to_visit ? `Best time: ${act.best_time_to_visit}` : ''}
        ${act.booking_required ? 'Booking required: Yes' : 'Booking required: No'}
        ${included.length > 0 ? `Included: ${included.join(', ')}` : ''}
        ${excluded.length > 0 ? `Not included: ${excluded.join(', ')}` : ''}
        ${act.cancellation_policy ? `Cancellation: ${act.cancellation_policy}` : ''}
        ${act.min_participants ? `Min participants: ${act.min_participants}` : ''}
        ${act.description || ''}
        ${highlights.length > 0 ? `Highlights: ${highlights.join(', ')}` : ''}`;
    }).join('\n');

    const transportList = transport.map(t => {
      return `- ${t.name}: ${t.from_location} → ${t.to_location} (${t.type})
        Vehicle: ${t.vehicle_type} (capacity: ${t.max_passengers || t.min_passengers || 'N/A'})
        Price: $${Number(t.effective_price || t.base_price).toFixed(2)}
        ${t.distance_km ? `Distance: ${t.distance_km} km` : ''}
        ${t.duration_minutes ? `Duration: ${Math.round(t.duration_minutes / 60)} hours ${t.duration_minutes % 60} min` : ''}
        ${t.pickup_location ? `Pickup: ${t.pickup_location}` : ''}
        ${t.includes_meet_greet ? 'Includes meet & greet service' : ''}
        ${t.contact_phone ? `Contact: ${t.contact_phone}` : ''}`;
    }).join('\n');

    const restaurantsList = restaurants.map(r => {
      const meals = [];
      if (r.breakfast_price && Number(r.breakfast_price) > 0) meals.push(`Breakfast: $${Number(r.breakfast_price).toFixed(2)}/person`);
      if (r.lunch_price && Number(r.lunch_price) > 0) meals.push(`Lunch: $${Number(r.lunch_price).toFixed(2)}/person`);
      if (r.dinner_price && Number(r.dinner_price) > 0) meals.push(`Dinner: $${Number(r.dinner_price).toFixed(2)}/person`);
      const recommended = r.recommended_dishes ? JSON.parse(r.recommended_dishes) : [];
      const specialties = r.specialties ? JSON.parse(r.specialties) : [];
      return `- ${r.name} (${r.city}) - ${r.cuisine_type}
        ${meals.length > 0 ? meals.join(', ') : ''}
        ${r.address ? `Address: ${r.address}` : ''}
        ${r.phone ? `Phone: ${r.phone}` : ''}
        ${r.operating_hours ? `Hours: ${r.operating_hours}` : ''}
        ${r.reservation_required ? 'Reservation recommended' : 'Walk-ins welcome'}
        ${r.dress_code ? `Dress code: ${r.dress_code}` : ''}
        ${recommended.length > 0 ? `Recommended: ${recommended.join(', ')}` : ''}
        ${specialties.length > 0 ? `Specialties: ${specialties.join(', ')}` : ''}`;
    }).join('\n');

    const guidesList = guides.map(g => {
      const langs = g.languages ? JSON.parse(g.languages) : [];
      return `- ${g.name} (${g.guide_type}) - ${g.specialization}
        Languages: ${langs.join(', ')}
        Full day: $${Number(g.effective_price_per_day || g.price_per_day || 0).toFixed(2)} | Half day: $${Number(g.effective_price_half_day || g.price_half_day || 0).toFixed(2)}`;
    }).join('\n');

    const additionalServicesList = additionalServices.map(svc => {
      return `- ${svc.name} (${svc.service_type})
        Price: $${Number(svc.effective_price || svc.price || 0).toFixed(2)} ${svc.price_type || 'per item'}
        ${svc.description || ''}`;
    }).join('\n');

    // Log data counts for debugging
    console.log(`Itinerary generation - Data fetched: ${accommodations.length} accommodations, ${activities.length} activities, ${transport.length} transport, ${restaurants.length} restaurants, ${guides.length} guides, ${additionalServices.length} additional services`);

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
${additionalServices.length > 0 ? `
AVAILABLE ADDITIONAL SERVICES (insurance, passes, SIM cards, etc.):
${additionalServicesList}` : ''}

Please create a comprehensive day-by-day itinerary that includes:
1. Daily activities ONLY from the available activities list above with EXACT prices
2. Accommodations ONLY from the available accommodations list above with EXACT prices
3. Transportation ONLY from the available transport list above with EXACT prices
4. Restaurant recommendations ONLY from the available restaurants list above with EXACT prices
${guides.length > 0 ? '5. Guide assignments from the available guides list when appropriate with EXACT prices' : ''}
${guides.length > 0 ? '6' : '5'}. Local tips and cultural insights
${guides.length > 0 ? '7' : '6'}. Calculate accurate total costs based on the EXACT prices provided

Format the response as a structured JSON with this ENHANCED format (RoutePerfect-style comprehensive itinerary):
{
  "title": "Trip title",
  "summary": "Brief 2-3 sentence overview highlighting key experiences",
  "highlights": ["Day 1: Hagia Sophia visit", "Day 2: Hot air balloon ride", "Day 3: Beach relaxation"],
  "totalEstimatedCost": {
    "breakdown": {
      "accommodations": number,
      "activities": number,
      "meals": number,
      "transportation": number,
      "guides": number (if used)
    },
    "subtotal": number,
    "total": number,
    "perPerson": number (total divided by ${numberOfTravelers}),
    "currency": "USD"
  },
  "whatIsIncluded": ["Accommodations for X nights", "Daily breakfast", "All entrance fees", "Private transfers"],
  "whatIsNotIncluded": ["International flights", "Travel insurance", "Personal expenses", "Tips and gratuities"],
  "days": [
    {
      "day": 1,
      "date": "Calculate actual date from ${startDate}",
      "title": "Descriptive day title",
      "city": "City name",
      "highlights": ["Top 2-3 activities for the day"],
      "activities": [
        {
          "time": "09:00",
          "endTime": "11:00",
          "title": "EXACT activity name from database",
          "category": "cultural/adventure/food/relaxation",
          "description": "Description from database",
          "duration": "2 hours",
          "difficultyLevel": "easy/moderate/challenging",
          "meetingPoint": "From database if available",
          "phone": "Contact from database",
          "bookingRequired": true/false,
          "included": ["Item 1", "Item 2"] (from database),
          "excluded": ["Item 1"] (from database),
          "tips": "Best time to visit, crowd avoidance, photo spots",
          "cost": {
            "perPerson": number,
            "totalForGroup": number (multiply by ${numberOfTravelers}),
            "currency": "USD"
          }
        }
      ],
      "accommodation": {
        "name": "EXACT hotel name from database",
        "address": "Full address from database",
        "phone": "Phone from database",
        "checkIn": "Time from database (14:00 default)",
        "checkOut": "Time from database (11:00 default)",
        "roomType": "Double/Suite/etc",
        "starRating": number,
        "amenities": ["WiFi", "Pool", "etc from database"],
        "pricePerNight": number,
        "description": "From database"
      },
      "meals": [
        {
          "time": "12:30",
          "type": "breakfast/lunch/dinner",
          "restaurant": "EXACT restaurant name from database",
          "address": "Address from database",
          "phone": "Phone from database",
          "cuisine": "Cuisine type from database",
          "operatingHours": "From database",
          "reservationRequired": true/false,
          "dressCode": "casual/smart_casual/formal",
          "recommendedDishes": ["Dish 1", "Dish 2"] (from database),
          "estimatedCost": {
            "perPerson": number,
            "totalForGroup": number,
            "currency": "USD"
          }
        }
      ],
      "transportation": [
        {
          "time": "08:30",
          "method": "Type from database",
          "from": "Location",
          "to": "Location",
          "distance": "X km from database",
          "duration": "Duration from database",
          "vehicleType": "From database",
          "pickupLocation": "From database",
          "contact": "Phone from database",
          "meetAndGreet": true/false,
          "cost": {
            "total": number,
            "currency": "USD"
          }
        }
      ],
      "freeTime": "15:00-18:00 - Free time suggestions",
      "totalDayCost": {
        "breakdown": {
          "activities": number,
          "meals": number,
          "accommodation": number,
          "transport": number
        },
        "total": number
      }
    }
  ],
  "packingList": ["Season-appropriate clothing", "Modest clothing for mosques", "Comfortable walking shoes", "Sunscreen", etc],
  "importantNotes": ["Best photo spots", "Cultural etiquette", "Tipping guidelines", "Emergency contacts", "Weather notes"],
  "emergencyContacts": {
    "tourOperator": "Phone",
    "emergencyServices": "112",
    "touristPolice": "153"
  },
  "cancellationPolicy": "From activities or general policy"
}

CRITICAL REMINDERS:
- Use EXACT names from the lists above for hotels, activities, restaurants, transport
- Use EXACT prices from the lists above
- Include ALL available contact information (address, phone, hours) from the database lists
- Calculate actual dates for each day starting from ${startDate}
- For activities and meals: price shown is per person, multiply by ${numberOfTravelers} for totalForGroup
- Include daily cost breakdowns AND overall trip breakdown
- Add specific times for all activities, meals, and transport
- Include travel times and distances between locations from transport database
- Suggest free time blocks - don't over-schedule every minute
- Add practical tips: best visiting times, crowd avoidance, photo spots, cultural etiquette
- Include what's included vs excluded for transparency
- If no suitable service exists in database lists, mention in importantNotes (don't make up services)
- Make packing list season-specific and activity-appropriate
- Calculate totalEstimatedCost by summing ALL costs across all days

Make the itinerary comprehensive, realistic, engaging, and optimized for budget and interests. This should be a professional, all-in-one travel document with every detail a traveler needs.`;

    // Call Claude API
    const anthropic = getAnthropicClient();
    if (!anthropic) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      );
    }

    console.log('Calling Claude API...');
    const apiStartTime = Date.now();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000, // Increased for comprehensive itinerary output
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    const apiDuration = Date.now() - apiStartTime;
    console.log(`Claude API response received in ${apiDuration}ms`);
    console.log(`Token usage: ${message.usage.input_tokens} input, ${message.usage.output_tokens} output, ${message.usage.input_tokens + message.usage.output_tokens} total`);

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
    */
    // END OF OLD CODE - now using itinerary-ai service instead!

    // Save to database
    const itineraryId = uuidv4();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    // Store trip preferences in preferences JSON
    const preferences = {
      budget,
      interests: normalizedInterests,
      cities: citiesArray, // Store the multi-city selection
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

    // Save quote days and expenses to new professional quote system
    console.log('Saving expense breakdown to quote_days and quote_expenses...');

    if (itineraryData.days && Array.isArray(itineraryData.days)) {
      for (const day of itineraryData.days) {
        const quoteDayId = uuidv4();

        // Insert quote day with narrative description
        await execute(
          `INSERT INTO quote_days (
            id, itinerary_id, day_number, date, title, city,
            description, meal_code, highlights, free_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quoteDayId,
            itineraryId,
            day.dayNumber,
            day.date,
            day.title,
            null, // city extracted from title if needed
            day.description || null,
            day.mealCode || '(-)',
            JSON.stringify([]), // highlights in description now
            null
          ]
        );

        // Create expenses from selected services
        let displayOrder = 0;

        // Add transfer IN on day 1
        if (day.dayNumber === 1) {
          await execute(
            `INSERT INTO quote_expenses (
              id, quote_day_id, category, service_id, service_type,
              name, description, time, end_time, duration_hours,
              base_price, price_per_person, quantity,
              address, phone, meeting_point,
              booking_required, difficulty_level,
              included_items, excluded_items, tips, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              uuidv4(), quoteDayId, 'transport', null, 'transport',
              'Airport to Hotel Transfer (IN)', 'Private arrival transfer',
              null, null, null, 30, 30, numberOfTravelers,
              null, null, null, false, null,
              JSON.stringify([]), JSON.stringify([]), null, displayOrder++
            ]
          );
        }

        // Add accommodation for each night
        if (day.selectedHotel && day.dayNumber < duration) {
          const hotel = accommodations.find(a => a.name === day.selectedHotel);
          if (hotel) {
            await execute(
              `INSERT INTO quote_expenses (
                id, quote_day_id, category, service_id, service_type,
                name, description, time, end_time, duration_hours,
                base_price, price_per_person, quantity,
                address, phone, meeting_point,
                booking_required, difficulty_level,
                included_items, excluded_items, tips, display_order
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                uuidv4(), quoteDayId, 'accommodation', hotel.id, 'accommodation',
                hotel.name, `${hotel.star_rating}-star hotel`,
                null, null, null,
                parseFloat(hotel.base_price_per_night), parseFloat(hotel.base_price_per_night), 1,
                null, null, null, false, null,
                JSON.stringify([]), JSON.stringify([]), null, displayOrder++
              ]
            );
          }
        }

        // Add activities
        if (day.selectedActivities && Array.isArray(day.selectedActivities)) {
          for (const activityName of day.selectedActivities) {
            const activity = activities.find(a => a.name === activityName);
            if (activity) {
              await execute(
                `INSERT INTO quote_expenses (
                  id, quote_day_id, category, service_id, service_type,
                  name, description, time, end_time, duration_hours,
                  base_price, price_per_person, quantity,
                  address, phone, meeting_point,
                  booking_required, difficulty_level,
                  included_items, excluded_items, tips, display_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  uuidv4(), quoteDayId, 'activity', activity.id, 'activity',
                  activity.name, activity.category || '',
                  null, null, activity.duration_hours,
                  parseFloat(activity.base_price), parseFloat(activity.base_price), numberOfTravelers,
                  null, null, null, false, null,
                  JSON.stringify([]), JSON.stringify([]), null, displayOrder++
                ]
              );
            }
          }
        }

        // Add transfer OUT on final day
        if (day.dayNumber === duration) {
          await execute(
            `INSERT INTO quote_expenses (
              id, quote_day_id, category, service_id, service_type,
              name, description, time, end_time, duration_hours,
              base_price, price_per_person, quantity,
              address, phone, meeting_point,
              booking_required, difficulty_level,
              included_items, excluded_items, tips, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              uuidv4(), quoteDayId, 'transport', null, 'transport',
              'Hotel to Airport Transfer (OUT)', 'Private departure transfer',
              null, null, null, 30, 30, numberOfTravelers,
              null, null, null, false, null,
              JSON.stringify([]), JSON.stringify([]), null, displayOrder++
            ]
          );
        }
      }
      console.log(`Saved ${itineraryData.days.length} days with expenses`);
    }

    // Calculate and save pricing tiers
    console.log('Calculating pricing tiers...');
    await calculateAndSavePricingTiers(itineraryId, itineraryData, numberOfTravelers, userData.operatorId);

    // Track API usage
    let cost = 0;
    let apiType = '';
    let endpoint = '';

    if (useCustomAI) {
      // Custom AI service - much cheaper or free
      cost = 0; // You can set a small cost if needed
      apiType = 'custom-ai';
      endpoint = 'tqb-ai-service';
    } else {
      // Claude Sonnet 4.5: $3/M input, $15/M output
      cost = (inputTokens * 3 / 1000000) + (outputTokens * 15 / 1000000);
      apiType = 'anthropic-claude';
      endpoint = 'claude-sonnet-4-20250514';
    }

    await execute(
      `INSERT INTO api_usage (
        id, operator_id, api_type, endpoint, cost, success
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), userData.operatorId, apiType, endpoint, cost, true]
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
