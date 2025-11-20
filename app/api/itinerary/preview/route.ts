import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';
import {
  validateItineraryRequest,
  validateCustomerInfo,
  checkRateLimit,
  getClientIp,
  sanitizeText
} from '@/lib/security';
import { getOrgFromSubdomain } from '@/lib/subdomain-resolver';

// Increase timeout for AI generation - complex itineraries can take 5-10 minutes
export const maxDuration = 600; // seconds (10 minutes)
export const dynamic = 'force-dynamic';

interface CityNight {
  city: string;
  nights: number;
}

// POST - Generate itinerary with customer contact info
export async function POST(request: NextRequest) {
  try {
    // C7: Rate limiting - 5 requests per IP per hour (expensive AI calls)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`preview:${clientIp}`, 5, 60 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          resetTime: new Date(rateLimit.resetTime).toISOString()
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString()
          }
        }
      );
    }

    const body = await request.json();
    const {
      organization_id,
      city_nights,
      country_ids,
      total_nights,
      start_date,
      adults,
      children,
      hotel_category,
      tour_type,
      special_requests,
      customer_name,
      customer_email,
      customer_phone
    } = body;

    // C8-C12: Comprehensive input validation
    const itineraryValidation = validateItineraryRequest({
      city_nights,
      country_ids,
      total_nights,
      start_date,
      adults,
      children: children || 0,
      hotel_category,
      tour_type,
      special_requests
    });

    if (!itineraryValidation.valid) {
      return NextResponse.json({
        error: 'Invalid request',
        details: itineraryValidation.errors
      }, { status: 400 });
    }

    const customerValidation = validateCustomerInfo({
      customer_name,
      customer_email,
      customer_phone
    });

    if (!customerValidation.valid) {
      return NextResponse.json({
        error: 'Invalid customer information',
        details: customerValidation.errors
      }, { status: 400 });
    }

    console.log(`🎯 Preview Request from ${customer_name}:`, { city_nights, country_ids, total_nights, adults, children });

    // Get organization ID from multiple sources
    let orgId: number;

    if (organization_id) {
      // 1. Use org ID from request body (highest priority)
      orgId = organization_id;
      console.log(`📍 Using organization ID from request: ${orgId}`);
    } else {
      // 2. Try to detect from hostname using database
      const hostname = request.headers.get('host') || '';
      const orgResolution = await getOrgFromSubdomain(hostname);

      if (orgResolution) {
        orgId = orgResolution.orgId;
        console.log(`🌐 Subdomain resolved: ${hostname} → Org ${orgId} (${orgResolution.orgName})`);
      } else {
        // 3. Fallback to default
        orgId = parseInt(process.env.DEFAULT_ORG_ID || '5');
        console.log(`🌐 No subdomain match for ${hostname}, using default org ${orgId}`);
      }
    }

    console.log(`📍 Using organization ID: ${orgId}`);
    const season = 'Winter 2025-26';

    // Convert new format (country_ids + total_nights) to old format (city_nights)
    let finalCityNights: CityNight[] = city_nights || [];

    if (!city_nights && country_ids && total_nights) {
      console.log(`🌍 AI-powered trip: ${total_nights} nights across ${country_ids.length} countries`);

      // Distribute nights across countries first
      const nightsPerCountry = Math.floor(total_nights / country_ids.length);
      const remainingNights = total_nights % country_ids.length;

      // Get top cities from EACH country
      finalCityNights = [];

      for (let i = 0; i < country_ids.length; i++) {
        const countryId = country_ids[i];
        const nightsForThisCountry = nightsPerCountry + (i < remainingNights ? 1 : 0);

        console.log(`🔍 Processing country ${countryId}: ${nightsForThisCountry} nights allocated`);

        if (nightsForThisCountry === 0) continue;

        // Get most popular cities in this country
        const [citiesInCountry]: any = await pool.query(
          `SELECT DISTINCT city, country_id,
           (SELECT country_name FROM countries WHERE id = hotels.country_id) as country_name,
           COUNT(*) as hotel_count
           FROM hotels
           WHERE organization_id = ?
             AND status = 'active'
             AND country_id = ?
           GROUP BY city, country_id
           ORDER BY hotel_count DESC
           LIMIT 2`,
          [orgId, countryId]
        );

        console.log(`📍 Country ${countryId} query returned ${citiesInCountry.length} cities:`, citiesInCountry.map((c: any) => c.city));

        if (citiesInCountry.length === 0) {
          console.log(`⚠️ No cities found for country ${countryId}, skipping`);
          continue;
        }

        // Distribute nights across cities in this country
        if (citiesInCountry.length === 1) {
          finalCityNights.push({
            city: citiesInCountry[0].city,
            nights: nightsForThisCountry
          });
        } else {
          // Split nights between 2 cities in this country
          const nightsPerCity = Math.floor(nightsForThisCountry / citiesInCountry.length);
          const extraNights = nightsForThisCountry % citiesInCountry.length;

          citiesInCountry.forEach((cityData: any, index: number) => {
            const nights = nightsPerCity + (index < extraNights ? 1 : 0);
            if (nights > 0) {
              finalCityNights.push({
                city: cityData.city,
                nights: nights
              });
            }
          });
        }
      }

      if (finalCityNights.length === 0) {
        return NextResponse.json(
          { error: 'No cities found in the selected countries' },
          { status: 400 }
        );
      }

      console.log(`🏙️ Generated city distribution:`, finalCityNights);
    }

    // Get cities list
    const cities = finalCityNights.map((cn: CityNight) => cn.city);
    const citiesPlaceholder = cities.map(() => '?').join(',');

    // Fetch data from database (same as generate route)
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

    // Select appropriate price based on requested tour type (SIC or PRIVATE)
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

    // Call AI (training examples removed - style learned)
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    const destination = cities.join(' & ');
    const totalNightsCalculated = finalCityNights.reduce((sum: number, cn: CityNight) => sum + cn.nights, 0);
    const totalDays = totalNightsCalculated + 1;

    // H4: Sanitize special_requests to prevent AI prompt injection
    const sanitizedRequests = special_requests ? sanitizeText(special_requests, 1000) : '';

    const prompt = `You are an expert travel itinerary planner creating itineraries for a professional tour operator. Your itineraries will be presented to customers as official travel packages, so quality and professionalism are critical.

**YOUR MISSION:**
Create a compelling, professional itinerary with engaging day-by-day narratives. Write in a descriptive, exciting style that makes customers want to book this trip.

**Customer Request:**
- Destination: ${destination}
- Cities: ${finalCityNights.map((cn: CityNight) => `${cn.city} (${cn.nights} nights)`).join(', ')}
- Duration: ${totalNightsCalculated} nights / ${totalDays} days
- Start Date: ${start_date}
- Travelers: ${adults} adults${children > 0 ? `, ${children} children` : ''}
- Hotel Category: ${hotel_category}-star
- Tour Type: ${tour_type}
${sanitizedRequests ? `- Special Requests: ${sanitizedRequests}` : ''}

**Available Hotels ORGANIZED BY CITY:**
${finalCityNights.map((cn: CityNight) => {
  const cityHotels = hotels.filter((h: any) => h.city === cn.city).slice(0, 5);
  return `\n📍 ${cn.city} Hotels (${cn.nights} nights needed):\n${JSON.stringify(cityHotels, null, 2)}`;
}).join('\n')}

**Available Tours ORGANIZED BY CITY:**
${finalCityNights.map((cn: CityNight) => {
  const cityTours = tours.filter((t: any) => t.city === cn.city).slice(0, 5);
  return `\n📍 ${cn.city} Tours:\n${JSON.stringify(cityTours, null, 2)}`;
}).join('\n')}

**Available Vehicles:**
${JSON.stringify(vehicles.slice(0, 5), null, 2)}

**Available Airport Transfers:**
${JSON.stringify(airportTransfers, null, 2)}

**CRITICAL INSTRUCTIONS:**
1. **HOTELS ARE MANDATORY**: You MUST include a hotel item for EVERY SINGLE NIGHT of the itinerary
2. Write professional, engaging, descriptive narratives for each day
3. Include meal codes like "(B)", "(B/L)", "(D)" in day titles
4. Select the BEST hotels, tours, and vehicles from the database options provided above
5. DO NOT show itemized pricing - customers only see one total price
6. Create a realistic, balanced itinerary with appropriate rest time

**HOTEL SELECTION - MANDATORY RULES:**
🚨 **YOU MUST SELECT EXACTLY ${cities.length} DIFFERENT HOTELS (ONE PER CITY)!**

${finalCityNights.map((cn: CityNight, index: number) => {
  const dayStart = finalCityNights.slice(0, index).reduce((sum: number, c: CityNight) => sum + c.nights, 1);
  const dayEnd = dayStart + cn.nights - 1;
  return `📍 **${cn.city}** (Days ${dayStart}-${dayEnd}):
   - Pick ONE hotel from the "${cn.city} Hotels" section above
   - Use that SAME hotel for all ${cn.nights} nights in ${cn.city}
   - Use the exact hotel_id and price_per_night from the JSON`;
}).join('\n\n')}

🚨 **CRITICAL ERRORS TO AVOID:**
- ❌ DO NOT use hotels from wrong cities (e.g., Cappadocia hotel for Istanbul)
- ❌ DO NOT create hotels with null hotel_id
- ❌ DO NOT skip any city - all ${cities.length} cities need hotels

**TOUR SELECTION RULES - VERY IMPORTANT:**
🚨 **MAXIMUM ONE TOUR PER DAY** - NEVER add multiple tours on the same day
🚨 **FULL-DAY tour = that's the ONLY tour for that day** (no half-day tours on same day)
🚨 **HALF-DAY tour = that's the ONLY tour for that day** (no other tours on same day)

📍 **Include tours from cities that have them available:**
${finalCityNights.map((cn: CityNight) => `   - ${cn.city}: Check the "${cn.city} Tours" section - include maximum 1 tour per day`).join('\n')}

🚨 **AVOID DUPLICATE EXPERIENCES - Critical Rules:**
   - ❌ If you include "Bosphorus Cruise" tour, DO NOT add "Dinner Cruise" or "Turkish Night"
   - ❌ If you include "Dinner Cruise" or "Turkish Night", DO NOT add "Bosphorus Cruise"
   - ❌ DO NOT give similar tours on different days (e.g., two mosque tours, two palace tours)
   - ❌ DO NOT combine Full Day Tour + Half Day Tour on the same day
   - ✅ Vary the experiences - mix historical tours, nature tours, cultural experiences

✅ **Use exact tour_name, tour_id, and price from database**
⚠️ **If a city has NO tours listed above**: It's okay to skip tours for that city, but create engaging narratives about exploring independently

**EXAMPLE OF CORRECT TOUR DISTRIBUTION:**
Day 1: Arrival (no tour - just airport transfer and hotel)
Day 2: Full Day Classic City Tour (ONLY this tour - nothing else)
Day 3: Half Day Bosphorus Cruise (ONLY this tour - nothing else)
Day 4: Departure (no tour - just hotel to airport transfer)

**FALLBACK FOR MISSING CATEGORIES:**
⚠️ **If a city doesn't have the requested ${hotel_category}-star hotels**:
   1. Look for hotels one category higher (${parseInt(hotel_category) + 1}-star)
   2. If still not found, look for ${parseInt(hotel_category) - 1}-star
   3. Use the closest available category and note this in day 1 narrative
   Example: "Note: ${hotel_category}-star hotels were not available in Kusadasi, upgraded to ${parseInt(hotel_category) + 1}-star"

**STRICT PRICING RULES - VERY IMPORTANT:**
🚨 ONLY use items that exist in the database above (hotels, tours, vehicles)
🚨 DO NOT invent or add flights, meals, or any items not in the database
🚨 DO NOT make up prices - only use the prices shown in the database
🚨 NEVER create fake hotels with null IDs - only use hotels from the database
🚨 TRANSFERS: Use the "Available Airport Transfers" section above for all airport transfers
   - For ARRIVAL day: Use transfer with from_city = "{City} Airport" and to_city = "{City}"
   - For DEPARTURE day: Use transfer with from_city = "{City}" and to_city = "{City} Airport"
   - When changing cities: Include BOTH departure transfer from old city AND arrival transfer to new city
   - Use the price_oneway value from the intercity_transfers data
   - Reference the transfer by its id when adding to itinerary items
   Example: Istanbul to Cappadocia needs:
   - Istanbul: Transfer from "Istanbul" to "Istanbul Airport" (find in airport transfers)
   - Cappadocia: Transfer from "Cappadocia Airport" to "Cappadocia" (find in airport transfers)

Return ONLY valid JSON with this structure:
{
  "days": [
    {
      "day_number": 1,
      "date": "YYYY-MM-DD",
      "location": "City Name",
      "title": "Day 1 - Arrival in Istanbul (B)",
      "narrative": "Write a compelling, detailed narrative here exactly like the training examples. Describe arrival, what they'll experience, specific places they'll see, the atmosphere, etc. Make it exciting and professional.",
      "meals": "(B)",
      "items": [
        {"type": "hotel", "name": "Hotel Name from Database", "hotel_id": 123, "price_per_unit": 150, "quantity": 1},
        {"type": "vehicle", "name": "Airport Transfer - Vehicle Name", "vehicle_id": 1, "price_per_unit": 40, "quantity": 1},
        {"type": "tour", "name": "Tour Name from Database", "tour_id": 456, "price_per_unit": 80, "quantity": 2}
      ]
    }
  ]
}

Make each day narrative exciting, descriptive, and professional.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000, // Sonnet 4.5 supports higher token limits
      messages: [{ role: 'user', content: prompt }]
    });

    const aiResponse = message.content[0].type === 'text' ? message.content[0].text : '';

    let itinerary;
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) ||
                       aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      itinerary = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response');
      return NextResponse.json({ error: 'Failed to generate itinerary. Please try again.' }, { status: 500 });
    }

    // Calculate pricing
    const totalPeople = adults + children;
    let total_price = 0;

    if (itinerary.days) {
      itinerary.days.forEach((day: any) => {
        if (day.items) {
          day.items.forEach((item: any) => {
            const price = parseFloat(item.price_per_unit) || 0;
            const quantity = parseInt(item.quantity) || 1;

            if (item.type === 'hotel') {
              item.total_price = price * quantity * totalPeople;
            } else if (item.type === 'tour' || item.type === 'entrance_fee' || item.type === 'meal') {
              item.total_price = price * quantity;
            } else {
              item.total_price = price * quantity;
            }

            total_price += item.total_price;
          });
        }
      });
    }

    const price_per_person = totalPeople > 0 ? total_price / totalPeople : 0;

    // Extract unique hotel IDs used in the itinerary
    const hotelIds: number[] = [];
    if (itinerary.days) {
      itinerary.days.forEach((day: any, dayIndex: number) => {
        if (day.items) {
          day.items.forEach((item: any) => {
            if (item.type === 'hotel') {
              console.log(`Day ${dayIndex + 1} hotel: ${item.name}, hotel_id: ${item.hotel_id}`);
              if (item.hotel_id && !hotelIds.includes(item.hotel_id)) {
                hotelIds.push(item.hotel_id);
              }
            }
          });
        }
      });
    }
    console.log(`🏨 Extracted hotel IDs:`, hotelIds);

    // Fetch full hotel details for display
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

    // Extract unique tour IDs used in the itinerary
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

    // Fetch full tour details with images for sightseeing gallery
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

    // Calculate end date (totalNights already defined at line 116)
    const startDate = new Date(start_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + totalNights);

    // Save to database with customer contact info and 'pending' status (source = 'online' for customer-created)
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'online')`,
      [
        orgId,
        customer_name,
        customer_email,
        customer_phone || null,
        destination,
        JSON.stringify(finalCityNights),
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

    // Fetch the UUID that was auto-generated by the trigger
    const [newItinerary]: any = await pool.query(
      'SELECT uuid FROM customer_itineraries WHERE id = ?',
      [itineraryId]
    );

    const uuid = newItinerary[0]?.uuid;

    if (!uuid) {
      console.error('Failed to retrieve UUID for new itinerary');
      return NextResponse.json({ error: 'Failed to create itinerary' }, { status: 500 });
    }

    console.log(`📝 Itinerary created for ${customer_name}: UUID ${uuid}`);

    // Return with UUID for secure redirect
    return NextResponse.json({
      success: true,
      itinerary_id: itineraryId,
      uuid: uuid, // Return UUID for redirect
      itinerary,
      total_price,
      price_per_person,
      adults,
      children,
      destination,
      city_nights: finalCityNights,
      start_date,
      hotel_category,
      tour_type,
      special_requests,
      hotels_used: hotelDetails, // Include full hotel details
      tours_visited: tourDetails // Include tour/sightseeing details with images
    });

  } catch (error: any) {
    console.error('Error generating preview:', error);
    // H6: Don't leak error details to client
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
