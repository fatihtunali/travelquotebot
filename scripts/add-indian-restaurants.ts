/**
 * Add Indian Restaurants to Turkey Meal Pricing
 * Popular Indian restaurants across major Turkish cities
 */

import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || '134.209.137.11',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'tqa_db',
  waitForConnections: true,
  connectionLimit: 10,
});

interface Restaurant {
  restaurant_name: string;
  city: string;
  meal_type: 'Lunch' | 'Dinner' | 'Both';
  adult_lunch_price: number | null;
  child_lunch_price: number | null;
  adult_dinner_price: number | null;
  child_dinner_price: number | null;
  menu_description: string;
  notes: string;
}

const indianRestaurants: Restaurant[] = [
  // Istanbul Indian Restaurants (8)
  { restaurant_name: 'Dubb Indian Restaurant', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 18.00, child_lunch_price: 9.00, adult_dinner_price: 22.00, child_dinner_price: 11.00, menu_description: 'Authentic North Indian cuisine, tandoori specialties and curries', notes: 'Sultanahmet area, popular with tourists since 2000' },
  { restaurant_name: 'Musafir Indian Restaurant', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 20.00, child_lunch_price: 10.00, adult_dinner_price: 25.00, child_dinner_price: 13.00, menu_description: 'Traditional Indian flavors, biryani and tandoori grills', notes: 'Established 2004, vegetarian options available' },
  { restaurant_name: 'Tandoori Restaurant Istanbul', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 16.00, child_lunch_price: 8.00, adult_dinner_price: 20.00, child_dinner_price: 10.00, menu_description: 'Clay oven tandoori dishes, naan breads and tikka masala', notes: 'Affordable prices, family-friendly' },
  { restaurant_name: 'Taj Mahal Istanbul', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 19.00, child_lunch_price: 10.00, adult_dinner_price: 24.00, child_dinner_price: 12.00, menu_description: 'Classic Indian curries, biryanis and vegetarian thalis', notes: 'Traditional decor, authentic recipes' },
  { restaurant_name: 'Karachi Darbar', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 17.00, child_lunch_price: 9.00, adult_dinner_price: 21.00, child_dinner_price: 11.00, menu_description: 'Pakistani and North Indian cuisine, halal certified', notes: 'Generous portions, spicy options available' },
  { restaurant_name: 'Delhi Darbar Istanbul', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 18.00, child_lunch_price: 9.00, adult_dinner_price: 23.00, child_dinner_price: 12.00, menu_description: 'Delhi street food and classic curries, vegetarian friendly', notes: 'Casual dining, takeaway available' },
  { restaurant_name: 'Bombay Masala Istanbul', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 21.00, child_lunch_price: 11.00, adult_dinner_price: 26.00, child_dinner_price: 13.00, menu_description: 'Mumbai street food, masala dosas and butter chicken', notes: 'Highly rated, authentic spices' },
  { restaurant_name: 'Little India Restaurant', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 15.00, child_lunch_price: 8.00, adult_dinner_price: 19.00, child_dinner_price: 10.00, menu_description: 'Home-style Indian cooking, daily lunch specials', notes: 'Budget-friendly, local favorite' },

  // Antalya Indian Restaurants (4)
  { restaurant_name: 'India Gate Antalya', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 20.00, child_lunch_price: 10.00, adult_dinner_price: 25.00, child_dinner_price: 13.00, menu_description: '83 vegetarian and non-vegetarian dishes, North and South Indian', notes: 'Chain restaurant, consistent quality' },
  { restaurant_name: 'Maharaja Indian Restaurant', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 18.00, child_lunch_price: 9.00, adult_dinner_price: 22.00, child_dinner_price: 11.00, menu_description: 'Traditional Indian curries and tandoori, generous portions', notes: 'Serving 20+ years, affordable prices' },
  { restaurant_name: 'Taj Mahal Antalya', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 19.00, child_lunch_price: 10.00, adult_dinner_price: 24.00, child_dinner_price: 12.00, menu_description: 'Delicious curries, naan bread and biryanis', notes: 'Tourist-friendly, English menu' },
  { restaurant_name: 'Indian Gate Restaurant', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 17.00, child_lunch_price: 9.00, adult_dinner_price: 21.00, child_dinner_price: 11.00, menu_description: 'Authentic flavors, cozy ambiance and top service', notes: 'Rave reviews, vegetarian options' },

  // Cappadocia Indian Restaurants (3)
  { restaurant_name: 'India Gate Cappadocia', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 22.00, child_lunch_price: 11.00, adult_dinner_price: 27.00, child_dinner_price: 14.00, menu_description: 'Full Indian menu with regional specialties', notes: 'Göreme location, chain quality' },
  { restaurant_name: 'Pukka Indian Restaurant', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 20.00, child_lunch_price: 10.00, adult_dinner_price: 25.00, child_dinner_price: 13.00, menu_description: 'Authentic Indian cuisine with accommodating chef', notes: 'Highly rated, fresh ingredients' },
  { restaurant_name: 'Dalchini Cappadocia', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 21.00, child_lunch_price: 11.00, adult_dinner_price: 26.00, child_dinner_price: 13.00, menu_description: 'Serene atmosphere with authentic Indian dishes', notes: 'Top-rated, elegant setting' },

  // Bodrum Indian Restaurants (4)
  { restaurant_name: 'Bombay Masala Bodrum', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 22.00, child_lunch_price: 11.00, adult_dinner_price: 28.00, child_dinner_price: 14.00, menu_description: 'Butter Chicken, Rogan Josh and Paneer Tikka classics', notes: 'Widely regarded as best in Bodrum' },
  { restaurant_name: 'Bombay Cottage', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 20.00, child_lunch_price: 10.00, adult_dinner_price: 25.00, child_dinner_price: 13.00, menu_description: 'Authentic Indian dishes at reasonable prices', notes: '4.7 Google rating, popular choice' },
  { restaurant_name: 'Taj Mahal Bodrum', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 21.00, child_lunch_price: 11.00, adult_dinner_price: 26.00, child_dinner_price: 13.00, menu_description: 'Chicken Tikka Masala, Vegetable Korma and Lamb Biryani', notes: 'Marina location, tourist-friendly' },
  { restaurant_name: 'The Bombay Indian Curry House', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 23.00, child_lunch_price: 12.00, adult_dinner_price: 29.00, child_dinner_price: 15.00, menu_description: 'Full range of Indian curries and tandoori specialties', notes: 'Upscale option, quality ingredients' },

  // Izmir Indian Restaurants (2)
  { restaurant_name: 'Bombay Palace Izmir', city: 'Izmir', meal_type: 'Both', adult_lunch_price: 18.00, child_lunch_price: 9.00, adult_dinner_price: 23.00, child_dinner_price: 12.00, menu_description: 'North Indian cuisine, tandoori and curry specialties', notes: 'Alsancak area, popular with expats' },
  { restaurant_name: 'Spice Route Indian Restaurant', city: 'Izmir', meal_type: 'Both', adult_lunch_price: 19.00, child_lunch_price: 10.00, adult_dinner_price: 24.00, child_dinner_price: 12.00, menu_description: 'Authentic spices, vegetarian and non-vegetarian options', notes: 'Modern setting, delivery available' },
];

