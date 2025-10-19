import { NextResponse } from 'next/server';
import { execute, queryOne, query, getTrainingExamples } from '@/lib/db';
import { getAnthropicClient } from '@/lib/ai';
import { normalizeCities, normalizeCity } from '@/lib/cityMapping';
import { v4 as uuidv4 } from 'uuid';

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

  // Detect which hotel star ratings were ACTUALLY USED in this itinerary
  const usedStarRatings = await query<any>(`
    SELECT DISTINCT
      CASE
        WHEN CAST(SUBSTRING_INDEX(qe.description, '-', 1) AS DECIMAL(3,1)) >= 4.5 THEN 5
        WHEN CAST(SUBSTRING_INDEX(qe.description, '-', 1) AS DECIMAL(3,1)) >= 3.5 THEN 4
        ELSE 3
      END as star_category
    FROM quote_expenses qe
    JOIN quote_days qd ON qe.quote_day_id = qd.id
    WHERE qd.itinerary_id = ? AND qe.category = 'accommodation'
    ORDER BY star_category
  `, [itineraryId]);

  const hasThreeStar = usedStarRatings.some((r: any) => r.star_category === 3);
  const hasFourStar = usedStarRatings.some((r: any) => r.star_category === 4);
  const hasFiveStar = usedStarRatings.some((r: any) => r.star_category === 5);

  console.log(`Hotels ACTUALLY USED in itinerary: 3-star: ${hasThreeStar}, 4-star: ${hasFourStar}, 5-star: ${hasFiveStar}`);

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

