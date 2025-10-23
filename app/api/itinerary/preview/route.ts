import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

interface CityNight {
  city: string;
  nights: number;
}

// POST - Generate itinerary preview (no save, no contact info required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      city_nights,
      start_date,
      adults,
      children,
      hotel_category,
      tour_type,
      special_requests
    } = body;

    // Validation
    if (!city_nights || city_nights.length === 0 || !start_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`🎯 Preview Request:`, { city_nights, adults, children });

    // Use organization_id = 1 by default
    const orgId = 1;
    const season = 'Winter 2025-26';

    // Get cities list
    const cities = city_nights.map((cn: CityNight) => cn.city);
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

    const tourTypeFilter = tour_type === 'SIC' ? 'SIC' : 'PRIVATE';
    const [tours]: any = await pool.query(
      `SELECT t.*,
         CASE
           WHEN t.tour_type = 'SIC' THEN tp.sic_price_2_pax
           ELSE tp.pvt_price_2_pax
         END as price_per_person
       FROM tours t
       LEFT JOIN tour_pricing tp ON t.id = tp.tour_id
         AND tp.season_name = ?
         AND tp.status = 'active'
       WHERE t.organization_id = ?
         AND t.status = 'active'
         AND t.city IN (${citiesPlaceholder})
         AND t.tour_type = ?
       ORDER BY t.city, t.tour_name`,
      [season, orgId, ...cities, tourTypeFilter]
    );

    const [vehicles]: any = await pool.query(
      `SELECT v.*, vp.airport_to_hotel, vp.hotel_to_airport, vp.price_per_day
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

    console.log(`📊 Found: ${hotels.length} hotels, ${tours.length} tours, ${vehicles.length} vehicles`);

    if (hotels.length === 0) {
      return NextResponse.json({
        error: `No ${hotel_category}-star hotels found in ${cities.join(', ')}. Please try different cities or hotel category.`
      }, { status: 400 });
    }

    // Load training examples
    const trainingPath = path.join(process.cwd(), 'lib', 'training-examples.json');
    let trainingExamples: any[] = [];
    try {
      if (fs.existsSync(trainingPath)) {
        const trainingData = fs.readFileSync(trainingPath, 'utf-8');
        trainingExamples = JSON.parse(trainingData);
        console.log(`📚 Loaded ${trainingExamples.length} training examples`);
      }
    } catch (error) {
      console.error('Warning: Could not load training examples:', error);
    }

    // Call AI with training examples
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    const destination = cities.join(' & ');
    const totalNights = city_nights.reduce((sum: number, cn: CityNight) => sum + cn.nights, 0);
    const totalDays = totalNights + 1;

    // Build training examples section
    const trainingSection = trainingExamples.length > 0 ? `

**TRAINING EXAMPLES - LEARN FROM THESE:**
Study these professional itinerary examples carefully. Learn the narrative style, tone, structure, and level of detail:

${trainingExamples.map((ex, idx) => `
--- Example ${idx + 1}: ${ex.filename} ---
${ex.content.substring(0, 8000)}
---
`).join('\n')}

**IMPORTANT:** Use the EXACT same professional writing style, narrative structure, and level of detail as the training examples above. Write beautiful, compelling day-by-day narratives that make customers excited to book.
` : '';

    const prompt = `You are an expert travel itinerary planner creating itineraries for a professional tour operator. Your itineraries will be presented to customers as official travel packages, so quality and professionalism are critical.

**YOUR MISSION:**
Create a perfect itinerary that matches the PROFESSIONAL QUALITY and NARRATIVE STYLE of the training examples provided below. Customers should feel inspired and excited to book this trip.

${trainingSection}

**Customer Request:**
- Destination: ${destination}
- Cities: ${city_nights.map((cn: CityNight) => `${cn.city} (${cn.nights} nights)`).join(', ')}
- Duration: ${totalNights} nights / ${totalDays} days
- Start Date: ${start_date}
- Travelers: ${adults} adults${children > 0 ? `, ${children} children` : ''}
- Hotel Category: ${hotel_category}-star
- Tour Type: ${tour_type}
${special_requests ? `- Special Requests: ${special_requests}` : ''}

**Available Hotels from Database:**
${JSON.stringify(hotels.slice(0, 10), null, 2)}

**Available Tours from Database:**
${JSON.stringify(tours.slice(0, 15), null, 2)}

**Available Vehicles from Database:**
${JSON.stringify(vehicles.slice(0, 5), null, 2)}

**CRITICAL INSTRUCTIONS:**
1. Write narratives EXACTLY like the training examples - professional, engaging, descriptive
2. Use the day structure format from the training examples
3. Include meal codes like "(B)", "(B/L)", "(D)" as shown in examples
4. Select the BEST hotels, tours, and vehicles from the database options provided above
5. Write compelling descriptions that make customers want to visit
6. DO NOT show itemized pricing - customers only see one total price
7. Create a realistic, balanced itinerary with appropriate rest time

**STRICT PRICING RULES - VERY IMPORTANT:**
🚨 ONLY use items that exist in the database above (hotels, tours, vehicles)
🚨 DO NOT invent or add flights, meals, or any items not in the database
🚨 DO NOT make up prices - only use the prices shown in the database
🚨 TRANSFERS: When changing cities, you MUST include BOTH transfers:
   - Departure transfer (hotel → airport) in the departing city
   - Arrival transfer (airport → hotel) in the arriving city
   Example: Istanbul to Cappadocia needs:
   - Istanbul: hotel_to_airport transfer (€40)
   - Cappadocia: airport_to_hotel transfer (€40)

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

Make each day narrative exciting, descriptive, and professional EXACTLY like the training examples.`;

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

    // Return preview (NOT saved to database yet)
    return NextResponse.json({
      success: true,
      itinerary,
      total_price,
      price_per_person,
      adults,
      children,
      destination,
      city_nights,
      start_date,
      hotel_category,
      tour_type,
      special_requests
    });

  } catch (error: any) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview', details: error.message },
      { status: 500 }
    );
  }
}
