'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Hotel {
  id: number;
  hotel_name: string;
  city: string;
  latitude: number;
  longitude: number;
  star_rating: number;
}

interface ItineraryMapClientProps {
  hotels: Hotel[];
}

// Component to fit bounds to show all markers
function FitBounds({ hotels }: { hotels: Hotel[] }) {
  const map = useMap();

  useEffect(() => {
    if (hotels.length === 0) return;

    const bounds = L.latLngBounds(
      hotels.map(h => [parseFloat(h.latitude.toString()), parseFloat(h.longitude.toString())])
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 12
    });
  }, [hotels, map]);

  return null;
}

// Create custom numbered markers
function createNumberedIcon(number: number) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 40px;
          height: 40px;
          background: #2563eb;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <span style="
            color: white;
            font-size: 16px;
            font-weight: bold;
            font-family: system-ui, -apple-system, sans-serif;
          ">${number}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
}

export default function ItineraryMapClient({ hotels }: ItineraryMapClientProps) {
  // Filter hotels with valid coordinates
  const validHotels = hotels.filter(h => h.latitude && h.longitude);

  if (validHotels.length === 0) {
    return null;
  }

  // Calculate center point
  const avgLat = validHotels.reduce((sum, h) => sum + parseFloat(h.latitude.toString()), 0) / validHotels.length;
  const avgLng = validHotels.reduce((sum, h) => sum + parseFloat(h.longitude.toString()), 0) / validHotels.length;

  // Create path for route line
  const routePath: [number, number][] = validHotels.map(h => [
    parseFloat(h.latitude.toString()),
    parseFloat(h.longitude.toString())
  ]);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
      <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          🗺️ Your Journey Map
        </h3>
        <p className="text-blue-100 text-sm">
          Follow your route through {validHotels.length} amazing destination{validHotels.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="w-full h-96">
        <MapContainer
          center={[avgLat, avgLng]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Draw route line connecting hotels */}
          {validHotels.length > 1 && (
            <Polyline
              positions={routePath}
              pathOptions={{
                color: '#3b82f6',
                weight: 3,
                opacity: 0.8
              }}
            />
          )}

          {/* Add numbered markers for each hotel */}
          {validHotels.map((hotel, index) => (
            <Marker
              key={hotel.id}
              position={[parseFloat(hotel.latitude.toString()), parseFloat(hotel.longitude.toString())]}
              icon={createNumberedIcon(index + 1)}
            >
              <Popup>
                <div style={{ padding: '8px', minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
                    {hotel.hotel_name}
                  </h3>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>
                    📍 {hotel.city}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {'⭐'.repeat(hotel.star_rating || 0)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          <FitBounds hotels={validHotels} />
        </MapContainer>
      </div>
    </div>
  );
}
