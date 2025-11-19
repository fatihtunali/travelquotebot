'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ItineraryMap from '@/app/components/ItineraryMap';
import SightseeingBanner from '@/app/components/SightseeingBanner';

export default function ItineraryPreview() {
  const router = useRouter();
  const [itineraryData, setItineraryData] = useState<any>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [actionType, setActionType] = useState<'save' | 'book'>('save');
  const [saving, setSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    // Load from sessionStorage
    const data = sessionStorage.getItem('generated_itinerary');
    if (!data) {
      router.push('/plan-trip');
      return;
    }
    setItineraryData(JSON.parse(data));
  }, [router]);

  const handleSubmit = async () => {
    if (!contactInfo.name || !contactInfo.email) {
      alert('Please provide your name and email');
      return;
    }

    setSaving(true);

    try {
      // Save to database with contact info and action type
      const response = await fetch('/api/itinerary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itineraryData,
          ...contactInfo,
          action_type: actionType // 'save' or 'book'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save itinerary');
      }

      const result = await response.json();

      // Clear sessionStorage
      sessionStorage.removeItem('generated_itinerary');
      sessionStorage.removeItem('trip_preferences');

      // Redirect to saved itinerary
      router.push(`/itinerary/${result.itinerary_id}`);

    } catch (error) {
      alert('Failed to save your itinerary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!itineraryData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  const totalPeople = itineraryData.adults + itineraryData.children;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Logo size="sm" variant="gradient" />
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-2">{itineraryData.destination}</h1>
          <p className="text-blue-100">
            {itineraryData.adults} Adult{itineraryData.adults > 1 ? 's' : ''}
            {itineraryData.children > 0 && ` • ${itineraryData.children} Child${itineraryData.children > 1 ? 'ren' : ''}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sightseeing Banner */}
        {itineraryData.tours_visited && itineraryData.tours_visited.length > 0 && (
          <SightseeingBanner tours={itineraryData.tours_visited} />
        )}

        {/* Map */}
        {itineraryData.hotels_used && itineraryData.hotels_used.length > 0 && (
          <ItineraryMap hotels={itineraryData.hotels_used} />
        )}

        {/* Days */}
        <div className="space-y-6 mb-8">
          {itineraryData.itinerary.days.map((day: any, index: number) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                      {day.day_number}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Day {day.day_number}</h3>
                      <p className="text-sm text-blue-100">{formatDate(day.date)}</p>
                    </div>
                  </div>
                  <span className="font-semibold">{day.location}</span>
                </div>
              </div>

              <div className="p-6">
                {day.title && (
                  <h4 className="text-lg font-bold text-gray-900 mb-3">{day.title}</h4>
                )}
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {day.narrative}
                </p>
                {day.meals && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-sm font-semibold text-blue-700">
                    🍽️ Meals: {day.meals}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Hotels Used */}
        {itineraryData.hotels_used && itineraryData.hotels_used.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🏨 Hotels Included in Your Package
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {itineraryData.hotels_used.map((hotel: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Hotel Image */}
                  {hotel.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={hotel.image_url}
                        alt={hotel.hotel_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}

                  {/* Hotel Info */}
                  <div className="p-5">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{hotel.hotel_name}</h4>

                    <div className="flex items-center gap-4 mb-2">
                      {/* Star Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(parseInt(hotel.star_rating) || 0)].map((_, i) => (
                          <span key={i} className="text-yellow-400">⭐</span>
                        ))}
                      </div>

                      {/* Google Rating */}
                      {hotel.google_rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="font-semibold text-gray-900">{hotel.google_rating}</span>
                          <span className="text-gray-500">Google</span>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <p className="text-sm text-gray-600">
                      📍 {hotel.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-center mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">Price Per Person</h3>
          <div className="text-5xl font-bold text-white mb-2">
            €{parseFloat(itineraryData.price_per_person || 0).toFixed(2)}
          </div>
          <p className="text-green-100 mb-4">
            Based on {totalPeople} traveler{totalPeople !== 1 ? 's' : ''}
          </p>
          <p className="text-white font-semibold">
            Total: €{parseFloat(itineraryData.total_price || 0).toFixed(2)}
          </p>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Love This Itinerary?</h3>
            <p className="text-gray-600">
              Save it to your account or request a booking - we'll need your contact details to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => {
                setActionType('save');
                setShowContactForm(true);
              }}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105"
            >
              💾 Save Itinerary
            </button>
            <button
              onClick={() => {
                setActionType('book');
                setShowContactForm(true);
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105"
            >
              ✈️ Book This Trip
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            📧 We'll email you a copy and our team will follow up within 24 hours
          </p>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {actionType === 'save' ? '💾 Save Your Itinerary' : '✈️ Request Booking'}
            </h3>
            <p className="text-gray-600 mb-6">
              {actionType === 'save'
                ? "We'll save this itinerary and email you a copy. Our team will reach out to help plan your perfect Turkey trip!"
                : "We'll process your booking request and get back to you within 24 hours with next steps."}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowContactForm(false)}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : (actionType === 'save' ? 'Save Itinerary' : 'Confirm Booking')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
