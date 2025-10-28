import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import ItineraryMap from '@/app/components/ItineraryMap';
import SightseeingBanner from '@/app/components/SightseeingBanner';
import ItineraryClient from '@/app/components/ItineraryClient';

async function getItinerary(id: string) {
  try {
    // Support both UUID (secure) and numeric ID (legacy)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = isUUID
      ? 'SELECT * FROM customer_itineraries WHERE uuid = ? LIMIT 1'
      : 'SELECT * FROM customer_itineraries WHERE id = ? LIMIT 1';

    const [itineraries]: any = await pool.query(query, [id]);

    if (!itineraries || itineraries.length === 0) {
      return null;
    }

    const itinerary = itineraries[0];

    // Parse JSON fields
    try {
      if (itinerary.city_nights && typeof itinerary.city_nights === 'string') {
        itinerary.city_nights = JSON.parse(itinerary.city_nights);
      }
    } catch (e) {
      console.error('Failed to parse city_nights JSON:', e);
      itinerary.city_nights = [];
    }

    try {
      if (itinerary.itinerary_data && typeof itinerary.itinerary_data === 'string') {
        itinerary.itinerary_data = JSON.parse(itinerary.itinerary_data);
      }
    } catch (e) {
      console.error('Failed to parse itinerary_data JSON:', e);
      itinerary.itinerary_data = null;
    }

    // Extract unique hotel IDs from the itinerary
    const hotelIds: number[] = [];
    if (itinerary.itinerary_data && itinerary.itinerary_data.days) {
      itinerary.itinerary_data.days.forEach((day: any) => {
        if (day.items) {
          day.items.forEach((item: any) => {
            if (item.type === 'hotel' && item.hotel_id && !hotelIds.includes(item.hotel_id)) {
              hotelIds.push(item.hotel_id);
            }
          });
        }
      });
    }

    // Fetch full hotel details
    let hotelDetails: any[] = [];
    if (hotelIds.length > 0) {
      const hotelPlaceholders = hotelIds.map(() => '?').join(',');
      const [hotelData]: any = await pool.query(
        `SELECT
          h.id,
          h.hotel_name,
          h.city,
          h.star_rating,
          h.rating as google_rating,
          h.photo_url_1 as image_url,
          h.latitude,
          h.longitude,
          h.google_place_id
        FROM hotels h
        WHERE h.id IN (${hotelPlaceholders})
        ORDER BY h.city`,
        hotelIds
      );
      hotelDetails = hotelData;
    }

    // Extract unique tour IDs used in the itinerary
    const tourIds: number[] = [];
    if (itinerary.itinerary_data && itinerary.itinerary_data.days) {
      itinerary.itinerary_data.days.forEach((day: any) => {
        if (day.items) {
          day.items.forEach((item: any) => {
            if (item.type === 'tour' && item.tour_id && !tourIds.includes(item.tour_id)) {
              tourIds.push(item.tour_id);
            }
          });
        }
      });
    }

    // Fetch full tour details with images for sightseeing gallery
    let tourDetails: any[] = [];
    if (tourIds.length > 0) {
      const tourPlaceholders = tourIds.map(() => '?').join(',');
      const [tourData]: any = await pool.query(
        `SELECT
          t.id,
          t.tour_name,
          t.city,
          t.description,
          t.photo_url_1,
          t.photo_url_2,
          t.photo_url_3,
          t.google_place_id
        FROM tours t
        WHERE t.id IN (${tourPlaceholders})
        ORDER BY t.city`,
        tourIds
      );
      tourDetails = tourData;
    }

    // Fetch organization details for white-label branding
    let organization = null;
    if (itinerary.organization_id) {
      const [orgData]: any = await pool.query(
        `SELECT name, email, phone, website, logo_url
         FROM organizations
         WHERE id = ?`,
        [itinerary.organization_id]
      );
      organization = orgData[0] || null;
    }

    // Add hotels, tours, and organization to response
    itinerary.hotels_used = hotelDetails;
    itinerary.tours_visited = tourDetails;
    itinerary.organization = organization;

    return itinerary;

  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return null;
  }
}

export default async function CustomerItineraryView({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const itinerary = await getItinerary(resolvedParams.id);

  if (!itinerary) {
    notFound();
  }

  const itineraryData = typeof itinerary.itinerary_data === 'string'
    ? JSON.parse(itinerary.itinerary_data)
    : itinerary.itinerary_data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = () => {
    const start = new Date(itinerary.start_date);
    const end = new Date(itinerary.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr} • ${diffDays} Days`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
              Your Personalized Itinerary
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              {itinerary.destination}
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              {formatDateRange()}
            </p>
            <div className="flex items-center justify-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{itinerary.adults} Adult{itinerary.adults > 1 ? 's' : ''}</span>
              </div>
              {itinerary.children > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{itinerary.children} Child{itinerary.children > 1 ? 'ren' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Interactive Components (Client-side) */}
        <ItineraryClient itinerary={itinerary} itineraryId={resolvedParams.id} />

        {/* Sightseeing Banner */}
        {itinerary.tours_visited && itinerary.tours_visited.length > 0 && (
          <SightseeingBanner tours={itinerary.tours_visited} />
        )}

        {/* Map */}
        {itinerary.hotels_used && itinerary.hotels_used.length > 0 && (
          <ItineraryMap hotels={itinerary.hotels_used} />
        )}

        {/* Days */}
        <div className="space-y-6 mb-8">
          {itineraryData.days.map((day: any, index: number) => (
            <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              {/* Day Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full">
                      <span className="text-xl font-bold text-white">{day.day_number}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {day.title || `Day ${day.day_number}`}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {formatDate(day.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold">{day.location}</span>
                  </div>
                </div>
              </div>

              {/* Day Content */}
              <div className="p-6">
                {day.narrative && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-l-4 border-blue-500">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {day.narrative}
                    </p>
                    {day.meals && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-blue-700">
                        <span>🍽️</span>
                        <span>Meals: {day.meals}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Hotels Section */}
        {itinerary.hotels_used && itinerary.hotels_used.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Your Accommodations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itinerary.hotels_used.map((hotel: any) => (
                <div key={hotel.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                  {hotel.image_url && (
                    <div className="h-48 overflow-hidden bg-gray-200">
                      <img
                        src={hotel.image_url}
                        alt={hotel.hotel_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1">
                        {[...Array(hotel.star_rating || 0)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      {hotel.google_rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="font-semibold text-gray-700">{hotel.google_rating}</span>
                          <svg className="w-4 h-4 text-blue-600 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {hotel.hotel_name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {hotel.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inclusions & Exclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Inclusions */}
          <div className="bg-green-50 rounded-2xl shadow-lg border border-green-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Inclusions
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Accommodation in mentioned hotels</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All tours and activities as described</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All transfers and transportation</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Professional tour guides</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Entrance fees to attractions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Exclusions */}
          <div className="bg-red-50 rounded-2xl shadow-lg border border-red-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Exclusions
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>International flights</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Personal expenses</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Drinks at meals</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Tips and gratuities</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Travel insurance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
