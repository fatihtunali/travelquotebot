'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Operator {
  id: string;
  companyName: string;
  subdomain: string;
  logoUrl: string | null;
  brandColors: {
    primary: string;
    secondary: string;
  };
}

export default function RequestItineraryPage() {
  const router = useRouter();
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    numberOfTravelers: 2,
    duration: 7,
    budget: 'medium',
    interests: [] as string[],
    startDate: '',
    cities: ['Istanbul'] as string[],
    arrivalCity: 'Istanbul',
    departureCity: 'Istanbul',
    accommodationType: 'hotel',
    additionalRequests: '',
  });

  const CITIES = [
    'Istanbul',
    'Cappadocia',
    'Antalya',
    'Bodrum',
    'Izmir',
    'Pamukkale',
    'Ephesus',
    'Fethiye',
    'Marmaris',
    'Ankara'
  ];

  const interestOptions = [
    'Historical Sites',
    'Food & Cuisine',
    'Nature & Adventure',
    'Beach & Relaxation',
    'Shopping',
    'Nightlife',
    'Cultural Experiences',
    'Photography',
  ];

  useEffect(() => {
    const fetchOperator = async () => {
      try {
        const response = await fetch(`/api/public/operator/${subdomain}`);

        if (!response.ok) {
          throw new Error('Operator not found');
        }

        const data = await response.json();
        setOperator(data.operator);
      } catch (err: any) {
        console.error('Error loading operator:', err);
        setMessage('Unable to load booking page. Please check the URL.');
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchOperator();
    }
  }, [subdomain]);

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const getMaxCities = () => {
    // Each city needs minimum 2 nights
    if (!formData.duration || formData.duration < 2) return 1;
    return Math.floor(formData.duration / 2);
  };

  const toggleCity = (city: string) => {
    setFormData(prev => {
      const maxCities = getMaxCities();
      const isSelected = prev.cities.includes(city);

      if (isSelected) {
        // Must keep at least 1 city
        if (prev.cities.length === 1) return prev;
        return { ...prev, cities: prev.cities.filter(c => c !== city) };
      } else {
        // Maximum cities based on duration
        if (prev.cities.length >= maxCities) return prev;
        return { ...prev, cities: [...prev.cities, city] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`/api/public/itinerary/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          operatorId: operator?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate itinerary');
      }

      // Redirect to itinerary view page (same pattern as dashboard)
      router.push(`/request/${subdomain}/itinerary/${data.itineraryId}`);
    } catch (err: any) {
      setMessage(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bubble-card p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
          <p className="text-gray-600">{message || 'This booking page does not exist.'}</p>
        </div>
      </div>
    );
  }

  const primaryColor = operator.brandColors.primary;
  const secondaryColor = operator.brandColors.secondary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 justify-center">
            {operator.logoUrl ? (
              <img
                src={operator.logoUrl}
                alt={operator.companyName}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                ✈️
              </div>
            )}
            <h1
              className="text-3xl font-bold bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {operator.companyName}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
            <div className="bubble-card p-8 mb-8 text-center bg-gradient-to-br from-white to-blue-50">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Plan Your Dream Turkey Trip
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tell us about your travel preferences and we'll create a personalized itinerary just for you.
              </p>
            </div>

            {message && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-700">
                {message}
              </div>
            )}

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bubble-card p-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Your Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Number of Travelers *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.numberOfTravelers}
                  onChange={(e) => setFormData({ ...formData, numberOfTravelers: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bubble-card p-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Trip Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Trip Duration (days) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Cities to Visit * (Max {getMaxCities()})
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Select up to {getMaxCities()} cities based on your {formData.duration}-day trip
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => toggleCity(city)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 ${
                      formData.cities.includes(city)
                        ? 'text-white shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                    style={
                      formData.cities.includes(city)
                        ? {
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                            borderColor: primaryColor,
                          }
                        : {}
                    }
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Arrival City *
                </label>
                <select
                  required
                  value={formData.arrivalCity}
                  onChange={(e) => setFormData({ ...formData, arrivalCity: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                >
                  <option value="Istanbul">Istanbul</option>
                  <option value="Ankara">Ankara</option>
                  <option value="Izmir">Izmir</option>
                  <option value="Antalya">Antalya</option>
                  <option value="Göreme">Göreme (Cappadocia)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Departure City *
                </label>
                <select
                  required
                  value={formData.departureCity}
                  onChange={(e) => setFormData({ ...formData, departureCity: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                >
                  <option value="Istanbul">Istanbul</option>
                  <option value="Ankara">Ankara</option>
                  <option value="Izmir">Izmir</option>
                  <option value="Antalya">Antalya</option>
                  <option value="Göreme">Göreme (Cappadocia)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Budget Level *
                </label>
                <select
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                >
                  <option value="budget">Budget (Economy)</option>
                  <option value="medium">Medium (Comfort)</option>
                  <option value="luxury">Luxury (Premium)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Accommodation Type *
                </label>
                <select
                  required
                  value={formData.accommodationType}
                  onChange={(e) => setFormData({ ...formData, accommodationType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                >
                  <option value="hotel">Hotel</option>
                  <option value="boutique">Boutique Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="hostel">Hostel</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bubble-card p-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Your Interests</h3>
            <p className="text-gray-600 mb-4">Select all that apply</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 ${
                    formData.interests.includes(interest)
                      ? 'text-white shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                  style={
                    formData.interests.includes(interest)
                      ? {
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                          borderColor: primaryColor,
                        }
                      : {}
                  }
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Requests */}
          <div className="bubble-card p-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Additional Requests</h3>

            <textarea
              value={formData.additionalRequests}
              onChange={(e) => setFormData({ ...formData, additionalRequests: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
              placeholder="Any special requirements, dietary restrictions, accessibility needs, or specific activities you'd like to include..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="px-12 py-4 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
              style={{
                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {submitting ? '✨ Generating Your Itinerary...' : '✨ Generate My Itinerary'}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-600 text-sm">
        <p>Powered by {operator.companyName}</p>
      </footer>
    </div>
  );
}
