'use client';

import { useEffect, useRef } from 'react';

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

export default function ItineraryMap({ hotels }: ItineraryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // ⚠️ GOOGLE MAPS API DISABLED TO PREVENT OVERCHARGES
    // The map functionality is temporarily disabled to avoid API costs
    console.warn('⚠️ Google Maps API is DISABLED to prevent overcharges');
    console.warn('To re-enable, set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local');
    return; // Exit early to prevent map loading

    /* ORIGINAL CODE DISABLED TO PREVENT API CHARGES
    // Only load if we have hotels with valid coordinates
    const validHotels = hotels.filter(h => h.latitude && h.longitude);
    if (validHotels.length === 0) return;

    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (typeof (window as any).google !== 'undefined') {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };
    */

    /* REST OF MAP CODE DISABLED
    const initMap = () => {
      if (!mapRef.current) return;

      const validHotels = hotels.filter(h => h.latitude && h.longitude);
      if (validHotels.length === 0) return;

      const g = (window as any).google;

      // Calculate center point
      const avgLat = validHotels.reduce((sum, h) => sum + parseFloat(h.latitude.toString()), 0) / validHotels.length;
      const avgLng = validHotels.reduce((sum, h) => sum + parseFloat(h.longitude.toString()), 0) / validHotels.length;

      // Initialize map with satellite view
      const map = new g.maps.Map(mapRef.current, {
        center: { lat: avgLat, lng: avgLng },
        zoom: 7,
        mapTypeId: g.maps.MapTypeId.HYBRID, // Satellite with labels
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: g.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: g.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: [
            g.maps.MapTypeId.HYBRID,
            g.maps.MapTypeId.SATELLITE
          ]
        }
      });

      mapInstanceRef.current = map;

      // Create bounds to fit all markers
      const bounds = new g.maps.LatLngBounds();

      // Add markers for each hotel
      validHotels.forEach((hotel, index) => {
        const position = {
          lat: parseFloat(hotel.latitude.toString()),
          lng: parseFloat(hotel.longitude.toString())
        };

        // Create custom marker with number
        const marker = new g.maps.Marker({
          position,
          map,
          label: {
            text: (index + 1).toString(),
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          },
          title: hotel.hotel_name,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            fillColor: '#2563eb',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 20
          }
        });

        // Info window
        const infoWindow = new g.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
                ${hotel.hotel_name}
              </h3>
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">
                📍 ${hotel.city}
              </p>
              <div style="display: flex; align-items: center; gap: 4px;">
                ${'⭐'.repeat(hotel.star_rating || 0)}
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        bounds.extend(position);
      });

      // Draw route line connecting hotels in order
      if (validHotels.length > 1) {
        const path = validHotels.map(h => ({
          lat: parseFloat(h.latitude.toString()),
          lng: parseFloat(h.longitude.toString())
        }));

        new g.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#3b82f6',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map
        });
      }

      // Fit map to show all markers
      map.fitBounds(bounds);

      // Add some padding
      const padding = { top: 50, right: 50, bottom: 50, left: 50 };
      map.fitBounds(bounds, padding);
    };

    loadGoogleMaps();
    */
  }, [hotels]);

  // Filter hotels with valid coordinates
  const validHotels = hotels.filter(h => h.latitude && h.longitude);

  if (validHotels.length === 0) {
    return null; // Don't show map if no valid coordinates
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
      <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          🗺️ Your Journey Map
        </h3>
        <p className="text-blue-100 text-sm">
          Map temporarily disabled to reduce API costs
        </p>
      </div>
      <div className="w-full h-96 flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🗺️</div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">Map Temporarily Unavailable</h4>
          <p className="text-gray-600 mb-4">
            Google Maps has been disabled to prevent API overcharges.
          </p>
          <div className="text-sm text-gray-500">
            {validHotels.length} location{validHotels.length !== 1 ? 's' : ''} in your itinerary
          </div>
        </div>
      </div>
    </div>
  );
}
