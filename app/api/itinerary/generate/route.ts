import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

// Increase timeout for AI generation - complex itineraries can take 5-10 minutes
export const maxDuration = 600; // seconds (10 minutes)
export const dynamic = 'force-dynamic';

interface CityNight {
  city: string;
  nights: number;
}

// POST - Generate itinerary for customers (PUBLIC - no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      city_nights,
      start_date,
      adults,
      children,
      hotel_category,
      tour_type,
      special_requests
    } = body;

    // Validation
    if (!name || !email || !city_nights || city_nights.length === 0 || !start_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`🎯 Customer Itinerary Request:`, { name, email, city_nights, adults, children });

    // For now, use organization_id = 1 (you can change this to support multiple operators later)
    const orgId = 1;
    const season = 'Winter 2025-26';

    // Get cities list
    const cities = city_nights.map((cn: CityNight) => cn.city);
    const citiesPlaceholder = cities.map(() => '?').join(',');

    // Fetch hotels
    const [hotels]: any = await pool.query(
      `SELECT h.*, hp.double_room_bb as price_per_night
       FROM hotels h
       LEFT JOIN hotel_pricing hp ON h.id = hp.hotel_id
         AND hp.season_name = ?
         AND hp.status = 'active'
       WHERE h.organization_id = ?
         AND h.status = 'active'
         AND h.city IN (${citiesPlaceholder})
         AND h.star_rating = ?
       ORDER BY h.city, h.hotel_name`,
      [season, orgId, ...cities, hotel_category]
    );

    // Fetch tours - select appropriate price based on requested tour type (SIC or PRIVATE)
    const priceColumn = tour_type === 'SIC' ? 'tp.sic_price_2_pax' : 'tp.pvt_price_2_pax';
    const [tours]: any = await pool.query(
      `SELECT t.*,
         ${priceColumn} as price_per_person
       FROM tours t
       LEFT JOIN tour_pricing tp ON t.id = tp.tour_id
         AND tp.season_name = ?
         AND tp.status = 'active'
       WHERE t.organization_id = ?
         AND t.status = 'active'
         AND t.city IN (${citiesPlaceholder})
         AND ${priceColumn} > 0
       ORDER BY t.city, t.tour_name`,
      [season, orgId, ...cities]
    );

    // Fetch vehicles
    const [vehicles]: any = await pool.query(
      `SELECT v.*, vp.price_per_day
       FROM vehicles v
       LEFT JOIN vehicle_pricing vp ON v.id = vp.vehicle_id
         AND vp.season_name = ?
         AND vp.status = 'active'
       WHERE v.organization_id = ?
         AND v.status = 'active'
         AND v.city IN (${citiesPlaceholder})
         AND v.max_capacity >= ?
       ORDER BY v.city, v.max_capacity`,
      [season, orgId, ...cities, (adults + children)]
    );

    // Fetch airport transfers for all cities
    const [airportTransfers]: any = await pool.query(
      `SELECT it.*, v.vehicle_type, v.max_capacity
       FROM intercity_transfers it
       JOIN vehicles v ON it.vehicle_id = v.id
       WHERE it.organization_id = ?
         AND it.status = 'active'
         AND it.season_name = ?
         AND (
           (it.from_city IN (${citiesPlaceholder}) AND it.to_city LIKE '%Airport')
           OR (it.to_city IN (${citiesPlaceholder}) AND it.from_city LIKE '%Airport')
         )
         AND v.max_capacity >= ?
       ORDER BY it.from_city, it.to_city`,
      [orgId, season, ...cities, ...cities, (adults + children)]
    );

    console.log(`📊 Found: ${hotels.length} hotels, ${tours.length} tours, ${vehicles.length} vehicles, ${airportTransfers.length} airport transfers`);

    if (hotels.length === 0) {
      return NextResponse.json({
        error: `No ${hotel_category}-star hotels found in ${cities.join(', ')}. Please try different cities or hotel category.`
      }, { status: 400 });
    }

    // Initialize Claude AI
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    // Build the AI prompt
    const destination = cities.join(' & ');
    const prompt = buildAIPrompt({
      customer_name: name,
      destination,
      city_nights,
      start_date,
      adults,
      children,
      hotel_category,
      tour_type,
      special_requests,
      hotels,
      tours,
      vehicles,
      airportTransfers
    });

    console.log('🤖 Calling Claude AI...');

    // Call Claude AI
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const aiResponse = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('✅ Claude AI responded');

    // Parse AI response
    let itinerary;
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) ||
                       aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      itinerary = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', aiResponse);
      return NextResponse.json({
        error: 'Failed to generate itinerary. Please try again.',
        details: aiResponse
      }, { status: 500 });
    }

    console.log('📝 Itinerary generated with', itinerary.days?.length, 'days');

    // Calculate pricing
    const pricing_summary = calculatePricing(itinerary, adults, children);
    itinerary.pricing_summary = pricing_summary;

    const total_price = pricing_summary.total;
    const price_per_person = (adults + children) > 0 ? total_price / (adults + children) : 0;

    // Calculate end date
    const totalNights = city_nights.reduce((sum: number, cn: CityNight) => sum + cn.nights, 0);
    const startDate = new Date(start_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + totalNights);

    // Store in database (customer_itineraries table)
    const [result]: any = await pool.query(
      `INSERT INTO customer_itineraries (
        organization_id,
        customer_name,
        customer_email,
        customer_phone,
        destination,
        city_nights,
        start_date,
        end_date,
        adults,
        children,
        hotel_category,
        tour_type,
        special_requests,
        itinerary_data,
        total_price,
        price_per_person,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        orgId,
        name,
        email,
        phone || null,
        destination,
        JSON.stringify(city_nights),
        start_date,
        endDate.toISOString().split('T')[0],
        adults,
        children,
        hotel_category,
        tour_type,
        special_requests || null,
        JSON.stringify(itinerary),
        total_price,
        price_per_person
      ]
    );

    const itineraryId = result.insertId;

    console.log(`✨ Customer itinerary created: ${itineraryId}`);

    return NextResponse.json({
      success: true,
      itinerary_id: itineraryId,
      total_price,
      price_per_person,
      message: 'Your personalized itinerary is ready!'
    });

  } catch (error: any) {
    console.error('Error generating customer itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary', details: error.message },
      { status: 500 }
    );
  }
}

function buildAIPrompt(data: any): string {
  const {
    customer_name,
    destination,
    city_nights,
    start_date,
    adults,
    children,
    hotel_category,
    tour_type,
    special_requests,
    hotels,
    tours,
    vehicles,
    airportTransfers
  } = data;

  const totalNights = city_nights.reduce((sum: number, cn: CityNight) => sum + cn.nights, 0);
  const totalDays = totalNights + 1;

  return `You are an expert travel itinerary planner creating itineraries for a professional tour operator. Your itineraries will be presented to customers as official travel packages, so quality and professionalism are critical.

**YOUR MISSION:**
Create a perfect, balanced itinerary that customers will love and want to book immediately. Select the BEST combination of hotels, tours, and transfers from the available options.

**Customer Request:**
- Customer: ${customer_name}
- Destination: ${destination}
- Cities: ${city_nights.map((cn: CityNight) => `${cn.city} (${cn.nights} nights)`).join(', ')}
- Duration: ${totalNights} nights / ${totalDays} days
- Start Date: ${start_date}
- Travelers: ${adults} adults${children > 0 ? `, ${children} children` : ''}
- Hotel Category: ${hotel_category}-star
- Tour Type: ${tour_type}
${special_requests ? `- Special Requests: ${special_requests}` : ''}

**Available Hotels (${hotel_category}-star):**
${JSON.stringify(hotels.map((h: any) => ({
  id: h.id,
  name: h.hotel_name,
  city: h.city,
  star_rating: h.star_rating,
  price_per_night: h.price_per_night,
  notes: h.notes
})), null, 2)}

**Available Tours:**
${JSON.stringify(tours.map((t: any) => ({
  id: t.id,
  name: t.tour_name,
  city: t.city,
  duration_hours: t.duration_hours,
  duration_type: t.duration_type,
  duration_days: t.duration_days,
  description: t.description,
  price_per_person: t.price_per_person
})), null, 2)}

**Available Vehicles:**
${JSON.stringify(vehicles.map((v: any) => ({
  id: v.id,
  vehicle_type: v.vehicle_type,
  city: v.city,
  capacity: v.max_capacity,
  price_per_day: v.price_per_day
})), null, 2)}

**Available Airport Transfers:**
${JSON.stringify(airportTransfers, null, 2)}

**Task:**
Create a complete day-by-day itinerary selecting appropriate hotels, tours, and transfers from the available options above.

**Selection Guidelines:**
1. Select ONE hotel per city for all nights in that city
2. Select diverse, interesting tours - typically 1-2 tours per day
3. Include airport transfers (arrival and departure)
4. For travel days between cities, include appropriate transfers
5. Balance the itinerary - don't overload days
6. Consider logical flow and timing
7. First day: Airport transfer to hotel, rest/leisure
8. Last day: Hotel to airport transfer only
9. Avoid repetitive tours
10. Select tours that showcase the best of each city

**IMPORTANT - Read this training example first:**

Here is an example of a professional itinerary format:

"Day 1 - Fly / Istanbul - Bosphorus Cruise Dinner (D)

Arrive to Istanbul or SAW airport in Istanbul. Arrival transfer to the hotel and check-in. The rest of the day is yours. In the evening, you will pick up from the hotel and transfer to Bosphorus Cruise Dinner. (Cruise is not private) Enjoy delicious gourmet foods while you dance with the panaromic view of the Bosphorus that separates the two continents Europe and Asia. Enjoy as you cruise The Bosphorus and see historical places like Dolmabahce Palace, Bosphorus Bridge, Ortakoy, Rumeli Fortress, Fatih Bridge, Beylerbeyi Palace, Maiden's Tower and also Istanbul's very famous night clubs as you wine and dine the night away. After the tour, transfer back to hotel. Overnight in Istanbul."

**Your task:**
Create BOTH a narrative story AND items list for each day.

**Output Format:**
Return ONLY valid JSON (no markdown) in this structure:

{
  "days": [
    {
      "day_number": 1,
      "date": "YYYY-MM-DD",
      "location": "City Name",
      "title": "Day 1 - Fly / City - Activity (B/L/D)",
      "narrative": "A beautifully written paragraph describing the entire day's experience. Write in professional travel itinerary style, describing what guests will experience, see, and do. Include details about transfers, activities, sights, and overnight location. Write 3-5 sentences that paint a vivid picture of the day.",
      "meals": "(B)" or "(B,L)" or "(B,D)" etc.,
      "items": [
        {
          "type": "vehicle",
          "id": "vehicle_id_a2h",
          "name": "Vehicle Name - Airport to Hotel",
          "quantity": 1,
          "price_per_unit": price,
          "total_price": price,
          "location": "City",
          "notes": ""
        },
        {
          "type": "hotel",
          "id": hotel_id,
          "name": "Hotel Name",
          "quantity": 1,
          "price_per_unit": price_per_night,
          "total_price": price_per_night,
          "nights": 1,
          "category": "X-star",
          "location": "City",
          "notes": ""
        }
      ]
    }
  ]
}

**Important - Items Array:**
- Use actual IDs from the provided data
- For airport transfers: Use the "Available Airport Transfers" data above. Find the matching transfer by from_city/to_city and use its id and price_oneway
  * Arrival day: Find transfer where from_city = "{City} Airport" and to_city = "{City}"
  * Departure day: Find transfer where from_city = "{City}" and to_city = "{City} Airport"
  * Reference as type "transfer" with the transfer id and price_oneway as price
- Calculate dates correctly starting from ${start_date}
- Hotels: quantity = nights in that city, multiply price by number of nights and people
- Tours: quantity = number of people (${adults + children})
- Vehicles: quantity = 1 (fixed price)
- Each day must have a location matching one of the cities
- Final departure day (Day ${totalDays}): Only hotel checkout and airport transfer, no tours

**Important - Narrative Writing:**
- Write narratives in professional travel itinerary style like the example
- Use engaging, descriptive language that excites guests about their journey
- Paint a vivid picture of what guests will experience and see
- Mention transfers naturally (arrival transfer, hotel to airport, etc.)
- Include specific tour details and highlight names of famous sites/attractions
- End each day with "Overnight in [City]"
- Use present/future tense and second person ("you will...", "Enjoy...")
- Write 3-5 sentences per day that flow naturally
- **Day 1**: Always start with "Arrive to [airport]. Arrival transfer to the hotel and check-in. The rest of the day is yours." Then add any evening activities if included
- **Middle days**: Focus on tours and activities - describe what guests will see and experience at each location
- **Last day**: Always end with "After breakfast, check out from the hotel. Transfer to [airport] for your departure. Have a safe trip!"
- For tour days: Use tour descriptions to write compelling narratives about famous sites
- Make it sound exciting and professional - this is what sells the trip!

**Selection Strategy:**
- Choose the MOST ATTRACTIVE tours that showcase iconic sights
- Prefer full-day tours over half-day tours when possible
- Don't pack too many tours in one day (max 2 tours/day)
- Balance activity with rest time
- Select hotels with good ratings and locations
- Ensure logical flow between activities
- Make Day 1 lighter (arrival day) - just arrival + optional light evening activity
- Make last day simple - just breakfast and departure

**CRITICAL - Pricing Instructions:**
- Each item MUST have accurate price_per_unit from the provided data
- Hotels: Use price_per_night, multiply by nights and total people (${adults + children})
- Tours: Use price_per_person, multiply by total people (${adults + children})
- Vehicles: Use the fixed transfer price (no multiplication)
- Double-check all calculations - pricing accuracy is CRITICAL

Generate the complete itinerary now:`;
}

function calculatePricing(itinerary: any, adults: number, children: number): any {
  const totalPeople = adults + children;

  let hotels_total = 0;
  let tours_total = 0;
  let vehicles_total = 0;
  let guides_total = 0;
  let entrance_fees_total = 0;
  let meals_total = 0;
  let extras_total = 0;

  if (itinerary.days) {
    itinerary.days.forEach((day: any) => {
      if (day.items) {
        day.items.forEach((item: any) => {
          const price = parseFloat(item.price_per_unit) || 0;
          const quantity = parseInt(item.quantity) || 1;

          let total = 0;

          if (item.type === 'hotel') {
            total = price * quantity * totalPeople;
            hotels_total += total;
          } else if (item.type === 'tour' || item.type === 'entrance_fee' || item.type === 'meal') {
            total = price * quantity;
            if (item.type === 'tour') tours_total += total;
            else if (item.type === 'entrance_fee') entrance_fees_total += total;
            else meals_total += total;
          } else if (item.type === 'vehicle' || item.type === 'guide') {
            total = price * quantity;
            if (item.type === 'vehicle') vehicles_total += total;
            else guides_total += total;
          } else if (item.type === 'extra') {
            total = price * quantity;
            extras_total += total;
          }

          item.total_price = total;
        });
      }
    });
  }

  const subtotal = hotels_total + tours_total + vehicles_total + guides_total +
                   entrance_fees_total + meals_total + extras_total;

  return {
    hotels_total,
    tours_total,
    vehicles_total,
    guides_total,
    entrance_fees_total,
    meals_total,
    extras_total,
    subtotal,
    discount: 0,
    total: subtotal
  };
}
