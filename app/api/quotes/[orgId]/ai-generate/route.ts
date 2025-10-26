import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import Anthropic from '@anthropic-ai/sdk';

// C6: Remove fallback - JWT_SECRET is required
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface CityNight {
  city: string;
  nights: number;
}

// POST - Generate complete itinerary with AI
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const {
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
      quote_preferences
    } = body;

    // Validation
    if (!customer_name || !customer_email || !city_nights || city_nights.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`🎯 AI Generation Request:`, {
      destination,
      city_nights,
      adults,
      children,
      hotel_category,
      tour_type
    });

    // Fetch all available pricing data from database
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

    // Fetch tours (including inclusions field)
    // Filter by price availability instead of tour_type column
    const tourPriceColumn = tour_type === 'SIC' ? 'tp.sic_price_2_pax' : 'tp.pvt_price_2_pax';
    const [tours]: any = await pool.query(
      `SELECT t.*,
         ${tourPriceColumn} as price_per_person,
         t.inclusions
       FROM tours t
       LEFT JOIN tour_pricing tp ON t.id = tp.tour_id
         AND tp.season_name = ?
         AND tp.status = 'active'
       WHERE t.organization_id = ?
         AND t.status = 'active'
         AND t.city IN (${citiesPlaceholder})
         AND ${tourPriceColumn} > 0
       ORDER BY t.city, t.tour_name`,
      [season, orgId, ...cities]
    );

    // Fetch vehicles (we need transfers between cities)
    const [vehicles]: any = await pool.query(
      `SELECT v.*, vp.price_per_day, vp.price_half_day
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

    // Fetch airport transfers from intercity_transfers table
    const [airportTransfers]: any = await pool.query(
      `SELECT it.*, v.vehicle_type, v.max_capacity
       FROM intercity_transfers it
       JOIN vehicles v ON it.vehicle_id = v.id
       WHERE it.organization_id = ?
         AND it.status = 'active'
         AND it.season_name = ?
         AND (it.from_city LIKE '%Airport%' OR it.to_city LIKE '%Airport%')
         AND v.max_capacity >= ?
       ORDER BY it.from_city, it.to_city`,
      [orgId, season, (adults + children)]
    );

    // Fetch guides (for PRIVATE tour cost comparison)
    const [guides]: any = await pool.query(
      `SELECT g.*, gp.full_day_price, gp.half_day_price
       FROM guides g
       LEFT JOIN guide_pricing gp ON g.id = gp.guide_id
         AND gp.season_name = ?
         AND gp.status = 'active'
       WHERE g.organization_id = ?
         AND g.status = 'active'
         AND g.city IN (${citiesPlaceholder})
       ORDER BY g.city, g.language`,
      [season, orgId, ...cities]
    );

    // Fetch entrance fees (for PRIVATE tour cost comparison)
    const [entranceFees]: any = await pool.query(
      `SELECT e.*, ep.adult_price, ep.child_price
       FROM entrance_fees e
       LEFT JOIN entrance_fee_pricing ep ON e.id = ep.entrance_fee_id
         AND ep.season_name = ?
         AND ep.status = 'active'
       WHERE e.organization_id = ?
         AND e.status = 'active'
         AND e.city IN (${citiesPlaceholder})
       ORDER BY e.city, e.site_name`,
      [season, orgId, ...cities]
    );

    console.log(`📊 Found: ${hotels.length} hotels, ${tours.length} tours, ${vehicles.length} vehicles, ${airportTransfers.length} airport transfers, ${guides.length} guides, ${entranceFees.length} entrance fees`);

    // Apply quote preferences if provided (locked hotel/tour/transfer selections)
    let filteredHotels = hotels;
    let filteredTours = tours;
    let filteredAirportTransfers = airportTransfers;

    if (quote_preferences) {
      console.log('🔒 Applying locked preferences:', quote_preferences);

      // Filter hotels by locked selections (city -> hotel_id mapping)
      if (quote_preferences.locked_hotels) {
        const lockedHotelIds = Object.values(quote_preferences.locked_hotels);
        filteredHotels = hotels.filter((h: any) => lockedHotelIds.includes(h.id));
        console.log(`🏨 Locked hotels: ${filteredHotels.length} of ${hotels.length}`);
      }

      // Filter tours by locked selections (array of tour IDs)
      if (quote_preferences.locked_tours && quote_preferences.locked_tours.length > 0) {
        filteredTours = tours.filter((t: any) => quote_preferences.locked_tours.includes(t.id));
        console.log(`🎫 Locked tours: ${filteredTours.length} of ${tours.length}`);
      }

      // Filter airport transfers by locked selections
      if (quote_preferences.locked_transfers) {
        const lockedTransferIds = Object.values(quote_preferences.locked_transfers);
        filteredAirportTransfers = airportTransfers.filter((at: any) => lockedTransferIds.includes(at.id));
        console.log(`✈️ Locked transfers: ${filteredAirportTransfers.length} of ${airportTransfers.length}`);
      }
    }

    if (filteredHotels.length === 0) {
      return NextResponse.json({
        error: `No ${hotel_category}-star hotels found in ${cities.join(', ')}. Please adjust your selection.`
      }, { status: 400 });
    }

    // Initialize Claude AI
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    // Build the prompt (use filtered data if preferences are locked)
    const prompt = buildAIPrompt({
      customer_name,
      destination,
      city_nights,
      start_date,
      adults,
      children,
      hotel_category,
      tour_type,
      special_requests,
      hotels: filteredHotels,
      tours: filteredTours,
      vehicles,
      airportTransfers: filteredAirportTransfers,
      guides,
      entranceFees,
      quote_preferences
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

    // Parse AI response (should be JSON)
    let itinerary;
    try {
      // Extract JSON from response (Claude might wrap it in markdown)
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) ||
                       aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      itinerary = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', aiResponse);
      return NextResponse.json({
        error: 'Failed to parse AI response',
        details: aiResponse
      }, { status: 500 });
    }

    console.log('📝 Itinerary generated with', itinerary.days?.length, 'days');

    // Calculate pricing
    const pricing_summary = calculatePricing(itinerary, adults, children);
    itinerary.pricing_summary = pricing_summary;

    const total_price = pricing_summary.total;

    // Calculate price per person
    const totalPeople = adults + children;
    const price_per_person = totalPeople > 0 ? total_price / totalPeople : 0;

    // Extract hotel IDs from itinerary for fetching full details
    const hotelIds: number[] = [];
    if (itinerary.days) {
      itinerary.days.forEach((day: any) => {
        if (day.items) {
          day.items.forEach((item: any) => {
            if (item.type === 'hotel' && item.hotel_id && !hotelIds.includes(item.hotel_id)) {
              hotelIds.push(item.hotel_id);
            }
          });
        }
      });
    }

    // Fetch hotel details
    let hotelDetails: any[] = [];
    if (hotelIds.length > 0) {
      const hotelPlaceholders = hotelIds.map(() => '?').join(',');
      const [hotelData]: any = await pool.query(
        `SELECT
          h.id,
          h.hotel_name,
          h.city,
          h.star_rating,
          h.rating as google_rating,
          h.photo_url_1 as image_url,
          h.latitude,
          h.longitude,
          h.google_place_id
        FROM hotels h
        WHERE h.id IN (${hotelPlaceholders})
        ORDER BY h.city`,
        hotelIds
      );
      hotelDetails = hotelData;
    }

    // Extract tour IDs from itinerary
    const tourIds: number[] = [];
    if (itinerary.days) {
      itinerary.days.forEach((day: any) => {
        if (day.items) {
          day.items.forEach((item: any) => {
            if (item.type === 'tour' && item.tour_id && !tourIds.includes(item.tour_id)) {
              tourIds.push(item.tour_id);
            }
          });
        }
      });
    }

    // Fetch tour details
    let tourDetails: any[] = [];
    if (tourIds.length > 0) {
      const tourPlaceholders = tourIds.map(() => '?').join(',');
      const [tourData]: any = await pool.query(
        `SELECT
          t.id,
          t.tour_name,
          t.city,
          t.description,
          t.photo_url_1,
          t.photo_url_2,
          t.photo_url_3,
          t.google_place_id
        FROM tours t
        WHERE t.id IN (${tourPlaceholders})
        ORDER BY t.city`,
        tourIds
      );
      tourDetails = tourData;
    }

    // Insert customer itinerary directly (source = 'manual' for operator-created)
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
        status,
        source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'manual')`,
      [
        orgId,
        customer_name,
        customer_email,
        customer_phone || null,
        destination,
        JSON.stringify(city_nights),
        start_date,
        end_date,
        adults,
        children,
        hotel_category,
        tour_type,
        special_requests || null,
        JSON.stringify({
          days: itinerary.days,
          hotels_used: hotelDetails,
          tours_visited: tourDetails
        }),
        total_price,
        price_per_person
      ]
    );

    const itineraryId = result.insertId;

    // Fetch the UUID that was auto-generated
    const [newItinerary]: any = await pool.query(
      'SELECT uuid FROM customer_itineraries WHERE id = ?',
      [itineraryId]
    );

    const uuid = newItinerary[0]?.uuid;

    console.log(`✨ Customer itinerary created: ID ${itineraryId}, UUID ${uuid} (source: manual)`);

    return NextResponse.json({
      success: true,
      itinerary_id: itineraryId,
      uuid: uuid,
      total_price,
      message: 'AI-generated itinerary created successfully!'
    });

  } catch (error: any) {
    console.error('Error generating AI itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI itinerary', details: error.message },
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
    airportTransfers,
    guides,
    entranceFees,
    quote_preferences
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
${quote_preferences ? `\n🔒 **LOCKED PREFERENCES:**
${quote_preferences.locked_hotels ? `- MUST use these specific hotels ONLY: ${Object.keys(quote_preferences.locked_hotels).map(city => `${city} (ID: ${quote_preferences.locked_hotels[city]})`).join(', ')}` : ''}
${quote_preferences.locked_tours && quote_preferences.locked_tours.length > 0 ? `- MUST use these specific tours ONLY: Tour IDs ${quote_preferences.locked_tours.join(', ')}` : ''}
${quote_preferences.locked_transfers ? `- MUST use these specific transfers ONLY: Transfer IDs ${Object.values(quote_preferences.locked_transfers).join(', ')}` : ''}
${quote_preferences.customization_notes ? `- Notes: ${quote_preferences.customization_notes}` : ''}

⚠️ CRITICAL: The available options below have been PRE-FILTERED to ONLY include the locked items. You MUST use these exact items - DO NOT try to select different ones!
` : ''}

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
  inclusions: t.inclusions,
  price_per_person: t.price_per_person
})), null, 2)}

