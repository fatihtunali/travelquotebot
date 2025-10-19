'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CITY_OPTIONS } from '@/lib/cityMapping';

interface FormData {
  customerName: string;
  email: string;
  numberOfTravelers: number;
  duration: number;
  budget: string;
  interests: string[];
  startDate: string;
  cities: string[];
  arrivalCity: string;
  departureCity: string;
  accommodationType: string;
  additionalRequests: string;
}

const INTERESTS = [
  'Historical Sites',
  'Beach & Relaxation',
  'Adventure & Hiking',
  'Cultural Experiences',
  'Food & Cuisine',
  'Shopping',
  'Hot Air Balloon',
  'Photography',
  'Nature & Wildlife',
  'Nightlife'
];

const CITIES = CITY_OPTIONS;

export default function CreateItineraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    email: '',
    numberOfTravelers: 2,
    duration: 7,
    budget: 'medium',
    interests: [],
    startDate: '',
    cities: ['Istanbul'],
    arrivalCity: 'Istanbul',
    departureCity: 'Istanbul',
    accommodationType: 'hotel',
    additionalRequests: '',
  });

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch('/api/operator/settings', {
          credentials: 'include',
        });
        if (response.status === 401) {
          router.push('/auth/login');
        }
      } catch (err) {
        router.push('/auth/login');
      }
    };

    verifySession();
  }, [router]);

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
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate itinerary');
      }

      router.push(`/itinerary/${data.itineraryId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Create Itinerary
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* AI Loading Modal */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                {/* Animated AI Icon */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>

                {/* Loading Text */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Creating Your Perfect Itinerary
                </h3>
                <p className="text-gray-600 mb-6">
                  Claude AI is analyzing your preferences and crafting a personalized travel plan with real pricing from our database...
                </p>

                {/* Progress Steps */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-gray-700">Fetching available accommodations & activities</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <span className="text-gray-700">Analyzing your preferences & budget</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    <span className="text-gray-700">Calculating exact pricing for {formData.duration} days</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse" style={{animationDelay: '0.6s'}}></div>
                    <span className="text-gray-700">Optimizing day-by-day schedule</span>
                  </div>
                </div>

                {/* Time Estimate */}
                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    ⏱️ This usually takes 20-40 seconds. Our AI is crafting your perfect itinerary!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Travelers
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formData.numberOfTravelers || ''}
                  onChange={(e) => setFormData({ ...formData, numberOfTravelers: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Range
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="budget">Budget ($50-100/day)</option>
                  <option value="medium">Medium ($100-200/day)</option>
                  <option value="luxury">Luxury ($200+/day)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival City
                </label>
                <select
                  value={formData.arrivalCity}
                  onChange={(e) => setFormData({ ...formData, arrivalCity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure City
                </label>
                <select
                  value={formData.departureCity}
                  onChange={(e) => setFormData({ ...formData, departureCity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accommodation Type
                </label>
                <select
                  value={formData.accommodationType}
                  onChange={(e) => setFormData({ ...formData, accommodationType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Cities to Visit</h2>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <span className="font-medium">
                    {formData.duration ? (
                      <>Based on your {formData.duration}-day trip, you can select up to {getMaxCities()} {getMaxCities() === 1 ? 'city' : 'cities'}.</>
                    ) : (
                      <>Select trip duration first to see how many cities you can visit.</>
                    )}
                  </span>
                  <br />
                  <span className="text-blue-700">Each city requires a minimum of 2 nights to explore properly.</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {CITIES.map(city => {
                const maxCities = getMaxCities();
                const isSelected = formData.cities.includes(city);
                const isDisabled = !isSelected && formData.cities.length >= maxCities;

                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => toggleCity(city)}
                    disabled={isDisabled}
                    className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {city}
                  </button>
                );
              })}
            </div>
            {formData.cities.length >= getMaxCities() && formData.duration >= 4 && (
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                Maximum cities reached for {formData.duration} days. Increase trip duration or deselect a city to choose another.
              </div>
            )}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Selected Route:</div>
              <div className="text-sm text-gray-600">
                {formData.cities.length > 0
                  ? formData.cities.join(' → ')
                  : 'No cities selected'}
              </div>
              {formData.cities.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  ≈ {Math.floor(formData.duration / formData.cities.length)} nights per city
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Interests & Preferences</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`p-3 rounded-lg border-2 transition text-sm ${
                    formData.interests.includes(interest)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Requests</h2>
            <textarea
              value={formData.additionalRequests}
              onChange={(e) => setFormData({ ...formData, additionalRequests: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special requirements, dietary restrictions, accessibility needs, etc."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {loading ? 'Generating Itinerary...' : 'Generate AI Itinerary'}
          </button>
        </form>
      </main>
    </div>
  );
}
