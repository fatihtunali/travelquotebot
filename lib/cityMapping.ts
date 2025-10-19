/**
 * City/District Mapping Utility
 * Normalizes Turkish city districts and neighborhoods to their parent cities
 */

export const CITY_MAPPINGS: Record<string, string> = {
  // Istanbul districts
  'taksim': 'Istanbul',
  'sultanahmet': 'Istanbul',
  'beyoğlu': 'Istanbul',
  'beyoglu': 'Istanbul',
  'beşiktaş': 'Istanbul',
  'besiktas': 'Istanbul',
  'kadıköy': 'Istanbul',
  'kadikoy': 'Istanbul',
  'üsküdar': 'Istanbul',
  'uskudar': 'Istanbul',
  'fatih': 'Istanbul',
  'eminönü': 'Istanbul',
  'eminonu': 'Istanbul',
  'şişli': 'Istanbul',
  'sisli': 'Istanbul',
  'mecidiyeköy': 'Istanbul',
  'mecidiyekoy': 'Istanbul',
  'levent': 'Istanbul',
  'maslak': 'Istanbul',
  'bakırköy': 'Istanbul',
  'bakirkoy': 'Istanbul',
  'ataturk airport area': 'Istanbul',
  'old city': 'Istanbul',
  'bosphorus': 'Istanbul',

  // Cappadocia towns/districts
  'göreme': 'Cappadocia',
  'goreme': 'Cappadocia',
  'uçhisar': 'Cappadocia',
  'uchisa': 'Cappadocia',
  'ürgüp': 'Cappadocia',
  'urgup': 'Cappadocia',
  'avanos': 'Cappadocia',
  'ortahisar': 'Cappadocia',
  'çavuşin': 'Cappadocia',
  'cavusin': 'Cappadocia',
  'mustafapaşa': 'Cappadocia',
  'mustafapasa': 'Cappadocia',
  'nevşehir': 'Cappadocia',
  'nevsehir': 'Cappadocia',

  // Pamukkale area
  'pamukkale': 'Denizli',

  // Ephesus area
  'kuşadası': 'Selçuk',
  'kusadasi': 'Selçuk',
  'ephesus': 'Selçuk',

  // Antalya districts
  'lara': 'Antalya',
  'kaleici': 'Antalya',
  'kaleiçi': 'Antalya',
  'belek': 'Antalya',
  'side': 'Antalya',
  'kemer': 'Antalya',

  // Izmir districts
  'alsancak': 'Izmir',
  'konak': 'Izmir',
  'karşıyaka': 'Izmir',
  'karsiyaka': 'Izmir',
  'çeşme': 'Izmir',
  'cesme': 'Izmir',
  'alaçatı': 'Izmir',
  'alacati': 'Izmir',
};

/**
 * Normalize a city/district name to its parent city
 * @param input - City or district name
 * @returns Normalized parent city name
 */
export function normalizeCity(input: string): string {
  if (!input) return input;

  const normalized = input.toLowerCase().trim();

  // Check if it's a known district
  if (CITY_MAPPINGS[normalized]) {
    return CITY_MAPPINGS[normalized];
  }

  // Return capitalized original if no mapping found
  return input.charAt(0).toUpperCase() + input.slice(1);
}

/**
 * Normalize an array of cities
 * @param cities - Array of city/district names
 * @returns Array of normalized parent city names (unique)
 */
export function normalizeCities(cities: string[]): string[] {
  const normalized = cities.map(city => normalizeCity(city));
  return [...new Set(normalized)]; // Remove duplicates
}

/**
 * City options for frontend forms
 * Includes both main cities and popular districts
 */
export const CITY_OPTIONS = [
  // Main cities
  'Istanbul',
  'Cappadocia',
  'Antalya',
  'Izmir',
  'Bodrum',
  'Fethiye',
  'Marmaris',
  'Pamukkale',
  'Selçuk', // Ephesus area
  'Ankara',

  // Istanbul districts (optional - for detailed selection)
  'Sultanahmet',
  'Taksim',
  'Beyoğlu',
  'Beşiktaş',

  // Cappadocia towns (optional - for detailed selection)
  'Göreme',
  'Uçhisar',
  'Ürgüp',
  'Avanos',

  // Kusadasi / Ephesus area
  'Kuşadası',
];

/**
 * Grouped city options for better UX
 */
export const GROUPED_CITY_OPTIONS = [
  {
    region: 'Istanbul',
    cities: ['Istanbul', 'Sultanahmet', 'Taksim', 'Beyoğlu', 'Beşiktaş']
  },
  {
    region: 'Cappadocia',
    cities: ['Cappadocia', 'Göreme', 'Uçhisar', 'Ürgüp', 'Avanos']
  },
  {
    region: 'Aegean Coast',
    cities: ['Izmir', 'Selçuk', 'Kuşadası', 'Bodrum', 'Pamukkale']
  },
  {
    region: 'Mediterranean Coast',
    cities: ['Antalya', 'Fethiye', 'Marmaris']
  },
  {
    region: 'Other',
    cities: ['Ankara']
  }
];
