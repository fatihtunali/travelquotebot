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
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null);
  const [itineraryId, setItineraryId] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    numberOfTravelers: 2,
    duration: 7,
    budget: 'medium',
    interests: [] as string[],
    startDate: '',
    arrivalCity: 'Istanbul',
    departureCity: 'Istanbul',
    accommodationType: 'hotel',
    additionalRequests: '',
  });

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

      // Show generated itinerary on screen
      setGeneratedItinerary(data.itinerary);
      setItineraryId(data.itineraryId);
      setSubmitting(false);

      // Scroll to top to show itinerary
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        {/* Generated Itinerary Display */}
        {generatedItinerary ? (
          <div className="space-y-6 mb-8">
            {/* Success Message */}
            <div className="bubble-card p-8 text-center bg-gradient-to-br from-white to-green-50">
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                ✅
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Your Itinerary is Ready!
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                {generatedItinerary.title}
              </p>
              <p className="text-gray-600">{generatedItinerary.summary}</p>
            </div>

            {/* Itinerary Days */}
            {generatedItinerary.days?.map((day: any, index: number) => (
              <div key={index} className="bubble-card p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    {day.day}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{day.title}</h3>
                    <p className="text-gray-600">{day.city}</p>
                  </div>
                </div>

                {/* Activities */}
                {day.activities && day.activities.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-lg mb-3 text-gray-800">Activities</h4>
                    <div className="space-y-4">
                      {day.activities.map((activity: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-gray-800">{activity.title}</h5>
                            <span className="text-sm text-gray-600">{activity.time}</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Duration: {activity.duration}</span>
                            <span>Cost: ${activity.cost?.min} - ${activity.cost?.max}</span>
                          </div>
                          {activity.tips && (
                            <p className="text-xs text-blue-600 mt-2">Tip: {activity.tips}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accommodation */}
                {day.accommodation && (
                  <div className="mb-6">
                    <h4 className="font-bold text-lg mb-3 text-gray-800">Accommodation</h4>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <h5 className="font-bold text-gray-800 mb-1">{day.accommodation.name}</h5>
                      <p className="text-sm text-gray-600 mb-2">{day.accommodation.description}</p>
                      <p className="text-xs text-gray-500">
                        ${day.accommodation.pricePerNight?.min} - ${day.accommodation.pricePerNight?.max} per night
                      </p>
                    </div>
                  </div>
                )}

                {/* Meals */}
                {day.meals && day.meals.length > 0 && (
                  <div>
                    <h4 className="font-bold text-lg mb-3 text-gray-800">Meals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {day.meals.map((meal: any, idx: number) => (
                        <div key={idx} className="bg-orange-50 p-3 rounded-xl">
                          <p className="font-bold text-sm text-gray-800 capitalize">{meal.type}</p>
                          <p className="text-xs text-gray-600">{meal.restaurant}</p>
                          <p className="text-xs text-gray-500">{meal.cuisine}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Total Cost */}
            {generatedItinerary.totalEstimatedCost && (
              <div className="bubble-card p-8 bg-gradient-to-br from-green-50 to-emerald-50">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Estimated Total Cost</h3>
                <p className="text-4xl font-bold" style={{ color: primaryColor }}>
                  ${generatedItinerary.totalEstimatedCost.min} - ${generatedItinerary.totalEstimatedCost.max}
                </p>
                <p className="text-gray-600 mt-2">Per person for {formData.numberOfTravelers} travelers</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="px-8 py-4 bg-white border-2 rounded-xl font-bold hover:shadow-lg transition-all"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => setGeneratedItinerary(null)}
                className="px-8 py-4 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                ✨ Create Another Itinerary
              </button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-600 text-sm">
        <p>Powered by {operator.companyName}</p>
      </footer>
    </div>
  );
}