**Available Vehicles (for day rentals):**
${JSON.stringify(vehicles.map((v: any) => ({
  id: v.id,
  vehicle_type: v.vehicle_type,
  city: v.city,
  capacity: v.max_capacity,
  price_per_day: v.price_per_day,
  price_half_day: v.price_half_day
})), null, 2)}

**Available Guides:**
${JSON.stringify(guides.map((g: any) => ({
  id: g.id,
  language: g.language,
  city: g.city,
  full_day_price: g.full_day_price,
  half_day_price: g.half_day_price
})), null, 2)}

**Available Entrance Fees:**
${JSON.stringify(entranceFees.map((e: any) => ({
  id: e.id,
  site_name: e.site_name,
  city: e.city,
  adult_price: e.adult_price,
  child_price: e.child_price
})), null, 2)}

**Available Airport Transfers:**
${JSON.stringify(airportTransfers.map((at: any) => ({
  id: at.id,
  vehicle_id: at.vehicle_id,
  vehicle_type: at.vehicle_type,
  from_city: at.from_city,
  to_city: at.to_city,
  price_oneway: at.price_oneway,
  price_roundtrip: at.price_roundtrip,
  capacity: at.max_capacity
})), null, 2)}

${tour_type === 'PRIVATE' ? `
🚨 **CRITICAL BUSINESS LOGIC FOR PRIVATE TOURS** 🚨

When Tour Type = PRIVATE, you MUST compare TWO options for each tour day and choose the CHEAPER option:

**Option A: Use the Private Tour Package**
- Use the tour from "Available Tours" with its price_per_person
- Add items: type: "tour", tour_id: X, price_per_person (already includes vehicle, guide, entrance fees)

**Option B: Build it Manually (DIY)**
- Instead of using the tour package, build it yourself:
  1. Add type: "vehicle", vehicle_id: X, price_per_day (1 vehicle for the group)
  2. Add type: "guide", guide_id: X, full_day_price or half_day_price (1 guide for the group)
  3. Add type: "entrance_fee", entrance_fee_id: X, adult_price * ${adults} + child_price * ${children} (for EACH site in that city)

**How to Decide:**
1. Calculate Option A cost: tour.price_per_person * ${adults + children}
2. Calculate Option B cost: vehicle.price_per_day + guide.full_day_price + (entrance fees for all sites)
3. Choose whichever is CHEAPER for the customer

**Example Calculation:**
- Option A: Full Day Istanbul Tour = $280 per person * 2 = $560
- Option B: Vehicle ($50) + Guide ($80) + Entrance Fees (Topkapi $30, Hagia Sophia $25, Blue Mosque $0) = $185
- ✅ Choose Option B (save $375!)

**IMPORTANT:**
- You MUST do this comparison for EVERY tour day
- If Option B is cheaper, DO NOT add the tour item. Instead add vehicle + guide + entrance_fees items
- If Option A is cheaper, use the tour package as normal
- This logic ONLY applies when Tour Type = PRIVATE
` : ''}

