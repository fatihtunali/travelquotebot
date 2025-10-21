'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ItineraryMap from '@/app/components/ItineraryMap';

interface PricingTier {
  min_pax: number;
  max_pax: number | null;
  three_star_double: number;
  three_star_triple: number;
  three_star_single_supplement: number;
  four_star_double: number;
  four_star_triple: number;
  four_star_single_supplement: number;
  five_star_double: number;
  five_star_triple: number;
  five_star_single_supplement: number;
  currency: string;
}

interface Itinerary {
  id: string;
  customerName: string;
  customerEmail: string;
  numberOfTravelers: number;
  duration: number;
  budget: string;
  startDate: string;
  status: string;
  company_name?: string;
  logo_url?: string;
  pricingTiers?: PricingTier[];
  enrichedDays?: Array<{
    dayNumber: number;
    date: string;
    city: string;
    accommodations: Array<{
      id: string;
      name: string;
      address?: string;
      city?: string;
      starRating?: number;
      amenities?: string[];
      images?: string[];
      location?: { lat: number; lng: number };
      phone?: string;
      description?: string;
      pricePerNight: number;
      nights: number;
    }>;
    activities: Array<{
      id: string;
      name: string;
      description?: string;
      category?: string;
      duration?: number;
      meetingPoint?: string;
      images?: string[];
      location?: { lat: number; lng: number };
      city?: string;
      googlePlaceId?: string;
      pricePerPerson: number;
    }>;
    restaurants: Array<{
      id: string;
      name: string;
      address?: string;
      cuisineType?: string;
      images?: string[];
      location?: { lat: number; lng: number };
      phone?: string;
      googlePlaceId?: string;
      pricePerPerson: number;
    }>;
    guides: Array<{
      id: string;
      name: string;
      languages?: string[];
      specialization?: string;
      phone?: string;
      pricePerPerson: number;
    }>;
    transports: Array<{
      id: string;
      name: string;
      type?: string;
      vehicleType?: string;
      capacity?: number;
      pricePerPerson: number;
    }>;
  }>;
  itineraryData: {
    title: string;
    summary: string;
    highlights?: string[];
    totalEstimatedCost?: {
      breakdown?: {
        accommodations?: number;
        activities?: number;
        meals?: number;
        transportation?: number;
        guides?: number;
      };
      subtotal?: number;
      total?: number;
      perPerson?: number;
      currency?: string;
      // Old format support
      min?: number;
      max?: number;
    };
    days: Array<{
      day: number;
      date?: string;
      title: string;
      city: string;
      highlights?: string[];
      activities?: Array<{
        time: string;
        endTime?: string;
        title: string;
        description: string;
        duration: string;
        category?: string;
        difficultyLevel?: string;
        meetingPoint?: string;
        phone?: string;
        bookingRequired?: boolean;
        included?: string[];
        excluded?: string[];
        tips?: string;
        cost: {
          perPerson?: number;
          totalForGroup?: number;
          currency?: string;
          // Old format support
          min?: number;
          max?: number;
        };
      }>;
      accommodation?: {
        name: string;
        address?: string;
        phone?: string;
        checkIn?: string;
        checkOut?: string;
        roomType?: string;
        starRating?: number;
        amenities?: string[];
        pricePerNight: number | { min?: number; max?: number };
        description: string;
        type?: string;
      };
      meals?: Array<{
        time?: string;
        type: string;
        restaurant: string;
        address?: string;
        phone?: string;
        cuisine: string;
        operatingHours?: string;
        reservationRequired?: boolean;
        dressCode?: string;
        recommendedDishes?: string[];
        estimatedCost: {
          perPerson?: number;
          totalForGroup?: number;
          currency?: string;
          // Old format support
          min?: number;
          max?: number;
        };
      }>;
      transportation?: Array<{
        time?: string;
        method: string;
        from: string;
        to: string;
        distance?: string;
        duration: string;
        vehicleType?: string;
        pickupLocation?: string;
        contact?: string;
        meetAndGreet?: boolean;
        cost: {
          total?: number;
          currency?: string;
          // Old format support
          min?: number;
          max?: number;
        };
      }>;
      freeTime?: string;
      totalDayCost?: {
        breakdown?: {
          activities?: number;
          meals?: number;
          accommodation?: number;
          transport?: number;
        };
        total?: number;
      };
    }>;
    whatIsIncluded?: string[];
    whatIsNotIncluded?: string[];
    packingList?: string[];
    importantNotes?: string[];
    emergencyContacts?: {
      tourOperator?: string;
      emergencyServices?: string;
      touristPolice?: string;
    };
    cancellationPolicy?: string;
  };
}