async function importIndianRestaurants() {
  console.log('🍛 Importing Indian restaurant pricing data...\n');

  const [users]: any = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    ['info@funnytourism.com']
  );
  const createdBy = users[0]?.id || 1;

  let imported = 0;
  const seasons = [
    { name: 'Winter 2025-26', start: '2025-11-01', end: '2026-03-14' },
    { name: 'Summer 2026', start: '2026-03-15', end: '2026-10-31' }
  ];

  for (const season of seasons) {
    for (const restaurant of indianRestaurants) {
      await pool.query(
        `INSERT INTO meal_pricing (
          organization_id, restaurant_name, city, meal_type, season_name, start_date, end_date, currency,
          adult_lunch_price, child_lunch_price, adult_dinner_price, child_dinner_price,
          menu_description, created_by, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          5, // Funny Tourism
          restaurant.restaurant_name,
          restaurant.city,
          restaurant.meal_type,
          season.name,
          season.start,
          season.end,
          'EUR',
          restaurant.adult_lunch_price,
          restaurant.child_lunch_price,
          restaurant.adult_dinner_price,
          restaurant.child_dinner_price,
          restaurant.menu_description,
          createdBy,
          restaurant.notes,
          'active'
        ]
      );

      imported++;
    }
  }

  console.log(`✅ Successfully imported ${imported} Indian restaurant pricing records!`);
  console.log(`📊 ${indianRestaurants.length} Indian restaurants × ${seasons.length} seasons\n`);

  // Show summary by city
  const cityCounts: Record<string, number> = {};
  indianRestaurants.forEach(r => {
    cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
  });

  console.log('📍 Indian Restaurants by City:');
  Object.entries(cityCounts).forEach(([city, count]) => {
    console.log(`   ${city}: ${count} restaurants`);
  });

  await pool.end();
}

importIndianRestaurants().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