**Task:**
Create a complete day-by-day itinerary selecting appropriate hotels, ${tour_type === 'PRIVATE' ? 'tours OR (vehicle + guide + entrance fees)' : 'tours'}, and transfers from the available options above.

**Selection Guidelines:**
1. Select ONE hotel per city for all nights in that city
2. 🚨 **MAXIMUM ONE TOUR PER DAY** - NEVER add multiple tours on the same day
3. 🚨 **FULL-DAY tour = that's the ONLY tour for that day** (no half-day tours on same day)
4. 🚨 **HALF-DAY tour = that's the ONLY tour for that day** (no other tours on same day)
5. 🚨 **MANDATORY AIRPORT TRANSFERS**:
   - Day 1: MUST include airport transfer IN (from Airport to Hotel in first city)
   - Last day: MUST include airport transfer OUT (from Hotel to Airport in last city)
   - Use type: "transfer", transfer_id from the data, price_per_unit: price_oneway
6. 🚨 **INTERCITY FLIGHTS - CRITICAL**:
   - When changing cities by flight, you need TWO airport transfers on the same day:
     a) Transfer OUT: Hotel to Airport in current city (departure)
     b) Transfer IN: Airport to Hotel in new city (arrival)
   - Example: Day 3 flying Istanbul → Antalya needs:
     * Transfer 1: Hotel to Istanbul Airport
     * Transfer 2: Antalya Airport to Hotel
   - BOTH transfers must be added to the same day's items
   - Each transfer uses type: "transfer", transfer_id, price_per_unit: price_oneway
