'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function ItineraryPreview() {
  const router = useRouter();
  const [itineraryData, setItineraryData] = useState<any>(null);
  const [showContactForm, setShowContactForm] = useState(false);
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

  const handleBookTrip = async () => {
    if (!contactInfo.name || !contactInfo.email) {
      alert('Please provide your name and email');
      return;
    }

    setSaving(true);

    try {
      // Now save to database with contact info
      const response = await fetch('/api/itinerary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itineraryData,
          ...contactInfo
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
            <Logo size="sm" variant="dark" />
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
        <div className="text-center">
          <button
            onClick={() => setShowContactForm(true)}
            className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xl shadow-xl transition-all"
          >
            Book This Trip
          </button>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Almost There!</h3>
            <p className="text-gray-600 mb-6">
              Please provide your contact details to complete your booking request.
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
                onClick={handleBookTrip}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
