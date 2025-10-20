'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { geocodeCity, extractCitiesFromItinerary } from '@/lib/geocoding';

// Dynamically import map components (Leaflet requires window object)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

interface CityLocation {
  name: string;
  lat: number;
  lng: number;
  days: number[]; // Which days are spent in this city
}

interface ItineraryMapProps {
  itineraryData: any;
  className?: string;
}

export default function ItineraryMap({ itineraryData, className = '' }: ItineraryMapProps) {
  const [cityLocations, setCityLocations] = useState<CityLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);

      // Fix Leaflet default marker icon issue
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      setMapReady(true);
    }
  }, []);

  useEffect(() => {
    async function loadCityLocations() {
      if (!itineraryData?.days) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Extract cities with their days
        const cityMap = new Map<string, number[]>();

        // Known Turkish cities (order matters - check specific names before generic ones)
        const knownCities = [
          'sultanahmet', 'istanbul', 'cappadocia', 'kapadokya', 'goreme', 'göreme',
          'urgup', 'ürgüp', 'nevsehir', 'nevşehir', 'kusadasi', 'kuşadası',
          'ephesus', 'efes', 'pamukkale', 'antalya', 'bodrum', 'fethiye',
          'ankara', 'izmir', 'trabzon', 'konya', 'bursa', 'marmaris', 'alanya',
          'troy', 'truva', 'pergamon', 'bergama', 'cesme', 'çeşme'
        ];

        let lastKnownCity: string | null = null;

        itineraryData.days.forEach((day: any) => {
          let cityName = day.city;

          // Try to extract city from various sources
          if (!cityName) {
            const searchText = [
              day.title || '',
              day.description || '',
              day.selectedHotel || '',
              ...(day.selectedActivities || []),
              ...(day.selectedTransport || [])
            ].join(' ').toLowerCase();

            // Find first matching city
            for (const city of knownCities) {
              if (searchText.includes(city)) {
                // Normalize city names
                if (city === 'kapadokya' || city === 'goreme' || city === 'göreme' ||
                    city === 'urgup' || city === 'ürgüp' || city === 'nevsehir' || city === 'nevşehir') {
                  cityName = 'Cappadocia';
                } else if (city === 'kusadasi' || city === 'kuşadası' || city === 'ephesus' || city === 'efes') {
                  cityName = 'Kusadasi';
                } else if (city === 'sultanahmet') {
                  cityName = 'Istanbul';
                } else {
                  cityName = city.charAt(0).toUpperCase() + city.slice(1);
                }
                lastKnownCity = cityName;
                break;
              }
            }

            // If no city found but we have a last known city, use it (same city continues)
            if (!cityName && lastKnownCity) {
              cityName = lastKnownCity;
            }
          }

          if (cityName) {
            if (!cityMap.has(cityName)) {
              cityMap.set(cityName, []);
            }
            const dayNumber = day.dayNumber || day.day || (itineraryData.days.indexOf(day) + 1);
            cityMap.get(cityName)!.push(dayNumber);
            lastKnownCity = cityName; // Remember this city
          }
        });

        // Geocode each unique city
        const locations: CityLocation[] = [];

        for (const [cityName, days] of cityMap.entries()) {
          const coords = await geocodeCity(cityName);
          locations.push({
            name: cityName,
            lat: coords.lat,
            lng: coords.lng,
            days: days.sort((a, b) => a - b),
          });
        }

        // Sort by first day visited
        locations.sort((a, b) => a.days[0] - b.days[0]);

        setCityLocations(locations);
      } catch (error) {
        console.error('Error loading city locations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (mapReady) {
      loadCityLocations();
    }
  }, [itineraryData, mapReady]);

  if (!mapReady || isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (cityLocations.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-600">No location data available</p>
      </div>
    );
  }

  // Calculate map center (average of all coordinates)
  const centerLat = cityLocations.reduce((sum, loc) => sum + loc.lat, 0) / cityLocations.length;
  const centerLng = cityLocations.reduce((sum, loc) => sum + loc.lng, 0) / cityLocations.length;

  // Calculate bounds for auto-zoom
  const latitudes = cityLocations.map(loc => loc.lat);
  const longitudes = cityLocations.map(loc => loc.lng);
  const latRange = Math.max(...latitudes) - Math.min(...latitudes);
  const lngRange = Math.max(...longitudes) - Math.min(...longitudes);
  const maxRange = Math.max(latRange, lngRange);

  // Determine zoom level based on range
  let zoom = 6;
  if (maxRange < 1) zoom = 10;
  else if (maxRange < 3) zoom = 8;
  else if (maxRange < 5) zoom = 7;

  // Create route line coordinates
  const routeCoordinates: [number, number][] = cityLocations.map(loc => [loc.lat, loc.lng]);

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw route line */}
        {cityLocations.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#3B82F6"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}

        {/* Add markers for each city */}
        {cityLocations.map((location, index) => (
          <Marker key={index} position={[location.lat, location.lng]}>
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-base mb-1">{location.name}</h3>
                <p className="text-gray-600">
                  {location.days.length === 1 ? (
                    <>Day {location.days[0]}</>
                  ) : (
                    <>Days {location.days[0]}-{location.days[location.days.length - 1]}</>
                  )}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {location.days.length} {location.days.length === 1 ? 'day' : 'days'} in this city
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="bg-white px-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Route</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3B82F6"/>
            </svg>
            <span className="text-gray-600">City Stop</span>
          </div>
          <div className="ml-auto text-gray-500">
            {cityLocations.length} {cityLocations.length === 1 ? 'destination' : 'destinations'}
          </div>
        </div>
      </div>
    </div>
  );
}
