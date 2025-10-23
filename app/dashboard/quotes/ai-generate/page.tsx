'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CityNightsSelector from '@/components/itinerary/CityNightsSelector';

interface CityNight {
  city: string;
  nights: number;
}

export default function AIGenerateQuotePage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cityNights, setCityNights] = useState<CityNight[]>([{ city: '', nights: 1 }]);
  const [startDate, setStartDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [hotelCategory, setHotelCategory] = useState<'3' | '4' | '5'>('4');
  const [tourType, setTourType] = useState<'SIC' | 'PRIVATE'>('PRIVATE');
  const [specialRequests, setSpecialRequests] = useState('');

  const handleGenerate = async () => {
    // Validation
    if (!customerName || !customerEmail || !startDate) {
      alert('Please fill in customer name, email, and start date');
      return;
    }

    if (cityNights.length === 0 || !cityNights.every(cn => cn.city && cn.nights > 0)) {
      alert('Please select at least one city with nights');
      return;
    }

    setGenerating(true);

    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);

      // Calculate end date
      const totalNights = cityNights.reduce((sum, cn) => sum + cn.nights, 0);
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + totalNights);
      const endDate = end.toISOString().split('T')[0];

      // Create destination string
      const destination = cityNights
        .filter(cn => cn.city)
        .map(cn => cn.city)
        .join(' & ');

      const response = await fetch(`/api/quotes/${parsedUser.organizationId}/ai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          destination,
          city_nights: cityNights,
          start_date: startDate,
          end_date: endDate,
          adults,
          children,
          hotel_category: hotelCategory,
          tour_type: tourType,
          special_requests: specialRequests
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate itinerary');
      }

      const data = await response.json();

      alert(`✨ AI-Generated Itinerary Created!\n\nQuote: ${data.quote_number}\nTotal: €${data.total_price.toFixed(2)}`);

      // Redirect to the created quote
      router.push(`/dashboard/quotes/${data.quote_id}`);

    } catch (error: any) {
      console.error('Error generating itinerary:', error);
      alert(`Failed to generate itinerary: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h1 className="text-3xl font-bold">AI-Powered Quote Generator</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Enter basic details and let AI create a complete, professional itinerary in seconds!
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-green-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Trip Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cities & Nights *</label>
                  <CityNightsSelector
                    cityNights={cityNights}
                    onChange={setCityNights}
                    isEditable={true}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Adults *</label>
                    <input
                      type="number"
                      min="1"
                      value={adults}
                      onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Children</label>
                    <input
                      type="number"
                      min="0"
                      value={children}
                      onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Preferences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Category</label>
                  <select
                    value={hotelCategory}
                    onChange={(e) => setHotelCategory(e.target.value as '3' | '4' | '5')}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="3">3-Star (Budget)</option>
                    <option value="4">4-Star (Standard)</option>
                    <option value="5">5-Star (Luxury)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tour Type</label>
                  <select
                    value={tourType}
                    onChange={(e) => setTourType(e.target.value as 'SIC' | 'PRIVATE')}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="SIC">SIC (Seat-in-Coach / Group)</option>
                    <option value="PRIVATE">Private Tours</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Special Requests (Optional)</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Any special requirements, preferences, or notes..."
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-6">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    Generating Amazing Itinerary...
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Complete Itinerary with AI
                  </>
                )}
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                AI will create a complete itinerary with hotels, tours, transfers, and pricing in ~30 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
