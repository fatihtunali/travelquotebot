'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  customerName: string;
  email: string;
  numberOfTravelers: number;
  duration: number;
  budget: string;
  interests: string[];
  startDate: string;
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
              type="button"
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
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse [animation-delay:0s]"></div>
                    <span className="text-gray-700">Fetching available accommodations & activities</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse [animation-delay:0.2s]"></div>
                    <span className="text-gray-700">Analyzing your preferences & budget</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse [animation-delay:0.4s]"></div>
                    <span className="text-gray-700">Calculating exact pricing for {formData.duration} days</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse [animation-delay:0.6s]"></div>
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
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  id="customerName"
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
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
                <label htmlFor="numberOfTravelers" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Travelers
                </label>
                <input
                  id="numberOfTravelers"
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
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  id="duration"
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
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Range
                </label>
                <select
                  id="budget"
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
                <label htmlFor="accommodationType" className="block text-sm font-medium text-gray-700 mb-1">
                  Accommodation Type
                </label>
                <select
                  id="accommodationType"
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
            <h2 className="text-xl font-semibold mb-4">Tell Us About Your Dream Trip</h2>
            <p className="text-gray-600 mb-4">
              Share any details that will help us create the perfect itinerary for you. Our AI will select the best destinations and experiences based on your preferences.
            </p>
            <textarea
              value={formData.additionalRequests}
              onChange={(e) => setFormData({ ...formData, additionalRequests: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Example: 'We want to experience authentic Turkish culture, try amazing food, and see some historical sites. We've heard great things about hot air balloons in Cappadocia. Also, my wife has dietary restrictions - vegetarian meals needed.' Note: Most trips start/end in Istanbul. Mention if you need a different arrival/departure city."
            />

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✨</div>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-800 mb-1">Our AI will intelligently:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Select the best Turkish cities based on your interests and trip duration</li>
                    <li>• Match accommodations to your budget and preferences</li>
                    <li>• Create a day-by-day itinerary with activities you'll love</li>
                    <li>• Provide accurate pricing for your group size</li>
                  </ul>
                </div>
              </div>
            </div>
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
