'use client';

import dynamic from 'next/dynamic';

interface Hotel {
  id: number;
  hotel_name: string;
  city: string;
  latitude: number;
  longitude: number;
  star_rating: number;
}

interface ItineraryMapProps {
  hotels: Hotel[];
}

// Dynamically import the map component with SSR disabled
const ItineraryMapClient = dynamic(
  () => import('./ItineraryMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600">
          <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            🗺️ Your Journey Map
          </h3>
          <p className="text-blue-100 text-sm">
            Loading interactive map...
          </p>
        </div>
        <div className="w-full h-96 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    )
  }
);

export default function ItineraryMap({ hotels }: ItineraryMapProps) {
  // Filter hotels with valid coordinates
  const validHotels = hotels.filter(h => h.latitude && h.longitude);

  if (validHotels.length === 0) {
    return null; // Don't show map if no valid coordinates
  }

  return <ItineraryMapClient hotels={validHotels} />;
}
