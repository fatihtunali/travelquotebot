/**
 * Test script to generate an itinerary and verify hotel selection
 */

const API_BASE = 'http://localhost:3003';

interface CityNight {
  city: string;
  nights: number;
}

async function testItineraryGeneration() {
  console.log('🧪 Testing Itinerary Generation\n');
  console.log('='.repeat(60));

  const requestData = {
    city_nights: [
      { city: 'Istanbul', nights: 2 },
      { city: 'Cappadocia', nights: 2 },
      { city: 'Antalya', nights: 2 },
      { city: 'Kusadasi', nights: 2 }
    ] as CityNight[],
    start_date: '2025-11-07',
    adults: 2,
    children: 0,
    hotel_category: '5',
    tour_type: 'PRIVATE',
    special_requests: null,
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    customer_phone: '+1234567890'
  };

  console.log('\n📋 Request Parameters:');
  console.log(`   Cities: ${requestData.city_nights.map(cn => `${cn.city} (${cn.nights}N)`).join(', ')}`);
  console.log(`   Hotel Category: ${requestData.hotel_category}-star`);
  console.log(`   Travelers: ${requestData.adults} adults`);
  console.log(`   Start Date: ${requestData.start_date}`);

  console.log('\n⏳ Generating itinerary... (this may take 10-20 seconds)\n');

  try {
    const startTime = Date.now();

    const response = await fetch(`${API_BASE}/api/itinerary/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Generation failed:', error);
      process.exit(1);
    }

    const result = await response.json();

    console.log(`✅ Generation completed in ${duration}s\n`);
    console.log('='.repeat(60));

    // Extract hotel information
    const hotelsByDay: { [day: number]: { hotel_id: number | null; hotel_name: string; city?: string } } = {};
    const uniqueHotelIds = new Set<number>();

    if (result.itinerary?.days) {
      result.itinerary.days.forEach((day: any) => {
        if (day.items) {
          const hotelItem = day.items.find((item: any) => item.type === 'hotel');
          if (hotelItem) {
            hotelsByDay[day.day_number] = {
              hotel_id: hotelItem.hotel_id,
              hotel_name: hotelItem.name
            };
            if (hotelItem.hotel_id) {
              uniqueHotelIds.add(hotelItem.hotel_id);
            }
          }
        }
      });
    }

    // Map hotel IDs to cities
    const hotelCities: { [hotelId: number]: string } = {};
    if (result.hotels_used) {
      result.hotels_used.forEach((hotel: any) => {
        hotelCities[hotel.id] = hotel.city;
      });
    }

    console.log('\n🏨 Hotel Selection Analysis:\n');
    console.log('Day | Location     | Hotel Name                          | Hotel ID | City (DB)');
    console.log('-'.repeat(90));

    const expectedCities = requestData.city_nights.map(cn => cn.city);
    const citiesFound = new Set<string>();

    Object.entries(hotelsByDay).forEach(([day, hotel]) => {
      const dayNum = parseInt(day);
      const expectedCity = requestData.city_nights.find((cn, idx) => {
        const startDay = requestData.city_nights.slice(0, idx).reduce((sum, c) => sum + c.nights, 1);
        const endDay = startDay + cn.nights - 1;
        return dayNum >= startDay && dayNum <= endDay;
      })?.city || 'Unknown';

      const actualCity = hotel.hotel_id ? hotelCities[hotel.hotel_id] : 'N/A';
      if (actualCity && actualCity !== 'N/A') {
        citiesFound.add(actualCity);
      }

      const match = expectedCity === actualCity ? '✅' : '❌';
      const hotelIdStr = hotel.hotel_id ? hotel.hotel_id.toString() : 'NULL';

      console.log(
        `${dayNum.toString().padStart(3)} | ${expectedCity.padEnd(12)} | ${hotel.hotel_name.substring(0, 35).padEnd(35)} | ${hotelIdStr.padEnd(8)} | ${actualCity} ${match}`
      );
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Results Summary:\n');
    console.log(`✅ Expected cities: ${expectedCities.length} (${expectedCities.join(', ')})`);
    console.log(`🏨 Unique hotels selected: ${uniqueHotelIds.size}`);
    console.log(`📍 Cities found: ${citiesFound.size} (${Array.from(citiesFound).join(', ')})`);

    // Validation
    console.log('\n🔍 Validation:\n');

    let allPassed = true;

    // Check 1: All hotels have valid IDs
    const nullHotels = Object.values(hotelsByDay).filter(h => !h.hotel_id).length;
    if (nullHotels === 0) {
      console.log('   ✅ All hotels have valid IDs (no NULL values)');
    } else {
      console.log(`   ❌ Found ${nullHotels} hotels with NULL IDs`);
      allPassed = false;
    }

    // Check 2: Correct number of unique hotels
    if (uniqueHotelIds.size === expectedCities.length) {
      console.log(`   ✅ Correct number of unique hotels (${uniqueHotelIds.size} hotels for ${expectedCities.length} cities)`);
    } else {
      console.log(`   ❌ Wrong number of unique hotels (${uniqueHotelIds.size} hotels for ${expectedCities.length} cities)`);
      allPassed = false;
    }

    // Check 3: All cities covered
    const missingCities = expectedCities.filter(city => !citiesFound.has(city));
    if (missingCities.length === 0) {
      console.log('   ✅ All cities have hotels');
    } else {
      console.log(`   ❌ Missing hotels from: ${missingCities.join(', ')}`);
      allPassed = false;
    }

    // Check 4: Hotels match their cities
    let cityMismatches = 0;
    Object.entries(hotelsByDay).forEach(([day, hotel]) => {
      const dayNum = parseInt(day);
      const expectedCity = requestData.city_nights.find((cn, idx) => {
        const startDay = requestData.city_nights.slice(0, idx).reduce((sum, c) => sum + c.nights, 1);
        const endDay = startDay + cn.nights - 1;
        return dayNum >= startDay && dayNum <= endDay;
      })?.city;

      const actualCity = hotel.hotel_id ? hotelCities[hotel.hotel_id] : null;
      if (expectedCity && actualCity && expectedCity !== actualCity) {
        cityMismatches++;
      }
    });

    if (cityMismatches === 0) {
      console.log('   ✅ All hotels match their expected cities');
    } else {
      console.log(`   ❌ Found ${cityMismatches} city mismatches`);
      allPassed = false;
    }

    console.log('\n' + '='.repeat(60));

    if (allPassed) {
      console.log('\n🎉 TEST PASSED! Itinerary generation is working correctly.\n');
      console.log(`   Itinerary ID: ${result.itinerary_id}`);
      console.log(`   Total Price: €${result.total_price.toFixed(2)}`);
      console.log(`   Price Per Person: €${result.price_per_person.toFixed(2)}`);
      console.log(`   View at: http://localhost:3003/itinerary/${result.itinerary_id}\n`);
      process.exit(0);
    } else {
      console.log('\n❌ TEST FAILED! Issues found in hotel selection.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error during test:', error);
    process.exit(1);
  }
}

testItineraryGeneration();
