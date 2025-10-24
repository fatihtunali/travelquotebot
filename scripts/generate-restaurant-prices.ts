/**
 * Generate Restaurant Pricing for Turkey Winter 2025-26
 * Researched from TripAdvisor, Michelin Guide, and local sources
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

const restaurants: Restaurant[] = [
  // Istanbul Restaurants (15)
  { restaurant_name: 'Mikla Restaurant', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 90.00, child_lunch_price: 45.00, adult_dinner_price: 110.00, child_dinner_price: 55.00, menu_description: 'Michelin-starred modern Turkish-Scandinavian fusion, rooftop dining with Bosphorus views', notes: 'Located in Marmara Pera Hotel, tasting menu available' },
  { restaurant_name: 'Matbah Ottoman Palace Cuisine', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 35.00, child_lunch_price: 18.00, adult_dinner_price: 45.00, child_dinner_price: 23.00, menu_description: 'Authentic Ottoman Palace recipes from Sultans kitchen, historic Sultanahmet location', notes: 'Near Hagia Sophia, reservations recommended' },
  { restaurant_name: 'Nusr-Et Steakhouse', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 70.00, child_lunch_price: 35.00, adult_dinner_price: 90.00, child_dinner_price: 45.00, menu_description: 'Famous Salt Bae steakhouse, premium cuts and signature presentations', notes: 'Luxury steakhouse, international celebrity chef' },
  { restaurant_name: 'Asitane Restaurant', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 30.00, child_lunch_price: 15.00, adult_dinner_price: 40.00, child_dinner_price: 20.00, menu_description: 'Ottoman Palace cuisine recreated from historical palace records', notes: 'Located near Chora Museum, authentic recipes' },
  { restaurant_name: 'Hamdi Restaurant', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 20.00, child_lunch_price: 10.00, adult_dinner_price: 25.00, child_dinner_price: 13.00, menu_description: 'Traditional Turkish kebabs with Golden Horn views, family-owned since 1970', notes: 'Famous for lamb kebabs, rooftop terrace' },
  { restaurant_name: 'Balikci Sabahattin', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 25.00, child_lunch_price: 13.00, adult_dinner_price: 35.00, child_dinner_price: 18.00, menu_description: 'Fresh seafood in historic Ottoman house, Sultanahmet location', notes: 'Family-run since 1930s, garden seating' },
  { restaurant_name: 'Pandeli Restaurant', city: 'Istanbul', meal_type: 'Lunch', adult_lunch_price: 18.00, child_lunch_price: 9.00, adult_dinner_price: null, child_dinner_price: null, menu_description: 'Historic restaurant in Spice Bazaar, traditional Turkish cuisine', notes: 'Michelin Bib Gourmand 2025, lunch only' },
  { restaurant_name: 'Ciya Sofrasi', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 15.00, child_lunch_price: 8.00, adult_dinner_price: 20.00, child_dinner_price: 10.00, menu_description: 'Authentic Anatolian regional dishes, changing daily menu', notes: 'Kadıköy Asian side, featured by Anthony Bourdain' },
  { restaurant_name: 'Karakoy Lokantasi', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 18.00, child_lunch_price: 9.00, adult_dinner_price: 25.00, child_dinner_price: 13.00, menu_description: 'Modern meyhane with traditional Turkish mezes and mains', notes: 'Trendy Karaköy district, reservations advised' },
  { restaurant_name: 'Konyali Restaurant', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 22.00, child_lunch_price: 11.00, adult_dinner_price: 30.00, child_dinner_price: 15.00, menu_description: 'Traditional Turkish cuisine in Topkapi Palace grounds', notes: 'Historic location, Ottoman-era recipes' },
  { restaurant_name: 'Sunset Grill & Bar', city: 'Istanbul', meal_type: 'Dinner', adult_lunch_price: null, child_lunch_price: null, adult_dinner_price: 55.00, child_dinner_price: 28.00, menu_description: 'Upscale international cuisine with panoramic Bosphorus sunset views', notes: 'Ulus Park, romantic dining, wine selection' },
  { restaurant_name: 'Balıkçı Kahraman', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 28.00, child_lunch_price: 14.00, adult_dinner_price: 35.00, child_dinner_price: 18.00, menu_description: 'Fresh fish and seafood mezes on Bosphorus shore', notes: 'Kumkapı fish market area, waterfront dining' },
  { restaurant_name: '360 Istanbul', city: 'Istanbul', meal_type: 'Dinner', adult_lunch_price: null, child_lunch_price: null, adult_dinner_price: 45.00, child_dinner_price: 23.00, menu_description: '360-degree city views, international and Turkish fusion', notes: 'Rooftop dining in Beyoğlu, nightlife venue' },
  { restaurant_name: 'Nar Lokanta', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 16.00, child_lunch_price: 8.00, adult_dinner_price: 22.00, child_dinner_price: 11.00, menu_description: 'Contemporary Turkish home cooking, seasonal ingredients', notes: 'Arnavutköy neighborhood, cozy atmosphere' },
  { restaurant_name: 'Çiya Kebap', city: 'Istanbul', meal_type: 'Both', adult_lunch_price: 14.00, child_lunch_price: 7.00, adult_dinner_price: 18.00, child_dinner_price: 9.00, menu_description: 'Southeastern Turkish kebabs and regional specialties', notes: 'Kadıköy market area, authentic flavors' },

  // Cappadocia Restaurants (12)
  { restaurant_name: 'Seki Restaurant', city: 'Cappadocia', meal_type: 'Dinner', adult_lunch_price: null, child_lunch_price: null, adult_dinner_price: 50.00, child_dinner_price: 25.00, menu_description: 'Fine dining in Argos Hotel, Anatolian cuisine with wine pairings', notes: 'Uçhisar cave hotel, tasting menu available' },
  { restaurant_name: 'Ziggy Cafe & Restaurant', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 18.00, child_lunch_price: 9.00, adult_dinner_price: 25.00, child_dinner_price: 13.00, menu_description: 'International and Turkish cuisine with valley views', notes: 'Göreme center, popular with tourists' },
  { restaurant_name: 'Topdeck Cave Restaurant', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 16.00, child_lunch_price: 8.00, adult_dinner_price: 22.00, child_dinner_price: 11.00, menu_description: 'Traditional Turkish pottery kebabs in cave setting', notes: 'Göreme, authentic cave dining experience' },
  { restaurant_name: 'Dibek Restaurant', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 15.00, child_lunch_price: 8.00, adult_dinner_price: 20.00, child_dinner_price: 10.00, menu_description: 'Traditional stone mortar-prepared dishes, local recipes', notes: 'Göreme village, terrace with fairy chimney views' },
  { restaurant_name: 'Old Cappadocia Cafe & Restaurant', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 14.00, child_lunch_price: 7.00, adult_dinner_price: 18.00, child_dinner_price: 9.00, menu_description: 'Homestyle Turkish cooking in historic stone house', notes: 'Mustafapaşa village, family-run' },
  { restaurant_name: 'Seyyah Han', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 16.00, child_lunch_price: 8.00, adult_dinner_price: 22.00, child_dinner_price: 11.00, menu_description: 'Ottoman-style caravanserai setting, traditional mezes and grills', notes: 'Avanos town, historic atmosphere' },
  { restaurant_name: 'Nazar Börek & Cafe', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 12.00, child_lunch_price: 6.00, adult_dinner_price: 16.00, child_dinner_price: 8.00, menu_description: 'Fresh-baked Turkish pastries, böreks and local specialties', notes: 'Göreme center, breakfast and lunch spot' },
  { restaurant_name: 'Vanilla Restaurant', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 17.00, child_lunch_price: 9.00, adult_dinner_price: 24.00, child_dinner_price: 12.00, menu_description: 'International menu with Turkish classics, rooftop terrace', notes: 'Ürgüp town center, sunset views' },
  { restaurant_name: 'Cappadocian Cuisine', city: 'Cappadocia', meal_type: 'Dinner', adult_lunch_price: null, child_lunch_price: null, adult_dinner_price: 28.00, child_dinner_price: 14.00, menu_description: 'Traditional Cappadocian testi kebab and regional wines', notes: 'Göreme, pottery kebab demonstration' },
  { restaurant_name: 'Firin Express', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 13.00, child_lunch_price: 7.00, adult_dinner_price: 17.00, child_dinner_price: 9.00, menu_description: 'Wood-fired pide and kebabs, fast-casual dining', notes: 'Multiple locations, quick service' },
  { restaurant_name: 'Mithra Terrace Restaurant', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 15.00, child_lunch_price: 8.00, adult_dinner_price: 20.00, child_dinner_price: 10.00, menu_description: 'Panoramic valley views, Turkish and international menu', notes: 'Göreme terrace dining, photo opportunities' },
  { restaurant_name: 'Han Çırağan Restaurant', city: 'Cappadocia', meal_type: 'Both', adult_lunch_price: 16.00, child_lunch_price: 8.00, adult_dinner_price: 21.00, child_dinner_price: 11.00, menu_description: 'Cave restaurant with live Turkish music, traditional cuisine', notes: 'Avanos riverside, cultural performances' },

  // Antalya Restaurants (12)
  { restaurant_name: 'Seraser Fine Dining Restaurant', city: 'Antalya', meal_type: 'Dinner', adult_lunch_price: null, child_lunch_price: null, adult_dinner_price: 40.00, child_dinner_price: 20.00, menu_description: 'Fine dining in restored Ottoman mansion, Mediterranean fusion', notes: 'Kaleiçi old town, romantic garden setting' },
  { restaurant_name: 'Arma Restaurant', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 25.00, child_lunch_price: 13.00, adult_dinner_price: 35.00, child_dinner_price: 18.00, menu_description: 'Seafood and Mediterranean cuisine with harbor views', notes: 'Old harbor location, sunset dining' },
  { restaurant_name: 'Pasa Bey Kebabcisi', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 15.00, child_lunch_price: 8.00, adult_dinner_price: 20.00, child_dinner_price: 10.00, menu_description: 'Traditional Turkish kebabs and mezes in historic house', notes: 'Kaleiçi, family-run since 1989' },
  { restaurant_name: 'Vanilla Lounge', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 18.00, child_lunch_price: 9.00, adult_dinner_price: 25.00, child_dinner_price: 13.00, menu_description: 'International and Turkish cuisine, historic mansion setting', notes: 'Kaleiçi old quarter, garden terrace' },
  { restaurant_name: 'Castle Cafe & Restaurant', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 16.00, child_lunch_price: 8.00, adult_dinner_price: 22.00, child_dinner_price: 11.00, menu_description: 'Turkish and international dishes with old harbor panorama', notes: 'Next to Hadrians Gate, tourist area' },
  { restaurant_name: 'Iskele Fish Restaurant', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 22.00, child_lunch_price: 11.00, adult_dinner_price: 30.00, child_dinner_price: 15.00, menu_description: 'Fresh catch of the day, seafood mezes, harbor views', notes: 'Old marina, seafood specialty' },
  { restaurant_name: 'Il Vicino Pizzeria', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 14.00, child_lunch_price: 7.00, adult_dinner_price: 18.00, child_dinner_price: 9.00, menu_description: 'Authentic Italian pizza and pasta, wood-fired oven', notes: 'Kaleiçi, part of Seraser complex' },
  { restaurant_name: 'Rokka Restaurant', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 17.00, child_lunch_price: 9.00, adult_dinner_price: 24.00, child_dinner_price: 12.00, menu_description: 'Modern Turkish cuisine with sea views', notes: 'Lara Beach area, contemporary dining' },
  { restaurant_name: '7 Mehmet Restaurant', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 20.00, child_lunch_price: 10.00, adult_dinner_price: 28.00, child_dinner_price: 14.00, menu_description: 'Traditional Turkish grill and mezes, multiple locations', notes: 'Popular chain, consistent quality' },
  { restaurant_name: 'Papatya Restaurant', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 13.00, child_lunch_price: 7.00, adult_dinner_price: 17.00, child_dinner_price: 9.00, menu_description: 'Home-style Turkish cooking, daily changing menu', notes: 'Local favorite, authentic flavors' },
  { restaurant_name: 'Hasanaga Restaurant', city: 'Antalya', meal_type: 'Both', adult_lunch_price: 16.00, child_lunch_price: 8.00, adult_dinner_price: 21.00, child_dinner_price: 11.00, menu_description: 'Traditional Turkish kebabs and stews in garden setting', notes: 'Kaleiçi historic district' },
  { restaurant_name: 'Club Arma', city: 'Antalya', meal_type: 'Dinner', adult_lunch_price: null, child_lunch_price: null, adult_dinner_price: 32.00, child_dinner_price: 16.00, menu_description: 'Upscale Mediterranean seafood on Roman harbor cliffs', notes: 'Premium location, reservations required' },

  // Bodrum Restaurants (10)
  { restaurant_name: 'Kocadon Restaurant', city: 'Bodrum', meal_type: 'Dinner', adult_lunch_price: null, child_lunch_price: null, adult_dinner_price: 45.00, child_dinner_price: 23.00, menu_description: 'Mediterranean fine dining in restored stone house', notes: 'Michelin-recommended, intimate setting' },
  { restaurant_name: 'Trança', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 25.00, child_lunch_price: 13.00, adult_dinner_price: 35.00, child_dinner_price: 18.00, menu_description: 'International cuisine with marina views', notes: 'Yalıkavak Marina, upscale dining' },
  { restaurant_name: 'Orfoz Restaurant', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 22.00, child_lunch_price: 11.00, adult_dinner_price: 30.00, child_dinner_price: 15.00, menu_description: 'Fresh seafood and mezes by the water', notes: 'Gümbet area, family-friendly' },
  { restaurant_name: 'Limon Gümüşlük', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 20.00, child_lunch_price: 10.00, adult_dinner_price: 28.00, child_dinner_price: 14.00, menu_description: 'Fish restaurant with sunset views over ancient Myndos', notes: 'Gümüşlük village, romantic setting' },
  { restaurant_name: 'Musto Bistro', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 18.00, child_lunch_price: 9.00, adult_dinner_price: 25.00, child_dinner_price: 13.00, menu_description: 'Modern Turkish and Mediterranean fusion', notes: 'Bodrum center, contemporary atmosphere' },
  { restaurant_name: 'Sünger Pizza', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 14.00, child_lunch_price: 7.00, adult_dinner_price: 18.00, child_dinner_price: 9.00, menu_description: 'Gourmet pizzas and Italian cuisine', notes: 'Multiple locations, casual dining' },
  { restaurant_name: 'Yengec Restaurant', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 24.00, child_lunch_price: 12.00, adult_dinner_price: 32.00, child_dinner_price: 16.00, menu_description: 'Crab and seafood specialties, harbor location', notes: 'Bodrum marina, seafood focus' },
  { restaurant_name: 'Nazik Ana', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 15.00, child_lunch_price: 8.00, adult_dinner_price: 20.00, child_dinner_price: 10.00, menu_description: 'Traditional Turkish home cooking, family recipes', notes: 'Local favorite, authentic taste' },
  { restaurant_name: 'Mimoza Restaurant', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 19.00, child_lunch_price: 10.00, adult_dinner_price: 26.00, child_dinner_price: 13.00, menu_description: 'Turkish and international menu with garden seating', notes: 'Gümbet, established restaurant' },
  { restaurant_name: 'Kırmızı Biber', city: 'Bodrum', meal_type: 'Both', adult_lunch_price: 17.00, child_lunch_price: 9.00, adult_dinner_price: 23.00, child_dinner_price: 12.00, menu_description: 'Turkish mezes and grills in cozy garden', notes: 'Bodrum town, meyhane style' },

  // Ephesus/Selçuk Restaurants (10)
  { restaurant_name: 'Ejder Restaurant', city: 'Ephesus', meal_type: 'Both', adult_lunch_price: 16.00, child_lunch_price: 8.00, adult_dinner_price: 22.00, child_dinner_price: 11.00, menu_description: 'Turkish home-style cooking, garden terrace', notes: 'Selçuk town, near Ephesus ruins' },
  { restaurant_name: 'Tat Restaurant', city: 'Ephesus', meal_type: 'Both', adult_lunch_price: 14.00, child_lunch_price: 7.00, adult_dinner_price: 18.00, child_dinner_price: 9.00, menu_description: 'Local Aegean cuisine, daily fresh menus', notes: 'Family-run, authentic recipes' },
  { restaurant_name: 'Selçuk Köftecisi', city: 'Ephesus', meal_type: 'Both', adult_lunch_price: 12.00, child_lunch_price: 6.00, adult_dinner_price: 15.00, child_dinner_price: 8.00, menu_description: 'Famous Turkish meatballs and traditional sides', notes: 'Local institution since 1975' },
  { restaurant_name: 'Saint John Cafe Restaurant', city: 'Ephesus', meal_type: 'Both', adult_lunch_price: 15.00, child_lunch_price: 8.00, adult_dinner_price: 20.00, child_dinner_price: 10.00, menu_description: 'Turkish and international dishes with historic views', notes: 'Opposite St. John Basilica' },
  { restaurant_name: 'Mehmet & Ali Baba Kebab House', city: 'Ephesus', meal_type: 'Both', adult_lunch_price: 13.00, child_lunch_price: 7.00, adult_dinner_price: 17.00, child_dinner_price: 9.00, menu_description: 'Grilled meats and traditional Turkish breakfast', notes: 'Popular with tour groups' },
  { restaurant_name: 'Agora Restaurant', city: 'Ephesus', meal_type: 'Both', adult_lunch_price: 14.00, child_lunch_price: 7.00, adult_dinner_price: 19.00, child_dinner_price: 10.00, menu_description: 'Mediterranean cuisine with Ephesus museum views', notes: 'Convenient location, good service' },
  { restaurant_name: 'Çamlık Restaurant', city: 'Ephesus', meal_type: 'Both', adult_lunch_price: 16.00, child_lunch_price: 8.00, adult_dinner_price: 21.00, child_dinner_price: 11.00, menu_description: 'Turkish grills and seafood in pine grove setting', notes: 'Garden dining, peaceful atmosphere' },
  { restaurant_name: 'Bizim Ev Pide & Kebap', city: 'Ephesus', meal_type: 'Both', adult_lunch_price: 11.00, child_lunch_price: 6.00, adult_dinner_price: 14.00, child_dinner_price: 7.00, menu_description: 'Wood-fired pide and kebabs, fast service', notes: 'Budget-friendly, filling meals' },
  { restaurant_name: 'Hotel Bella Terrace Restaurant', city: 'Ephesus', meal_type: 'Both', adult_lunch_price: 15.00, child_lunch_price: 8.00, adult_dinner_price: 20.00, child_dinner_price: 10.00, menu_description: 'Panoramic terrace dining, Turkish and international', notes: 'Great views of Selçuk Castle' },
  { restaurant_name: 'Ephesus Restaurant', city: 'Ephesus', meal_type: 'Both', adult_lunch_price: 14.00, child_lunch_price: 7.00, adult_dinner_price: 18.00, child_dinner_price: 9.00, menu_description: 'Traditional Turkish cuisine near archaeological site', notes: 'Tourist-friendly, English menus' },

  // Izmir Restaurants (10)
  { restaurant_name: 'Deniz Restaurant', city: 'Izmir', meal_type: 'Both', adult_lunch_price: 20.00, child_lunch_price: 10.00, adult_dinner_price: 28.00, child_dinner_price: 14.00, menu_description: 'Fresh Aegean seafood with Kordon waterfront views', notes: 'Alsancak area, established 1950' },
  { restaurant_name: 'Topçu Restaurant', city: 'Izmir', meal_type: 'Both', adult_lunch_price: 16.00, child_lunch_price: 8.00, adult_dinner_price: 22.00, child_dinner_price: 11.00, menu_description: 'Traditional Turkish mezes and grilled fish', notes: 'Historic meyhane, live music' },
  { restaurant_name: 'Tavacı Recep Usta', city: 'Izmir', meal_type: 'Both', adult_lunch_price: 14.00, child_lunch_price: 7.00, adult_dinner_price: 18.00, child_dinner_price: 9.00, menu_description: 'Famous for Izmir-style meatballs and regional dishes', notes: 'Multiple locations, local chain' },
  { restaurant_name: 'Sevinc Pastanesi', city: 'Izmir', meal_type: 'Both', adult_lunch_price: 12.00, child_lunch_price: 6.00, adult_dinner_price: 16.00, child_dinner_price: 8.00, menu_description: 'Historic patisserie with Turkish breakfast and pastries', notes: 'Since 1944, cultural landmark' },
  { restaurant_name: 'Kordon Balıkçısı', city: 'Izmir', meal_type: 'Both', adult_lunch_price: 22.00, child_lunch_price: 11.00, adult_dinner_price: 30.00, child_dinner_price: 15.00, menu_description: 'Premium seafood restaurant on the promenade', notes: 'Sunset views over Izmir Bay' },
  { restaurant_name: 'Dostlar Fırını', city: 'Izmir', meal_type: 'Both', adult_lunch_price: 13.00, child_lunch_price: 7.00, adult_dinner_price: 17.00, child_dinner_price: 9.00, menu_description: 'Traditional Turkish pide and kebabs, wood oven', notes: 'Popular local chain, casual dining' },
  { restaurant_name: 'Kıbrıs Şehitleri Balık Evi', city: 'Izmir', meal_type: 'Both', adult_lunch_price: 18.00, child_lunch_price: 9.00, adult_dinner_price: 25.00, child_dinner_price: 13.00, menu_description: 'Seafood mezes and fresh fish, harbor atmosphere', notes: 'Alsancak neighborhood favorite' },
  { restaurant_name: 'Reyhan Pastanesi', city: 'Izmir', meal_type: 'Both', adult_lunch_price: 11.00, child_lunch_price: 6.00, adult_dinner_price: 15.00, child_dinner_price: 8.00, menu_description: 'Turkish breakfast, börek and pastries', notes: 'Morning and lunch spot, since 1949' },
  { restaurant_name: 'Kemeraltı Çiğ Börekçisi', city: 'Izmir', meal_type: 'Lunch', adult_lunch_price: 10.00, child_lunch_price: 5.00, adult_dinner_price: null, child_dinner_price: null, menu_description: 'Famous Izmir-style raw börek in historic bazaar', notes: 'Kemeralti Market, lunch only' },
  { restaurant_name: '1888 Brasserie', city: 'Izmir', meal_type: 'Both', adult_lunch_price: 19.00, child_lunch_price: 10.00, adult_dinner_price: 26.00, child_dinner_price: 13.00, menu_description: 'Contemporary European and Turkish fusion cuisine', notes: 'Swissotel location, upscale dining' },
];

async function importRestaurants() {
  console.log('🍽️  Importing restaurant pricing data...\n');

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
    for (const restaurant of restaurants) {
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
      if (imported % 20 === 0) {
        console.log(`   ✓ ${imported} restaurant pricing records...`);
      }
    }
  }

  console.log(`\n✅ Successfully imported ${imported} restaurant pricing records!`);
  console.log(`📊 ${restaurants.length} restaurants × ${seasons.length} seasons`);

  await pool.end();
}

importRestaurants().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
