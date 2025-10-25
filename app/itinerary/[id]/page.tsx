'use client';

import { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import ItineraryMap from '@/app/components/ItineraryMap';
import SightseeingBanner from '@/app/components/SightseeingBanner';

// Dynamic import for PDF button (client-side only)
const PDFDownloadButton = dynamic(() => import('@/components/PDFDownloadButton'), {
  ssr: false,
  loading: () => (
    <button
      disabled
      className="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold shadow-md cursor-not-allowed"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Loading PDF...
    </button>
  )
});

export default function CustomerItineraryView({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [bookingRequested, setBookingRequested] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  useEffect(() => {
    fetchItinerary();
  }, [resolvedParams.id]);

  const fetchItinerary = async () => {
    try {
      const response = await fetch(`/api/itinerary/${resolvedParams.id}`);

      if (!response.ok) {
        throw new Error('Itinerary not found');
      }

      const data = await response.json();
      setItinerary(data);

      // Check if booking already requested
      if (data.booking_requested_at) {
        setBookingRequested(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingRequest = async () => {
    if (submittingBooking || bookingRequested) return;

    setSubmittingBooking(true);

    try {
      const response = await fetch(`/api/itinerary/${resolvedParams.id}/request-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        setBookingRequested(true);
        setShowContact(true);
      } else {
        alert('Failed to submit booking request. Please try again or contact us directly.');
      }
    } catch (error) {
      console.error('Error submitting booking request:', error);
      alert('Failed to submit booking request. Please try again or contact us directly.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Itinerary Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The itinerary you are looking for does not exist.'}</p>
        </div>
      </div>
    );
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

  const totalPeople = itinerary.adults + itinerary.children;

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
        {/* Social Sharing */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Love your itinerary? Share it with friends!</h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* WhatsApp Share */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out my dream ${itinerary.destination} trip! ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Share on WhatsApp
              </a>

              {/* Facebook Share */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Share on Facebook
              </a>

              {/* Twitter/X Share */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Planning my dream ${itinerary.destination} trip!`)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X
              </a>

              {/* Copy Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </button>

              {/* Download PDF */}
              <PDFDownloadButton itinerary={itinerary} />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Help your friends plan their perfect Turkey adventure!
            </p>
          </div>
        </div>

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
                        Day {day.day_number}
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
                    {day.title && (
                      <h4 className="text-lg font-bold text-gray-900 mb-3">
                        {day.title}
                      </h4>
                    )}
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

        {/* Price */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-center mb-8">
          <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Price Per Person</h3>
          <div className="text-5xl font-bold text-white mb-2">
            €{parseFloat(itinerary.price_per_person || 0).toFixed(2)}
          </div>
          <p className="text-green-100 text-sm mb-4">
            Based on {totalPeople} traveler{totalPeople !== 1 ? 's' : ''}
          </p>
          <p className="text-white font-semibold">
            Total Trip Price: €{parseFloat(itinerary.total_price || 0).toFixed(2)}
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={handleBookingRequest}
            disabled={submittingBooking || bookingRequested}
            className={`px-12 py-5 rounded-xl font-bold text-xl shadow-xl transition-all duration-200 ${
              bookingRequested
                ? 'bg-green-600 hover:bg-green-700 text-white cursor-default'
                : submittingBooking
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
            }`}
          >
            {submittingBooking ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : bookingRequested ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Booking Request Sent!
              </span>
            ) : (
              'Book This Trip'
            )}
          </button>
          {bookingRequested && (
            <p className="mt-4 text-green-600 font-semibold">
              ✅ We've received your request and will contact you within 24 hours!
            </p>
          )}
          <p className="mt-4 text-gray-600 text-sm">
            Have questions? <button onClick={() => setShowContact(true)} className="text-blue-600 hover:underline font-semibold">Contact us</button>
          </p>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            {bookingRequested ? (
              <>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h3>
                  <p className="text-green-600 font-semibold">
                    We've received your request successfully!
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 mb-3">
                    <strong>{itinerary.customer_name}</strong>, thank you for choosing <strong>{itinerary.destination}</strong>!
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    📧 Confirmation sent to: <strong>{itinerary.customer_email}</strong>
                  </p>
                  {itinerary.customer_phone && (
                    <p className="text-sm text-gray-600">
                      📱 We'll contact you at: <strong>{itinerary.customer_phone}</strong>
                    </p>
                  )}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>What happens next?</strong>
                  </p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Our team will review your itinerary</li>
                    <li>We'll contact you within 24 hours</li>
                    <li>We'll confirm availability and finalize details</li>
                    <li>You'll receive payment and booking instructions</li>
                  </ul>
                </div>
                {itinerary.organization && (
                  <div className="text-center text-sm text-gray-600 mb-6">
                    <p>Questions? Contact us:</p>
                    <p className="font-semibold text-blue-600">
                      {itinerary.organization.email}
                    </p>
                    {itinerary.organization.phone && (
                      <p className="font-semibold text-blue-600">
                        {itinerary.organization.phone}
                      </p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setShowContact(false)}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Got It!
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>Your Name:</strong> {itinerary.customer_name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> {itinerary.customer_email}
                  </p>
                  {itinerary.customer_phone && (
                    <p className="text-sm text-gray-700">
                      <strong>Phone:</strong> {itinerary.customer_phone}
                    </p>
                  )}
                </div>
                {itinerary.organization && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Contact {itinerary.organization.name}:</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      📧 {itinerary.organization.email}
                    </p>
                    {itinerary.organization.phone && (
                      <p className="text-sm text-gray-600">
                        📱 {itinerary.organization.phone}
                      </p>
                    )}
                    {itinerary.organization.website && (
                      <p className="text-sm text-gray-600">
                        🌐 <a href={itinerary.organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {itinerary.organization.website}
                        </a>
                      </p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setShowContact(false)}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