7. For ground travel between cities (not flights), use Available Vehicles for intercity transfers
8. Balance the itinerary - don't overload days
9. Consider logical flow and timing
10. **CRITICAL - Check Tour Inclusions**: Always read the "inclusions" field for each tour. If lunch is included in the tour, add "L" to the meals field for that day. If dinner is included, add "D" to meals. Format: "(B,L)" if breakfast and lunch, "(B,D)" if breakfast and dinner, "(B,L,D)" if all three meals.

🚨 **AVOID DUPLICATE EXPERIENCES - Critical Rules:**
   - ❌ If you include "Bosphorus Cruise" tour, DO NOT add "Dinner Cruise" or "Turkish Night" anywhere in itinerary
   - ❌ If you include "Dinner Cruise" or "Turkish Night", DO NOT add "Bosphorus Cruise" anywhere in itinerary
   - ❌ DO NOT give similar tours on different days (e.g., two mosque tours, two palace tours, two cruises)
   - ❌ DO NOT combine Full Day Tour + Half Day Tour on the same day
   - ✅ Vary the experiences - mix historical tours, nature tours, cultural experiences
   - ✅ Select tours that showcase the best of each city (but ONLY ONE per day)

**IMPORTANT - Read this training example first:**

Here is an example of a professional itinerary format:

