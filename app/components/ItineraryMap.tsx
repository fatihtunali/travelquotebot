'use client';

import { useEffect, useRef, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
  title: string;
  type: 'hotel' | 'activity' | 'restaurant';
  day?: number;
}

interface ItineraryMapProps {
  itineraryData?: any;
  className?: string;
  locations?: Location[];
  apiKey?: string;
  zoom?: number;
}

export default function ItineraryMap({
  itineraryData,
  className = '',
  locations: providedLocations,
  apiKey: providedApiKey,
  zoom = 12
}: ItineraryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get API key from env if not provided
  const apiKey = providedApiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Extract locations from itinerary data
  useEffect(() => {
    if (providedLocations) {
      setLocations(providedLocations);
      setIsLoading(false);
      return;
    }

    if (!itineraryData?.days) {
      setIsLoading(false);
      return;
    }

    const extractedLocations: Location[] = [];

    itineraryData.days.forEach((day: any, dayIndex: number) => {
      const dayNumber = day.dayNumber || day.day || dayIndex + 1;

      // Extract hotel location
      if (day.selectedHotel && day.hotel_location_lat && day.hotel_location_lng) {
        extractedLocations.push({
          lat: parseFloat(day.hotel_location_lat),
          lng: parseFloat(day.hotel_location_lng),
          title: day.selectedHotel,
          type: 'hotel',
          day: dayNumber,
        });
      }

      // Extract activity locations
      if (day.selectedActivities && Array.isArray(day.selectedActivities)) {
        day.selectedActivities.forEach((activity: any, idx: number) => {
          const activityName = typeof activity === 'string' ? activity : activity.name;
          const lat = activity.location_lat || day[`activity_${idx}_location_lat`];
          const lng = activity.location_lng || day[`activity_${idx}_location_lng`];

          if (lat && lng) {
            extractedLocations.push({
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              title: activityName,
              type: 'activity',
              day: dayNumber,
            });
          }
        });
      }

      // Extract restaurant locations
      if (day.selectedRestaurants && Array.isArray(day.selectedRestaurants)) {
        day.selectedRestaurants.forEach((restaurant: any, idx: number) => {
          const restaurantName = typeof restaurant === 'string' ? restaurant : restaurant.name;
          const lat = restaurant.location_lat || day[`restaurant_${idx}_location_lat`];
          const lng = restaurant.location_lng || day[`restaurant_${idx}_location_lng`];

          if (lat && lng) {
            extractedLocations.push({
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              title: restaurantName,
              type: 'restaurant',
              day: dayNumber,
            });
          }
        });
      }
    });

    setLocations(extractedLocations);
    setIsLoading(false);
  }, [itineraryData, providedLocations]);

  useEffect(() => {
    if (!mapRef.current || !apiKey || locations.length === 0 || isLoading) return;

    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      // Calculate center point from all locations
      const bounds = new google.maps.LatLngBounds();
      locations.forEach(loc => {
        bounds.extend(new google.maps.LatLng(loc.lat, loc.lng));
      });

      // Create map
      const map = new google.maps.Map(mapRef.current, {
        zoom: zoom,
        center: bounds.getCenter(),
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      googleMapRef.current = map;

      // Fit map to show all markers
      if (locations.length > 1) {
        map.fitBounds(bounds);
      }

      // Add markers for each location
      locations.forEach((location, index) => {
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
          title: location.title,
          label: {
            text: String(index + 1),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: getMarkerColor(location.type),
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${location.title}</h3>
              <p style="margin: 0; font-size: 12px; color: #666; text-transform: capitalize;">${location.type}</p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      // Draw route lines between locations (if more than 1)
      if (locations.length > 1) {
        const path = locations.map(loc => ({ lat: loc.lat, lng: loc.lng }));
        new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: '#4F46E5',
          strokeOpacity: 0.6,
          strokeWeight: 3,
          map: map,
        });
      }
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      googleMapRef.current = null;
    };
  }, [locations, apiKey, zoom]);

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'hotel':
        return '#10B981'; // Green
      case 'activity':
        return '#3B82F6'; // Blue
      case 'restaurant':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280'; // Gray
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className || 'w-full h-96'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className || 'w-full h-96'}`}>
        <div className="text-center">
          <p className="text-gray-500">Map will appear here once locations are available</p>
          <p className="text-xs text-gray-400 mt-2">GPS coordinates will be added as itinerary is refined</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div ref={mapRef} className="w-full h-96 rounded-lg shadow-md" />
      <div className="flex gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Hotels</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Activities</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Restaurants</span>
        </div>
        <div className="ml-auto text-gray-500 text-xs">
          Powered by Google Maps
        </div>
      </div>
    </div>
  );
}