// Increase timeout for AI API calls - extra buffer for mobile networks
export const maxDuration = 120; // 2 minutes

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
      cities: citiesRaw,
      arrivalCity: arrivalCityRaw,
      departureCity: departureCityRaw,
      accommodationType,
      additionalRequests,
    } = body;

    // Normalize cities if provided (map districts to parent cities: Göreme → Cappadocia, Taksim → Istanbul, etc.)
    // If not provided, AI will intelligently select cities based on preferences
    let cities = citiesRaw ? normalizeCities(Array.isArray(citiesRaw) ? citiesRaw : [citiesRaw]) : [];

    // Default arrival/departure to Istanbul (most international flights)
    const arrivalCity = arrivalCityRaw ? normalizeCity(arrivalCityRaw) : 'Istanbul';
    const departureCity = departureCityRaw ? normalizeCity(departureCityRaw) : 'Istanbul';

    if (
      !operatorId ||
      !customerName ||
      !email ||
      !numberOfTravelers ||
      !duration ||
      !startDate
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

    console.log(`Cities normalized: ${citiesRaw} → ${cities.join(', ')}`);

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

    // If no cities provided, query all cities where operator has hotels (AI will select)
    if (!cities || cities.length === 0) {
      const availableCities = await query<any>(
        `SELECT DISTINCT city FROM accommodations
         WHERE operator_id = ? AND is_active = 1
         ORDER BY city`,
        [operatorId]
      );
      cities = availableCities.map((row: any) => row.city);
      console.log(`No cities specified - AI will select from available cities: ${cities.join(', ')}`);
    }

    // Prepare city-related data
    const citiesArray = Array.isArray(cities) ? cities : [cities];
    const nights = duration - 1;
    const nightsPerCity = citiesArray.length > 0 ? Math.floor(nights / citiesArray.length) : nights;
    const remainingNights = citiesArray.length > 0 ? nights % citiesArray.length : 0;

    // Create placeholders for IN clause
    const cityPlaceholders = citiesArray.map(() => '?').join(',');

    // Fetch accommodations by city (operator's hotels only)
    const accommodations = await query(
      `SELECT id, name, city, star_rating, base_price_per_night, category
       FROM accommodations
       WHERE operator_id = ? AND city IN (${cityPlaceholders}) AND is_active = 1
       ORDER BY city, star_rating DESC
       LIMIT 50`,
      [operatorId, ...citiesArray]
    );

    // Fetch activities by city (operator's activities only)
    const activities = await query(
      `SELECT id, name, city, base_price, duration_hours, category
       FROM activities
       WHERE operator_id = ? AND city IN (${cityPlaceholders}) AND is_active = 1
       ORDER BY city, category
       LIMIT 50`,
      [operatorId, ...citiesArray]
    );

    // Fetch restaurants by city (operator's restaurants only)
    const restaurants = await query(
      `SELECT id, name, city, cuisine_type, lunch_price, dinner_price
       FROM operator_restaurants
       WHERE operator_id = ? AND city IN (${cityPlaceholders}) AND is_active = 1
       ORDER BY city
       LIMIT 30`,
      [operatorId, ...citiesArray]
    );

    // Fetch transport services for the operator
    const transport = await query(
      `SELECT id, name, type, from_location, to_location, vehicle_type,
              base_price, max_passengers, duration_minutes, distance_km
       FROM operator_transport
       WHERE operator_id = ? AND is_active = 1
       ORDER BY type
       LIMIT 20`,
      [operatorId]
    );

    // Fetch guide services for the operator
    const guides = await query(
      `SELECT id, name, guide_type, languages, specialization,
              price_per_day, price_per_hour, price_half_day, max_group_size
       FROM operator_guide_services
       WHERE operator_id = ? AND is_active = 1
       ORDER BY guide_type
       LIMIT 15`,
      [operatorId]
    );

    // Fetch additional services for the operator
    const additionalServices = await query(
      `SELECT id, name, service_type, price, price_type, description
       FROM operator_additional_services
       WHERE operator_id = ? AND is_active = 1
       ORDER BY service_type
       LIMIT 20`,
      [operatorId]
    );

    // Group data by city and type
    const hotelsByCity: Record<string, any[]> = {};
    const activitiesByCity: Record<string, any[]> = {};
    const restaurantsByCity: Record<string, any[]> = {};
    const transportByRoute: Record<string, any[]> = {};
    const guidesByType: Record<string, any[]> = {};
    const servicesByType: Record<string, any[]> = {};

    citiesArray.forEach(city => {
      hotelsByCity[city] = accommodations.filter(a => a.city === city);
      activitiesByCity[city] = activities.filter(a => a.city === city);
      restaurantsByCity[city] = restaurants.filter(r => r.city === city);
    });

    // Group transport by type
    transport.forEach(t => {
      if (!transportByRoute[t.type]) {
        transportByRoute[t.type] = [];
      }
      transportByRoute[t.type].push(t);
    });

    // Group guides by type
    guides.forEach(g => {
      if (!guidesByType[g.guide_type]) {
        guidesByType[g.guide_type] = [];
      }
      guidesByType[g.guide_type].push(g);
    });

    // Group additional services by type
    additionalServices.forEach(s => {
      if (!servicesByType[s.service_type]) {
        servicesByType[s.service_type] = [];
      }
      servicesByType[s.service_type].push(s);
    });

    // Count hotels/activities per city for AI decision-making
    const cityInventory = citiesArray.map(city => ({
      city,
      hotels: (hotelsByCity[city] || []).length,
      activities: (activitiesByCity[city] || []).length,
      restaurants: (restaurantsByCity[city] || []).length
    }));

    // Build comprehensive prompt with intelligent city selection
    const userSpecifiedCities = citiesRaw && citiesRaw.length > 0;
    const prompt = `You are a professional Turkey tour operator creating an engaging multi-city itinerary.
${trainingExamplesText}

TRIP DETAILS:
- Duration: ${duration} days (${nights} night${nights > 1 ? 's' : ''})
- Travelers: ${numberOfTravelers} people
- Start Date: ${startDate}
- Arrival City: ${arrivalCity}
- Departure City: ${departureCity}
- Budget: ${budget || 'moderate'}
- Interests: ${normalizedInterests.join(', ') || 'history, culture'}
${additionalRequests ? `- Special Requests: ${additionalRequests}` : ''}

${additionalRequests ? `
🚨 CUSTOMER SPECIAL REQUESTS - MANDATORY TO FULFILL:
Customer wrote: "${additionalRequests}"

YOUR TASK: Carefully read the customer's text and identify ANY specific requests:
1. **Specific Activities** (e.g., "hot air balloon", "cooking class", "scuba diving")
   → Search the AVAILABLE ACTIVITIES lists below and INCLUDE them in the itinerary
2. **Transport Preferences** (e.g., "prefer flights", "we want bus", "need private transfer")
   → Use the AVAILABLE TRANSPORT OPTIONS below and include as requested
3. **Accommodation Requests** (e.g., "cave hotel", "beachfront", "boutique hotel")
   → Select matching hotels from AVAILABLE HOTELS lists
4. **Dining Preferences** (e.g., "vegetarian meals", "seafood restaurants", "local cuisine")
   → Note in descriptions and select appropriate restaurants
5. **Special Needs** (e.g., "wheelchair accessible", "child-friendly", "romantic")
   → Reflect in hotel/activity selections and descriptions

⚠️ CRITICAL EXECUTION STEPS - FOLLOW EXACTLY:

STEP-BY-STEP EXAMPLE: Customer writes "we want hot air balloon ride"

1. FIND IN DATABASE: Look in AVAILABLE ACTIVITIES for Cappadocia
   → Found: "Hot Air Balloon Flight | $250/person | 3hrs"

2. ADD TO JSON STRUCTURE:
   ❌ WRONG (mentioning in description only):
   {
     "description": "Visit fairy chimneys. Hot air balloon available (optional)...",
     "selectedActivities": []  // ← EMPTY! Not priced!
   }

   ✅ CORRECT (add to selectedActivities array):
   {
     "description": "Start with an unforgettable hot air balloon flight over fairy chimneys...",
     "selectedActivities": ["Hot Air Balloon Flight"]  // ← EXACT name from list!
   }

3. RESULT: Activity will be priced ($250 × travelers) and displayed on itinerary

MORE EXAMPLES:

Customer: "prefer flights between cities"
→ Add to selectedTransport: ["Flight Transfer from Istanbul to Cappadocia"]
   NOT: ["Bus Transfer"]

Customer: "cooking class"
→ Find in AVAILABLE ACTIVITIES: "Turkish Cooking Class"
→ Add to selectedActivities: ["Turkish Cooking Class"]

Customer: "vegetarian meals"
→ Add to description: "vegetarian-friendly restaurant"
→ Select restaurants with vegetarian options

🔴 NEVER mention activities as "(optional)" - if customer requests it, INCLUDE IT IN selectedActivities!
` : ''}

AVAILABLE CITIES (you have inventory in these cities):
${cityInventory.map(c => `  • ${c.city}: ${c.hotels} hotels, ${c.activities} activities, ${c.restaurants} restaurants`).join('\n')}

${userSpecifiedCities ? `CITY ROUTING (customer requested these cities):
- Follow this order: ${citiesArray.join(' → ')}
- Distribute ${nights} nights across these ${citiesArray.length} cities
- Suggested distribution: ${citiesArray.map((city, idx) => {
    const cityNights = nightsPerCity + (idx < remainingNights ? 1 : 0);
    return `${city}: ~${cityNights} nights`;
  }).join(', ')}` : `INTELLIGENT CITY SELECTION (you select the best cities):
- Based on ${duration} days, select 1-3 cities from AVAILABLE CITIES above:
  • 1-4 days: Select 1 city (best match for interests)
  • 5-8 days: Select 2 cities (complementary experiences, min 2 nights each)
  • 9+ days: Select 3 cities (diverse itinerary, min 2 nights each)
- Match cities to customer interests and budget:
  • Historical/Cultural → Istanbul (Ottoman palaces, mosques, bazaars)
  • Adventure/Nature → Cappadocia (hot air balloons, valleys, cave hotels)
  • Beach/Relaxation → Antalya (Mediterranean coast, resorts)
  • Mix of everything → Istanbul + Cappadocia or Istanbul + Antalya
- Create logical routing (minimize backtracking)
- ONLY select cities from AVAILABLE CITIES list above`}

ROUTING STRATEGY:
- Total ${nights} nights accommodation needed
- Each city needs minimum 2 nights (except 1-3 day trips can be single city)
- Include travel days between cities (bus/flight) as part of the itinerary
- Arrival on Day 1 to ${arrivalCity}
- Departure on Day ${duration} from ${departureCity}

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

AVAILABLE TRANSPORT OPTIONS (use exact names):
${transport.length > 0 ? transport.map(t => {
  return `  - ${t.name} (${t.type}) | ${t.from_location} → ${t.to_location} | $${parseFloat(t.base_price).toFixed(0)} | ${t.vehicle_type || 'Standard'} (${t.max_passengers || 'N/A'} pax)${t.distance_km ? ` | ${t.distance_km}km` : ''}`;
}).join('\n') : '  ℹ️ No transport services configured'}

AVAILABLE TOUR GUIDES (use exact names):
${guides.length > 0 ? guides.map(g => {
  const langs = g.languages ? JSON.parse(g.languages) : [];
  return `  - ${g.name} (${g.guide_type}) | ${langs.join(', ')} | ${g.specialization || 'General tours'} | Full day: $${parseFloat(g.price_per_day || 0).toFixed(0)}, Half day: $${parseFloat(g.price_half_day || 0).toFixed(0)}`;
}).join('\n') : '  ℹ️ No guides configured'}

AVAILABLE ADDITIONAL SERVICES (insurance, tickets, SIM cards, etc.):
${additionalServices.length > 0 ? additionalServices.map(s => {
  return `  - ${s.name} (${s.service_type}) | $${parseFloat(s.price || 0).toFixed(0)} ${s.price_type || 'per person'} | ${s.description || ''}`;
}).join('\n') : '  ℹ️ No additional services configured'}

PACKAGE REQUIREMENTS:
1. Accommodation: ${nights} night${nights > 1 ? 's' : ''} TOTAL (NOT ${duration} nights!)
2. Transfer IN on Day 1 (arrival to ${arrivalCity})
3. Transfer OUT on Day ${duration} (departure from ${departureCity})
4. Inter-city transfers (bus/flight) between cities as needed
5. Daily sightseeing activities/tours
${userSpecifiedCities ? `6. Follow the requested city order: ${citiesArray.join(' → ')}` : '6. Select cities intelligently based on interests and available inventory'}

⚠️ ABSOLUTE RULES - DO NOT VIOLATE:
- NEVER create placeholder text like "[Pick ONE hotel from X list]" or "[Choose activity]"
- ONLY use cities from the AVAILABLE CITIES list above (where we have hotels)
- ONLY create days in cities where hotels are actually listed
- Use ACTUAL hotel and activity names from the lists - NO generic placeholders
${userSpecifiedCities ? '' : '- YOU decide which cities to visit based on duration, interests, and available inventory'}

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
      "selectedRestaurants": [],
      "selectedTransport": [],
      "selectedGuide": null,
      "selectedServices": []
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
2. Use EXACT hotel/activity/restaurant names from city lists above - NO PLACEHOLDERS EVER
3. **MATCH HOTEL TO CITY**: If staying in Cappadocia, use ONLY Cappadocia hotels!
4. **ONLY USE CITIES FROM AVAILABLE CITIES LIST** - Do NOT create days in cities without hotels
${userSpecifiedCities ? `5. Follow the requested city order: ${citiesArray.join(' → ')}` : `5. YOU select which cities to visit from AVAILABLE CITIES based on duration, interests, and inventory`}
6. Distribute ${nights} nights across selected cities (minimum 2 nights per city if multi-city)
7. Include travel days between cities: "Day X - Transfer from City A to City B" with (B) meal code
8. Day 1 is arrival with (-) meals, final day is departure with (B) only
9. Write engaging narrative descriptions (like professional tour brochure)
10. Include "Overnight in [City]" at end of each day's description (except final day)
11. **NEVER EVER use bracket placeholders like "[Pick ONE hotel]" - this is STRICTLY FORBIDDEN**
12. Return ONLY JSON - no markdown, no explanations

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
          prompt: prompt // Send the full comprehensive prompt
        }),
        signal: AbortSignal.timeout(600000) // 10 minutes timeout for complex multi-city trips
      });

      if (!aiResponse.ok) {
        throw new Error(`Custom AI service error: ${aiResponse.status}`);
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

        // Add transport (if any selected for the day)
        if (day.selectedTransport && Array.isArray(day.selectedTransport)) {
          for (const transportName of day.selectedTransport) {
            const trans = transport.find(t => t.name === transportName);
            if (trans) {
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
                  uuidv4(), quoteDayId, 'transport', trans.id, 'transport',
                  trans.name, `${trans.type} - ${trans.vehicle_type || 'Standard'}`,
                  null, null, trans.duration_minutes ? trans.duration_minutes / 60 : null,
                  parseFloat(trans.base_price), parseFloat(trans.base_price), 1,
                  null, null, trans.from_location, false, null,
                  JSON.stringify([]), JSON.stringify([]), null, displayOrder++
                ]
              );
            }
          }
        }

        // Add guide (if selected for the day)
        if (day.selectedGuide) {
          const guide = guides.find(g => g.name === day.selectedGuide);
          if (guide) {
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
                uuidv4(), quoteDayId, 'guide', guide.id, 'guide',
                guide.name, `${guide.guide_type} - ${guide.specialization || 'General tour'}`,
                null, null, 8, // Full day = 8 hours
                parseFloat(guide.price_per_day || 0), parseFloat(guide.price_per_day || 0), 1,
                null, null, null, false, null,
                JSON.stringify(guide.languages ? JSON.parse(guide.languages) : []), JSON.stringify([]), null, displayOrder++
              ]
            );
          }
        }

        // Add additional services (if any selected for the day)
        if (day.selectedServices && Array.isArray(day.selectedServices)) {
          for (const serviceName of day.selectedServices) {
            const service = additionalServices.find(s => s.name === serviceName);
            if (service) {
              const isPerPerson = service.price_type === 'per_person';
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
                  uuidv4(), quoteDayId, 'additional_service', service.id, service.service_type,
                  service.name, service.description || '',
                  null, null, null,
                  parseFloat(service.price || 0),
                  isPerPerson ? parseFloat(service.price || 0) : parseFloat(service.price || 0) / numberOfTravelers,
                  isPerPerson ? numberOfTravelers : 1,
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
    await calculateAndSavePricingTiers(itineraryId, itineraryData, numberOfTravelers, operatorId);

    // Fetch the saved pricing tiers to return them
    const pricingTiers = await query<any>(`
      SELECT min_pax, max_pax,
        three_star_double, three_star_triple, three_star_single_supplement,
        four_star_double, four_star_triple, four_star_single_supplement,
        five_star_double, five_star_triple, five_star_single_supplement,
        currency
      FROM pricing_tiers
      WHERE itinerary_id = ?
      ORDER BY min_pax ASC
    `, [itineraryId]);

    return NextResponse.json({
      success: true,
      message: 'Itinerary generated successfully',
      itineraryId,
      itinerary: itineraryData,
      pricingTiers,
    });
  } catch (error: any) {
    console.error('Itinerary request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}