"Day 1 - Fly / Istanbul - Bosphorus Cruise Dinner

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
      "title": "Day 1 - Fly / City - Activity",
      "narrative": "A beautifully written paragraph describing the entire day's experience. Write in professional travel itinerary style, describing what guests will experience, see, and do. Include details about transfers, activities, sights, and overnight location. Write 3-5 sentences that paint a vivid picture of the day.",
      "meals": "(B)" or "(B,L)" or "(B,D)" etc. - IMPORTANT: Check tour inclusions! If any tour includes lunch (check the inclusions field), add "L" to meals. If tour includes dinner, add "D" to meals. All days with hotels automatically include "B" for breakfast.,
      "items": [
        {
          "type": "transfer",
          "transfer_id": transfer_id_from_airport_transfers,
          "name": "Airport Transfer - City Airport to Hotel (Vehicle Type)",
          "quantity": 1,
          "price_per_unit": price_oneway,
          "total_price": price_oneway,
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
- For airport transfers: MUST use type: "transfer", transfer_id: (id from "Available Airport Transfers"), price_per_unit: price_oneway
  Example: {"type": "transfer", "transfer_id": 90, "name": "Airport Transfer - Istanbul Airport to Hotel (Vito)", "quantity": 1, "price_per_unit": 70, "total_price": 70}
- For intercity transfers: Use vehicle_id from "Available Vehicles" with appropriate naming
- For tours: Use type: "tour", tour_id: (id from tours), price_per_unit: price_per_person
- For hotels: Use type: "hotel", hotel_id: (id from hotels), price_per_unit: price_per_night
${tour_type === 'PRIVATE' ? `- For vehicles (PRIVATE tours): Use type: "vehicle", vehicle_id: (id from "Available Vehicles"), price_per_unit: price_per_day, quantity: 1, total_price: price_per_day
  Example: {"type": "vehicle", "vehicle_id": 15, "name": "Minivan - Day Rental", "quantity": 1, "price_per_unit": 50, "total_price": 50}
- For guides (PRIVATE tours): Use type: "guide", guide_id: (id from "Available Guides"), price_per_unit: full_day_price or half_day_price, quantity: 1, total_price: price
  Example: {"type": "guide", "guide_id": 8, "name": "English Guide", "quantity": 1, "price_per_unit": 80, "total_price": 80}
- For entrance fees (PRIVATE tours): Use type: "entrance_fee", entrance_fee_id: (id from "Available Entrance Fees"), price_per_unit: adult_price, quantity: (${adults} adults + ${children} children)
  Example: {"type": "entrance_fee", "entrance_fee_id": 12, "name": "Topkapi Palace", "quantity": ${adults + children}, "price_per_unit": 30, "total_price": ${(adults + children) * 30}}` : ''}
- Calculate dates correctly starting from ${start_date}
- Hotels: quantity = 1 (represents 1 night). Add a hotel item for EACH night the guest stays. Price is per person per night.
- Tours: quantity = number of people (${adults + children})
- Airport Transfers: quantity = 1 (use price_oneway)
${tour_type === 'PRIVATE' ? `- Vehicles (day rental): quantity = 1 (1 vehicle for the entire group)
- Guides: quantity = 1 (1 guide for the entire group)
- Entrance Fees: quantity = ${adults + children} (total number of people)` : ''}
- Each day must have a location matching one of the cities
- Final departure day (Day ${totalDays}): Only hotel checkout and airport transfer, no tours

**Important - Titles:**
- 🚨 **CRITICAL**: DO NOT include meal notation (B/L/D) in the title
- ❌ WRONG: "Day 2 - Imperial Istanbul Discovery (B/L)"
- ✅ CORRECT: "Day 2 - Imperial Istanbul Discovery"
- Meals are shown separately in the "meals" field - DO NOT duplicate them in the title

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
            // Hotels: price per night per person × nights × people
            total = price * quantity * totalPeople;
            hotels_total += total;
          } else if (item.type === 'tour' || item.type === 'entrance_fee' || item.type === 'meal') {
            // Tours/entrance/meals: price per person × number of people
            total = price * quantity;
            if (item.type === 'tour') tours_total += total;
            else if (item.type === 'entrance_fee') entrance_fees_total += total;
            else meals_total += total;
          } else if (item.type === 'vehicle' || item.type === 'transfer' || item.type === 'guide') {
            // Vehicles/transfers/guides: fixed price
            total = price * quantity;
            if (item.type === 'vehicle' || item.type === 'transfer') vehicles_total += total;
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
