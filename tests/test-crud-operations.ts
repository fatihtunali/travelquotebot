/**
 * Comprehensive CRUD Operations Test Script
 * Tests all pricing categories: Hotels, Tours, Vehicles, Guides, Entrance Fees, Meals, Extras
 *
 * Run this script from admin dashboard to verify all CRUD operations are working
 */

// Auto-detect base URL (works in browser and can be overridden)
const API_BASE_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/api/pricing`
  : 'http://localhost:3003/api/pricing';

// Get token from localStorage (assumes you're logged in)
const getToken = () => localStorage.getItem('token');

interface TestResult {
  category: string;
  operation: string;
  status: 'PASS' | 'FAIL';
  message: string;
  duration: number;
}

const results: TestResult[] = [];

// Utility function to log results
function logResult(category: string, operation: string, status: 'PASS' | 'FAIL', message: string, duration: number) {
  results.push({ category, operation, status, message, duration });
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} [${category}] ${operation}: ${message} (${duration}ms)`);
}

// Utility function to make API calls
async function apiCall(endpoint: string, method: string, body?: any): Promise<any> {
  const token = getToken();
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
}

// ============================================================================
// HOTELS CRUD TESTS
// ============================================================================
async function testHotelsCRUD() {
  console.log('\n🏨 Testing Hotels CRUD Operations...\n');
  let hotelId: number;
  let pricingId: number;

  // TEST 1: CREATE
  try {
    const start = Date.now();
    const result = await apiCall('/hotels', 'POST', {
      hotel_name: 'Test Hotel CRUD',
      city: 'Istanbul',
      star_rating: 4,
      season_name: 'Test Season 2025',
      start_date: '2025-06-01',
      end_date: '2025-09-30',
      currency: 'EUR',
      double_room_bb: 100,
      single_supplement_bb: 50,
      triple_room_bb: 80,
      child_0_6_bb: 0,
      child_6_12_bb: 30,
      base_meal_plan: 'BB',
      hb_supplement: 15,
      fb_supplement: 25,
      ai_supplement: 40,
      notes: 'Test hotel for CRUD operations'
    });
    hotelId = result.hotelId;
    pricingId = result.pricingId;
    logResult('Hotels', 'CREATE', 'PASS', `Hotel created with ID ${hotelId}`, Date.now() - start);
  } catch (error: any) {
    logResult('Hotels', 'CREATE', 'FAIL', error.message, 0);
    return;
  }

  // TEST 2: READ
  try {
    const start = Date.now();
    const hotels = await apiCall('/hotels', 'GET');
    const found = hotels.find((h: any) => h.id === hotelId);
    if (found && found.hotel_name === 'Test Hotel CRUD') {
      logResult('Hotels', 'READ', 'PASS', `Hotel ${hotelId} retrieved successfully`, Date.now() - start);
    } else {
      logResult('Hotels', 'READ', 'FAIL', 'Hotel not found in list', Date.now() - start);
    }
  } catch (error: any) {
    logResult('Hotels', 'READ', 'FAIL', error.message, 0);
  }

  // TEST 3: UPDATE
  try {
    const start = Date.now();
    await apiCall('/hotels', 'PUT', {
      id: hotelId,
      pricing_id: pricingId,
      hotel_name: 'Test Hotel CRUD - Updated',
      city: 'Istanbul',
      star_rating: 5,
      season_name: 'Test Season 2025',
      start_date: '2025-06-01',
      end_date: '2025-09-30',
      currency: 'EUR',
      double_room_bb: 120,
      single_supplement_bb: 60,
      triple_room_bb: 90,
      child_0_6_bb: 0,
      child_6_12_bb: 35,
      base_meal_plan: 'HB',
      hb_supplement: 0,
      fb_supplement: 10,
      ai_supplement: 25,
      notes: 'Updated test hotel'
    });
    logResult('Hotels', 'UPDATE', 'PASS', `Hotel ${hotelId} updated successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Hotels', 'UPDATE', 'FAIL', error.message, 0);
  }

  // TEST 4: DELETE
  try {
    const start = Date.now();
    await apiCall(`/hotels?id=${hotelId}`, 'DELETE');
    logResult('Hotels', 'DELETE', 'PASS', `Hotel ${hotelId} archived successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Hotels', 'DELETE', 'FAIL', error.message, 0);
  }
}

// ============================================================================
// TOURS CRUD TESTS
// ============================================================================
async function testToursCRUD() {
  console.log('\n🗺️ Testing Tours CRUD Operations...\n');
  let tourId: number;

  // TEST 1: CREATE
  try {
    const start = Date.now();
    const result = await apiCall('/tours', 'POST', {
      tour_name: 'Test Tour CRUD',
      tour_code: 'TEST-001',
      city: 'Istanbul',
      duration_days: 3,
      tour_type: 'SIC',
      inclusions: 'Guide, Transport',
      exclusions: 'Meals, Entrance Fees',
      season_name: 'Test Season 2025',
      start_date: '2025-06-01',
      end_date: '2025-09-30',
      currency: 'EUR',
      sic_price_2_pax: 200,
      sic_price_4_pax: 150,
      sic_price_6_pax: 120,
      sic_price_8_pax: 100,
      sic_price_10_pax: 90,
      pvt_price_2_pax: 400,
      pvt_price_4_pax: 300,
      pvt_price_6_pax: 250,
      pvt_price_8_pax: 220,
      pvt_price_10_pax: 200,
      notes: 'Test tour for CRUD operations'
    });
    tourId = result.tourId;
    logResult('Tours', 'CREATE', 'PASS', `Tour created with ID ${tourId}`, Date.now() - start);
  } catch (error: any) {
    logResult('Tours', 'CREATE', 'FAIL', error.message, 0);
    return;
  }

  // TEST 2: READ
  try {
    const start = Date.now();
    const tours = await apiCall('/tours', 'GET');
    const found = tours.find((t: any) => t.id === tourId);
    if (found && found.tour_name === 'Test Tour CRUD') {
      logResult('Tours', 'READ', 'PASS', `Tour ${tourId} retrieved successfully`, Date.now() - start);
    } else {
      logResult('Tours', 'READ', 'FAIL', 'Tour not found in list', Date.now() - start);
    }
  } catch (error: any) {
    logResult('Tours', 'READ', 'FAIL', error.message, 0);
  }

  // TEST 3: UPDATE
  try {
    const start = Date.now();
    const tours = await apiCall('/tours', 'GET');
    const tour = tours.find((t: any) => t.id === tourId);
    await apiCall('/tours', 'PUT', {
      id: tourId,
      pricing_id: tour.pricing_id,
      tour_name: 'Test Tour CRUD - Updated',
      tour_code: 'TEST-001-UPD',
      city: 'Istanbul',
      duration_days: 4,
      tour_type: 'Private',
      inclusions: 'Guide, Transport, Meals',
      exclusions: 'Entrance Fees',
      season_name: 'Test Season 2025',
      start_date: '2025-06-01',
      end_date: '2025-09-30',
      currency: 'EUR',
      sic_price_2_pax: 220,
      sic_price_4_pax: 170,
      sic_price_6_pax: 140,
      sic_price_8_pax: 120,
      sic_price_10_pax: 110,
      pvt_price_2_pax: 450,
      pvt_price_4_pax: 350,
      pvt_price_6_pax: 280,
      pvt_price_8_pax: 250,
      pvt_price_10_pax: 230,
      notes: 'Updated test tour'
    });
    logResult('Tours', 'UPDATE', 'PASS', `Tour ${tourId} updated successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Tours', 'UPDATE', 'FAIL', error.message, 0);
  }

  // TEST 4: DELETE
  try {
    const start = Date.now();
    await apiCall(`/tours?id=${tourId}`, 'DELETE');
    logResult('Tours', 'DELETE', 'PASS', `Tour ${tourId} archived successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Tours', 'DELETE', 'FAIL', error.message, 0);
  }
}

// ============================================================================
// VEHICLES CRUD TESTS
// ============================================================================
async function testVehiclesCRUD() {
  console.log('\n🚗 Testing Vehicles CRUD Operations...\n');
  let vehicleId: number;
  let pricingId: number;

  // TEST 1: CREATE
  try {
    const start = Date.now();
    const result = await apiCall('/vehicles', 'POST', {
      vehicle: {
        vehicle_type: 'Mercedes Vito',
        max_capacity: 8,
        city: 'Istanbul'
      },
      pricing: {
        season_name: 'Test Season 2025',
        start_date: '2025-06-01',
        end_date: '2025-09-30',
        currency: 'EUR',
        price_per_day: 150,
        price_half_day: 90,
        airport_to_hotel: 60,
        hotel_to_airport: 60,
        airport_roundtrip: 100,
        notes: 'Test vehicle for CRUD operations'
      }
    });
    vehicleId = result.data.vehicleId;
    pricingId = result.data.pricingId;
    logResult('Vehicles', 'CREATE', 'PASS', `Vehicle created with ID ${vehicleId}`, Date.now() - start);
  } catch (error: any) {
    logResult('Vehicles', 'CREATE', 'FAIL', error.message, 0);
    return;
  }

  // TEST 2: READ
  try {
    const start = Date.now();
    const vehicles = await apiCall('/vehicles', 'GET');
    const found = vehicles.find((v: any) => v.id === vehicleId);
    if (found && found.vehicle_type === 'Mercedes Vito') {
      logResult('Vehicles', 'READ', 'PASS', `Vehicle ${vehicleId} retrieved successfully`, Date.now() - start);
    } else {
      logResult('Vehicles', 'READ', 'FAIL', 'Vehicle not found in list', Date.now() - start);
    }
  } catch (error: any) {
    logResult('Vehicles', 'READ', 'FAIL', error.message, 0);
  }

  // TEST 3: UPDATE
  try {
    const start = Date.now();
    await apiCall('/vehicles', 'PUT', {
      vehicleId: vehicleId,
      vehicle: {
        vehicle_type: 'Mercedes Sprinter',
        max_capacity: 12,
        city: 'Istanbul'
      },
      pricing: {
        id: pricingId,
        season_name: 'Test Season 2025',
        start_date: '2025-06-01',
        end_date: '2025-09-30',
        currency: 'EUR',
        price_per_day: 180,
        price_half_day: 110,
        airport_to_hotel: 70,
        hotel_to_airport: 70,
        airport_roundtrip: 120,
        notes: 'Updated test vehicle'
      }
    });
    logResult('Vehicles', 'UPDATE', 'PASS', `Vehicle ${vehicleId} updated successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Vehicles', 'UPDATE', 'FAIL', error.message, 0);
  }

  // TEST 4: DELETE
  try {
    const start = Date.now();
    await apiCall(`/vehicles?id=${vehicleId}`, 'DELETE');
    logResult('Vehicles', 'DELETE', 'PASS', `Vehicle ${vehicleId} archived successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Vehicles', 'DELETE', 'FAIL', error.message, 0);
  }
}

// ============================================================================
// GUIDES CRUD TESTS
// ============================================================================
async function testGuidesCRUD() {
  console.log('\n👨‍🏫 Testing Guides CRUD Operations...\n');
  let guideId: number;

  // TEST 1: CREATE
  try {
    const start = Date.now();
    const result = await apiCall('/guides', 'POST', {
      city: 'Istanbul',
      language: 'English',
      season_name: 'Test Season 2025',
      start_date: '2025-06-01',
      end_date: '2025-09-30',
      currency: 'EUR',
      full_day_price: 120,
      half_day_price: 70,
      night_price: 50,
      notes: 'Test guide for CRUD operations'
    });
    guideId = result.guideId;
    logResult('Guides', 'CREATE', 'PASS', `Guide created with ID ${guideId}`, Date.now() - start);
  } catch (error: any) {
    logResult('Guides', 'CREATE', 'FAIL', error.message, 0);
    return;
  }

  // TEST 2: READ
  try {
    const start = Date.now();
    const guides = await apiCall('/guides', 'GET');
    const found = guides.find((g: any) => g.id === guideId);
    if (found && found.city === 'Istanbul' && found.language === 'English') {
      logResult('Guides', 'READ', 'PASS', `Guide ${guideId} retrieved successfully`, Date.now() - start);
    } else {
      logResult('Guides', 'READ', 'FAIL', 'Guide not found in list', Date.now() - start);
    }
  } catch (error: any) {
    logResult('Guides', 'READ', 'FAIL', error.message, 0);
  }

  // TEST 3: UPDATE
  try {
    const start = Date.now();
    const guides = await apiCall('/guides', 'GET');
    const guide = guides.find((g: any) => g.id === guideId);
    await apiCall('/guides', 'PUT', {
      id: guideId,
      pricing_id: guide.pricing_id,
      city: 'Istanbul',
      language: 'Spanish',
      season_name: 'Test Season 2025',
      start_date: '2025-06-01',
      end_date: '2025-09-30',
      currency: 'EUR',
      full_day_price: 140,
      half_day_price: 80,
      night_price: 60,
      notes: 'Updated test guide'
    });
    logResult('Guides', 'UPDATE', 'PASS', `Guide ${guideId} updated successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Guides', 'UPDATE', 'FAIL', error.message, 0);
  }

  // TEST 4: DELETE
  try {
    const start = Date.now();
    await apiCall(`/guides?id=${guideId}`, 'DELETE');
    logResult('Guides', 'DELETE', 'PASS', `Guide ${guideId} archived successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Guides', 'DELETE', 'FAIL', error.message, 0);
  }
}

// ============================================================================
// ENTRANCE FEES CRUD TESTS
// ============================================================================
async function testEntranceFeesCRUD() {
  console.log('\n🎫 Testing Entrance Fees CRUD Operations...\n');
  let feeId: number;

  // TEST 1: CREATE
  try {
    const start = Date.now();
    const result = await apiCall('/entrance-fees', 'POST', {
      site_name: 'Test Museum',
      city: 'Istanbul',
      season_name: 'Test Season 2025',
      start_date: '2025-06-01',
      end_date: '2025-09-30',
      currency: 'EUR',
      adult_price: 15,
      child_price: 8,
      student_price: 10,
      notes: 'Test entrance fee for CRUD operations'
    });
    feeId = result.feeId;
    logResult('Entrance Fees', 'CREATE', 'PASS', `Entrance fee created with ID ${feeId}`, Date.now() - start);
  } catch (error: any) {
    logResult('Entrance Fees', 'CREATE', 'FAIL', error.message, 0);
    return;
  }

  // TEST 2: READ
  try {
    const start = Date.now();
    const fees = await apiCall('/entrance-fees', 'GET');
    const found = fees.find((f: any) => f.id === feeId);
    if (found && found.siteName === 'Test Museum') {
      logResult('Entrance Fees', 'READ', 'PASS', `Entrance fee ${feeId} retrieved successfully`, Date.now() - start);
    } else {
      logResult('Entrance Fees', 'READ', 'FAIL', 'Entrance fee not found in list', Date.now() - start);
    }
  } catch (error: any) {
    logResult('Entrance Fees', 'READ', 'FAIL', error.message, 0);
  }

  // TEST 3: UPDATE
  try {
    const start = Date.now();
    const fees = await apiCall('/entrance-fees', 'GET');
    const fee = fees.find((f: any) => f.id === feeId);
    await apiCall('/entrance-fees', 'PUT', {
      id: feeId,
      pricing_id: fee.pricing_id,
      site_name: 'Test Museum - Updated',
      city: 'Istanbul',
      season_name: 'Test Season 2025',
      start_date: '2025-06-01',
      end_date: '2025-09-30',
      currency: 'EUR',
      adult_price: 18,
      child_price: 10,
      student_price: 12,
      notes: 'Updated test entrance fee'
    });
    logResult('Entrance Fees', 'UPDATE', 'PASS', `Entrance fee ${feeId} updated successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Entrance Fees', 'UPDATE', 'FAIL', error.message, 0);
  }

  // TEST 4: DELETE
  try {
    const start = Date.now();
    await apiCall(`/entrance-fees?id=${feeId}`, 'DELETE');
    logResult('Entrance Fees', 'DELETE', 'PASS', `Entrance fee ${feeId} archived successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Entrance Fees', 'DELETE', 'FAIL', error.message, 0);
  }
}

// ============================================================================
// MEALS CRUD TESTS
// ============================================================================
async function testMealsCRUD() {
  console.log('\n🍽️ Testing Meals CRUD Operations...\n');
  let mealId: number;

  // TEST 1: CREATE
  try {
    const start = Date.now();
    const result = await apiCall('/meals', 'POST', {
      restaurantName: 'Test Restaurant',
      city: 'Istanbul',
      mealType: 'Lunch',
      seasonName: 'Test Season 2025',
      startDate: '2025-06-01',
      endDate: '2025-09-30',
      currency: 'EUR',
      adultLunch: 25,
      childLunch: 15,
      adultDinner: 35,
      childDinner: 20,
      menuDescription: 'Test menu',
      notes: 'Test meal for CRUD operations'
    });
    mealId = result.id;
    logResult('Meals', 'CREATE', 'PASS', `Meal created with ID ${mealId}`, Date.now() - start);
  } catch (error: any) {
    logResult('Meals', 'CREATE', 'FAIL', error.message, 0);
    return;
  }

  // TEST 2: READ
  try {
    const start = Date.now();
    const meals = await apiCall('/meals', 'GET');
    const found = meals.find((m: any) => m.id === mealId);
    if (found && found.restaurantName === 'Test Restaurant') {
      logResult('Meals', 'READ', 'PASS', `Meal ${mealId} retrieved successfully`, Date.now() - start);
    } else {
      logResult('Meals', 'READ', 'FAIL', 'Meal not found in list', Date.now() - start);
    }
  } catch (error: any) {
    logResult('Meals', 'READ', 'FAIL', error.message, 0);
  }

  // TEST 3: UPDATE
  try {
    const start = Date.now();
    await apiCall('/meals', 'PUT', {
      id: mealId,
      restaurantName: 'Test Restaurant - Updated',
      city: 'Istanbul',
      mealType: 'Dinner',
      seasonName: 'Test Season 2025',
      startDate: '2025-06-01',
      endDate: '2025-09-30',
      currency: 'EUR',
      adultLunch: 28,
      childLunch: 18,
      adultDinner: 40,
      childDinner: 25,
      menuDescription: 'Updated test menu',
      notes: 'Updated test meal'
    });
    logResult('Meals', 'UPDATE', 'PASS', `Meal ${mealId} updated successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Meals', 'UPDATE', 'FAIL', error.message, 0);
  }

  // TEST 4: DELETE
  try {
    const start = Date.now();
    await apiCall(`/meals?id=${mealId}`, 'DELETE');
    logResult('Meals', 'DELETE', 'PASS', `Meal ${mealId} archived successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Meals', 'DELETE', 'FAIL', error.message, 0);
  }
}

// ============================================================================
// EXTRAS CRUD TESTS
// ============================================================================
async function testExtrasCRUD() {
  console.log('\n💰 Testing Extras CRUD Operations...\n');
  let extraId: number;

  // TEST 1: CREATE
  try {
    const start = Date.now();
    const result = await apiCall('/extras', 'POST', {
      expenseName: 'Test Parking Fee',
      category: 'Parking',
      city: 'Istanbul',
      currency: 'EUR',
      unitPrice: 10,
      unitType: 'per day',
      description: 'Test extra for CRUD operations'
    });
    extraId = result.id;
    logResult('Extras', 'CREATE', 'PASS', `Extra created with ID ${extraId}`, Date.now() - start);
  } catch (error: any) {
    logResult('Extras', 'CREATE', 'FAIL', error.message, 0);
    return;
  }

  // TEST 2: READ
  try {
    const start = Date.now();
    const extras = await apiCall('/extras', 'GET');
    const found = extras.find((e: any) => e.id === extraId);
    if (found && found.expenseName === 'Test Parking Fee') {
      logResult('Extras', 'READ', 'PASS', `Extra ${extraId} retrieved successfully`, Date.now() - start);
    } else {
      logResult('Extras', 'READ', 'FAIL', 'Extra not found in list', Date.now() - start);
    }
  } catch (error: any) {
    logResult('Extras', 'READ', 'FAIL', error.message, 0);
  }

  // TEST 3: UPDATE
  try {
    const start = Date.now();
    await apiCall('/extras', 'PUT', {
      id: extraId,
      expenseName: 'Test Parking Fee - Updated',
      category: 'Parking',
      city: 'Istanbul',
      currency: 'EUR',
      unitPrice: 15,
      unitType: 'per day',
      description: 'Updated test extra'
    });
    logResult('Extras', 'UPDATE', 'PASS', `Extra ${extraId} updated successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Extras', 'UPDATE', 'FAIL', error.message, 0);
  }

  // TEST 4: DELETE
  try {
    const start = Date.now();
    await apiCall(`/extras?id=${extraId}`, 'DELETE');
    logResult('Extras', 'DELETE', 'PASS', `Extra ${extraId} archived successfully`, Date.now() - start);
  } catch (error: any) {
    logResult('Extras', 'DELETE', 'FAIL', error.message, 0);
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================
export async function runAllCRUDTests() {
  console.clear();
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE CRUD OPERATIONS TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  const startTime = Date.now();

  await testHotelsCRUD();
  await testToursCRUD();
  await testVehiclesCRUD();
  await testGuidesCRUD();
  await testEntranceFeesCRUD();
  await testMealsCRUD();
  await testExtrasCRUD();

  const totalTime = Date.now() - startTime;

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${passRate}%`);
  console.log(`Total Duration: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);

  // Group results by category
  console.log('\n📋 Results by Category:\n');
  const categories = ['Hotels', 'Tours', 'Vehicles', 'Guides', 'Entrance Fees', 'Meals', 'Extras'];
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    const categoryPassed = categoryResults.filter(r => r.status === 'PASS').length;
    const categoryTotal = categoryResults.length;
    const icon = categoryPassed === categoryTotal ? '✅' : '⚠️';
    console.log(`${icon} ${category}: ${categoryPassed}/${categoryTotal} tests passed`);
  });

  // Show failed tests details
  if (failedTests > 0) {
    console.log('\n❌ Failed Tests Details:\n');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`[${r.category}] ${r.operation}: ${r.message}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`Completed at: ${new Date().toLocaleString()}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  return {
    totalTests,
    passedTests,
    failedTests,
    passRate: parseFloat(passRate),
    totalTime,
    results
  };
}

// Auto-run when loaded in browser console or as module
if (typeof window !== 'undefined') {
  console.log('CRUD Test Suite loaded! Run runAllCRUDTests() to start testing.');
}