export default function ItineraryViewPage() {
  const router = useRouter();
  const params = useParams();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch(`/api/itinerary/${params.id}`, {
          credentials: 'include',
        });

        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load itinerary');
        }

        const data = await response.json();
        setItinerary(data.itinerary);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchItinerary();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading itinerary...</div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error || 'Itinerary not found'}</div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const data = itinerary.itineraryData;

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { ItineraryPDF } = await import('./ItineraryPDF');

      const operator = {
        companyName: itinerary.company_name || 'Travel Agency',
        logoUrl: itinerary.logo_url || null,
      };

      const formData = {
        customerName: itinerary.customerName,
        numberOfTravelers: itinerary.numberOfTravelers,
        duration: itinerary.duration || data.days?.length || 0,
        startDate: itinerary.startDate,
        budget: itinerary.budget,
      };

      // Generate PDF blob
      const blob = await pdf(
        <ItineraryPDF
          operator={operator}
          formData={formData}
          itineraryData={data}
          pricingTiers={itinerary.pricingTiers || []}
        />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `${(data?.title || 'itinerary').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
      link.download = filename;
      link.click();

      // Cleanup
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('PDF generation error:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div ref={contentRef} className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              {itinerary.logo_url && (
                <img
                  src={itinerary.logo_url}
                  alt={itinerary.company_name || 'Company Logo'}
                  className="h-12 w-auto object-contain"
                />
              )}
              <div>
                {itinerary.company_name && (
                  <div className="text-sm font-medium text-gray-500 mb-1">{itinerary.company_name}</div>
                )}
                <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {[
                    itinerary.customerName,
                    itinerary.numberOfTravelers ? `${itinerary.numberOfTravelers} travelers` : null
                  ].filter(Boolean).join(' • ')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadPDF}
                disabled={generatingPDF}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generatingPDF && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {generatingPDF ? 'Generating PDF...' : 'Download PDF'}
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">Trip Overview</h2>
          <p className="text-gray-700 mb-4">{data.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Starting Price</div>
              <div className="text-2xl font-bold text-blue-600">
                {(() => {
                  if (!itinerary.pricingTiers || itinerary.pricingTiers.length === 0) {
                    return 'Contact for pricing';
                  }
                  const tier = itinerary.pricingTiers[0];
                  // Show price for the first available hotel category
                  let price = null;
                  let hotelCategory = '';
                  if (tier.five_star_double !== null) {
                    price = tier.five_star_double;
                    hotelCategory = '5-star';
                  } else if (tier.four_star_double !== null) {
                    price = tier.four_star_double;
                    hotelCategory = '4-star';
                  } else if (tier.three_star_double !== null) {
                    price = tier.three_star_double;
                    hotelCategory = '3-star';
                  }
                  return price !== null
                    ? `${tier.currency} ${Number(price).toFixed(2)}`
                    : 'Contact for pricing';
                })()}
              </div>
              <div className="text-xs text-gray-500">
                {(() => {
                  if (!itinerary.pricingTiers || itinerary.pricingTiers.length === 0) return '';
                  const tier = itinerary.pricingTiers[0];
                  let hotelCategory = '';
                  if (tier.five_star_double !== null) hotelCategory = '5-star';
                  else if (tier.four_star_double !== null) hotelCategory = '4-star';
                  else if (tier.three_star_double !== null) hotelCategory = '3-star';
                  return hotelCategory ? `per person (${hotelCategory} hotels, double room)` : '';
                })()}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Trip Duration</div>
              <div className="text-2xl font-bold text-green-600">
                {itinerary.duration ? `${itinerary.duration} Days` : (data.days ? `${data.days.length} Days` : 'N/A')}
              </div>
              <div className="text-xs text-gray-500">
                {itinerary.startDate ? new Date(itinerary.startDate + 'T00:00:00').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : (data.days && data.days.length > 0 && data.days[0].date
                  ? new Date(data.days[0].date + 'T00:00:00').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'Flexible dates')}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Travel Style</div>
              <div className="text-2xl font-bold text-purple-600">
                {itinerary.budget === 'budget' ? 'Value'
                  : itinerary.budget === 'moderate' ? 'Comfort'
                  : itinerary.budget === 'luxury' ? 'Premium'
                  : 'Standard'}
              </div>
              <div className="text-xs text-gray-500">
                {itinerary.numberOfTravelers ? `${itinerary.numberOfTravelers} ${itinerary.numberOfTravelers === 1 ? 'traveler' : 'travelers'}` : 'Group size varies'}
              </div>
            </div>
          </div>
        </div>

        {/* Route Map */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Trip Route</h2>
          <ItineraryMap itineraryData={data} className="h-96" />
        </div>

        {/* Day by Day */}
        <div className="space-y-6">
          {(!data.days || data.days.length === 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">No itinerary days found. The AI may have encountered an error generating the full itinerary.</p>
            </div>
          )}

          {data.days && data.days.length > 0 && data.days.map((day: any, index) => {
            // Format date from YYYY-MM-DD to MM/DD/YYYY
            const formatDate = (dateStr: string) => {
              if (!dateStr) return '';
              const [year, month, dayNum] = dateStr.split('-');
              return `${month}/${dayNum}/${year}`;
            };

            const formattedDate = formatDate(day.date);
            const dayNumber = day.dayNumber || day.day;
            const title = day.title?.replace(/Day \d+ - /, ''); // Remove "Day X - " if already in title
            const mealCode = day.mealCode || '';

            return (
              <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                  <div className="flex justify-between items-center">
                    <div className="w-full">
                      <h3 className="text-xl font-bold">
                        {formattedDate} - Day {dayNumber} - {title} {mealCode}
                      </h3>
                    </div>
                  </div>
                </div>

              <div className="p-6 space-y-6">
                {/* Narrative Description */}
                {day.description && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{day.description}</p>
                  </div>
                )}

                {/* Selected Hotel */}
                {day.selectedHotel && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <h4 className="font-semibold text-green-900 mb-1">🏨 Accommodation</h4>
                    <div className="text-gray-700">{day.selectedHotel}</div>
                  </div>
                )}

                {/* Selected Activities */}
                {day.selectedActivities && day.selectedActivities.length > 0 && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <h4 className="font-semibold text-blue-900 mb-2">🎯 Activities</h4>
                    <ul className="space-y-1">
                      {day.selectedActivities.map((activity: string, idx: number) => (
                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Selected Restaurants */}
                {day.selectedRestaurants && day.selectedRestaurants.length > 0 && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                    <h4 className="font-semibold text-orange-900 mb-2">🍽️ Dining</h4>
                    <ul className="space-y-1">
                      {day.selectedRestaurants.map((restaurant: string, idx: number) => (
                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>{restaurant}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Selected Transport */}
                {day.selectedTransport && day.selectedTransport.length > 0 && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <h4 className="font-semibold text-purple-900 mb-2">🚗 Transportation</h4>
                    <ul className="space-y-1">
                      {day.selectedTransport.map((transport: string, idx: number) => (
                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>{transport}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Selected Guide */}
                {day.selectedGuide && (
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                    <h4 className="font-semibold text-indigo-900 mb-1">👨‍🏫 Tour Guide</h4>
                    <div className="text-gray-700">{day.selectedGuide}</div>
                  </div>
                )}

                {/* Selected Additional Services */}
                {day.selectedServices && day.selectedServices.length > 0 && (
                  <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
                    <h4 className="font-semibold text-teal-900 mb-2">🎫 Additional Services</h4>
                    <ul className="space-y-1">
                      {day.selectedServices.map((service: string, idx: number) => (
                        <li key={idx} className="text-gray-700 flex items-start gap-2">
                          <span className="text-teal-600 mt-1">•</span>
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ENRICHED DATA FROM DATABASE WITH GOOGLE PLACES PHOTOS */}
                {itinerary.enrichedDays && (() => {
                  const enrichedDay = itinerary.enrichedDays.find((ed: any) => ed.dayNumber === dayNumber);
                  if (!enrichedDay) return null;

                  return (
                    <div className="mt-6 space-y-6">
                      <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">📍 Service Details with Photos</h4>

                        {/* Enriched Accommodations */}
                        {enrichedDay.accommodations && enrichedDay.accommodations.length > 0 && enrichedDay.accommodations.map((acc: any, idx: number) => (
                          <div key={idx} className="bg-white border-2 border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-4">
                              {/* Hotel Photos */}
                              {acc.images && acc.images.length > 0 && (
                                <div className="flex-shrink-0 w-48">
                                  <img
                                    src={acc.images[0]}
                                    alt={acc.name}
                                    className="w-full h-32 object-cover rounded-lg shadow"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  {acc.images.length > 1 && (
                                    <div className="text-xs text-gray-500 mt-1 text-center">
                                      +{acc.images.length - 1} more photos
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Hotel Details */}
                              <div className="flex-grow">
                                <h5 className="font-semibold text-green-900 text-lg">
                                  🏨 {acc.name}
                                  {acc.starRating && (
                                    <span className="ml-2 text-yellow-500">
                                      {'⭐'.repeat(acc.starRating)}
                                    </span>
                                  )}
                                </h5>
                                {acc.address && (
                                  <p className="text-sm text-gray-600 mt-1">📍 {acc.address}</p>
                                )}
                                {acc.phone && (
                                  <p className="text-sm text-gray-600">📞 {acc.phone}</p>
                                )}
                                {acc.description && (
                                  <p className="text-sm text-gray-700 mt-2">{acc.description}</p>
                                )}
                                {acc.amenities && acc.amenities.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {acc.amenities.slice(0, 5).map((amenity: string, i: number) => (
                                      <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        {amenity}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <p className="text-sm text-green-700 font-medium mt-2">
                                  ${acc.pricePerNight}/person/night × {acc.nights} night{acc.nights > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Enriched Activities */}
                        {enrichedDay.activities && enrichedDay.activities.length > 0 && enrichedDay.activities.map((act: any, idx: number) => (
                          <div key={idx} className="bg-white border-2 border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-4">
                              {/* Activity Photos */}
                              {act.images && act.images.length > 0 && (
                                <div className="flex-shrink-0 w-48">
                                  <img
                                    src={act.images[0]}
                                    alt={act.name}
                                    className="w-full h-32 object-cover rounded-lg shadow"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  {act.images.length > 1 && (
                                    <div className="text-xs text-gray-500 mt-1 text-center">
                                      +{act.images.length - 1} more photos
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Activity Details */}
                              <div className="flex-grow">
                                <h5 className="font-semibold text-blue-900 text-lg">
                                  🎯 {act.name}
                                </h5>
                                {act.category && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {act.category}
                                  </span>
                                )}
                                {act.description && (
                                  <p className="text-sm text-gray-700 mt-2">{act.description}</p>
                                )}
                                {act.meetingPoint && (
                                  <p className="text-sm text-gray-600 mt-1">📍 Meeting Point: {act.meetingPoint}</p>
                                )}
                                {act.duration && (
                                  <p className="text-sm text-gray-600">⏱️ Duration: {act.duration} hours</p>
                                )}
                                <p className="text-sm text-blue-700 font-medium mt-2">
                                  ${act.pricePerPerson}/person
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Enriched Restaurants */}
                        {enrichedDay.restaurants && enrichedDay.restaurants.length > 0 && enrichedDay.restaurants.map((rest: any, idx: number) => (
                          <div key={idx} className="bg-white border-2 border-orange-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-4">
                              {/* Restaurant Photos */}
                              {rest.images && rest.images.length > 0 && (
                                <div className="flex-shrink-0 w-48">
                                  <img
                                    src={rest.images[0]}
                                    alt={rest.name}
                                    className="w-full h-32 object-cover rounded-lg shadow"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  {rest.images.length > 1 && (
                                    <div className="text-xs text-gray-500 mt-1 text-center">
                                      +{rest.images.length - 1} more photos
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Restaurant Details */}
                              <div className="flex-grow">
                                <h5 className="font-semibold text-orange-900 text-lg">
                                  🍽️ {rest.name}
                                </h5>
                                {rest.cuisineType && (
                                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                    {rest.cuisineType}
                                  </span>
                                )}
                                {rest.address && (
                                  <p className="text-sm text-gray-600 mt-1">📍 {rest.address}</p>
                                )}
                                {rest.phone && (
                                  <p className="text-sm text-gray-600">📞 {rest.phone}</p>
                                )}
                                <p className="text-sm text-orange-700 font-medium mt-2">
                                  ${rest.pricePerPerson}/person
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Enriched Guides */}
                        {enrichedDay.guides && enrichedDay.guides.length > 0 && enrichedDay.guides.map((guide: any, idx: number) => (
                          <div key={idx} className="bg-white border-2 border-indigo-200 rounded-lg p-4 mb-4">
                            <h5 className="font-semibold text-indigo-900 text-lg">
                              👨‍🏫 {guide.name}
                            </h5>
                            {guide.specialization && (
                              <p className="text-sm text-gray-700 mt-1">Specialization: {guide.specialization}</p>
                            )}
                            {guide.languages && guide.languages.length > 0 && (
                              <p className="text-sm text-gray-600">Languages: {guide.languages.join(', ')}</p>
                            )}
                            {guide.phone && (
                              <p className="text-sm text-gray-600">📞 {guide.phone}</p>
                            )}
                            <p className="text-sm text-indigo-700 font-medium mt-2">
                              ${guide.pricePerPerson}/person (group cost divided by pax)
                            </p>
                          </div>
                        ))}

                        {/* Enriched Transports */}
                        {enrichedDay.transports && enrichedDay.transports.length > 0 && enrichedDay.transports.map((trans: any, idx: number) => (
                          <div key={idx} className="bg-white border-2 border-purple-200 rounded-lg p-4 mb-4">
                            <h5 className="font-semibold text-purple-900 text-lg">
                              🚗 {trans.name}
                            </h5>
                            {trans.type && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                {trans.type}
                              </span>
                            )}
                            {trans.vehicleType && (
                              <p className="text-sm text-gray-700 mt-1">Vehicle: {trans.vehicleType}</p>
                            )}
                            {trans.capacity && (
                              <p className="text-sm text-gray-600">Capacity: {trans.capacity} passengers</p>
                            )}
                            <p className="text-sm text-purple-700 font-medium mt-2">
                              ${trans.pricePerPerson}/person (vehicle cost divided by pax)
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )
        })}
        </div>

        {/* Pricing Table */}
        {itinerary.pricingTiers && itinerary.pricingTiers.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">💰 Pricing Options</h2>

            {(() => {
              // Detect which hotel categories are available (non-null)
              const firstTier = itinerary.pricingTiers[0];
              const availableCategories = [];
              if (firstTier.three_star_double !== null) availableCategories.push('3-star');
              if (firstTier.four_star_double !== null) availableCategories.push('4-star');
              if (firstTier.five_star_double !== null) availableCategories.push('5-star');

              return (
                <>
                  {/* Hotel Star Rating Tabs - only show available categories */}
                  {availableCategories.length > 1 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map((rating) => (
                          <button
                            key={rating}
                            onClick={() => {
                              const el = document.getElementById(`pricing-${rating}`);
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition"
                          >
                            {rating.toUpperCase()} Hotels
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3-Star Pricing - only show if available */}
                  {availableCategories.includes('3-star') && (
                    <div id="pricing-3-star" className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-amber-700">⭐⭐⭐ 3-STAR HOTELS</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-amber-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">PAX</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Double Room</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Triple Room</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Single Supplement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itinerary.pricingTiers.map((tier, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {tier.min_pax}-{tier.max_pax || '+'} persons
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {tier.currency} {Number(tier.three_star_double).toFixed(2)}/person
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {tier.currency} {Number(tier.three_star_triple).toFixed(2)}/person
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                          +{tier.currency} {Number(tier.three_star_single_supplement).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                    </div>
                  )}

                  {/* 4-Star Pricing - only show if available */}
                  {availableCategories.includes('4-star') && (
                    <div id="pricing-4-star" className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-700">⭐⭐⭐⭐ 4-STAR HOTELS</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">PAX</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Double Room</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Triple Room</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Single Supplement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itinerary.pricingTiers.map((tier, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {tier.min_pax}-{tier.max_pax || '+'} persons
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {tier.currency} {Number(tier.four_star_double).toFixed(2)}/person
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {tier.currency} {Number(tier.four_star_triple).toFixed(2)}/person
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                          +{tier.currency} {Number(tier.four_star_single_supplement).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                    </div>
                  )}

                  {/* 5-Star Pricing - only show if available */}
                  {availableCategories.includes('5-star') && (
                    <div id="pricing-5-star" className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-purple-700">⭐⭐⭐⭐⭐ 5-STAR HOTELS</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">PAX</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Double Room</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Triple Room</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Single Supplement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itinerary.pricingTiers.map((tier, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {tier.min_pax}-{tier.max_pax || '+'} persons
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {tier.currency} {Number(tier.five_star_double).toFixed(2)}/person
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {tier.currency} {Number(tier.five_star_triple).toFixed(2)}/person
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                          +{tier.currency} {Number(tier.five_star_single_supplement).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                    </div>
                  )}
                </>
              );
            })()}

            <div className="text-sm text-gray-600 italic mt-4">
              * Prices are per person and include all services mentioned in the itinerary<br/>
              * Single supplement applies when a single traveler wants a private room
            </div>
          </div>
        )}

        {/* Inclusions & Exclusions */}
        {((data as any).inclusions || (data as any).exclusions || (data as any).information) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {(data as any).inclusions && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-green-700">✓ What's Included</h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700">{(data as any).inclusions}</pre>
                </div>
              </div>
            )}

            {(data as any).exclusions && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-red-700">✗ What's Not Included</h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700">{(data as any).exclusions}</pre>
                </div>
              </div>
            )}

            {(data as any).information && (
              <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-blue-700">ℹ️ Important Information</h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700">{(data as any).information}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Packing List & Notes */}
        {(data.packingList || data.importantNotes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {data.packingList && data.packingList.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Packing List</h3>
                <ul className="space-y-2">
                  {data.packingList.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.importantNotes && data.importantNotes.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Important Notes</h3>
                <ul className="space-y-2">
                  {data.importantNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">⚠</span>
                      <span className="text-sm">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
