'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Itinerary {
  id: string;
  customerName: string;
  customerEmail: string;
  numberOfTravelers: number;
  duration: number;
  budget: string;
  startDate: string;
  status: string;
  itineraryData: {
    title: string;
    summary: string;
    totalEstimatedCost: {
      min: number;
      max: number;
      currency: string;
    };
    days: Array<{
      day: number;
      title: string;
      city: string;
      activities: Array<{
        time: string;
        title: string;
        description: string;
        duration: string;
        cost: { min: number; max: number };
        tips?: string;
      }>;
      accommodation: {
        name: string;
        type: string;
        pricePerNight: { min: number; max: number };
        description: string;
      };
      meals: Array<{
        type: string;
        restaurant: string;
        cuisine: string;
        estimatedCost: { min: number; max: number };
      }>;
      transportation?: {
        method: string;
        from: string;
        to: string;
        duration: string;
        cost: { min: number; max: number };
      };
    }>;
    packingList: string[];
    importantNotes: string[];
  };
}

export default function ItineraryViewPage() {
  const router = useRouter();
  const params = useParams();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`/api/itinerary/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {itinerary.customerName} | {itinerary.numberOfTravelers} travelers | {itinerary.duration} days
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Print PDF
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Dashboard
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
              <div className="text-sm text-gray-600">Estimated Cost</div>
              <div className="text-2xl font-bold text-blue-600">
                ${data.totalEstimatedCost.min} - ${data.totalEstimatedCost.max}
              </div>
              <div className="text-xs text-gray-500">{data.totalEstimatedCost.currency}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Duration</div>
              <div className="text-2xl font-bold text-green-600">{itinerary.duration} Days</div>
              <div className="text-xs text-gray-500">Starting {new Date(itinerary.startDate).toLocaleDateString()}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Budget Level</div>
              <div className="text-2xl font-bold text-purple-600 capitalize">{itinerary.budget}</div>
              <div className="text-xs text-gray-500">{itinerary.numberOfTravelers} travelers</div>
            </div>
          </div>
        </div>

        {/* Day by Day */}
        <div className="space-y-6">
          {data.days.map((day, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm opacity-90">Day {day.day}</div>
                    <h3 className="text-xl font-bold">{day.title}</h3>
                    <div className="text-sm opacity-90">{day.city}</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Activities */}
                {day.activities && day.activities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Activities</h4>
                    <div className="space-y-3">
                      {day.activities.map((activity, actIdx) => (
                        <div key={actIdx} className="border-l-4 border-blue-400 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-blue-600">{activity.time}</span>
                                <span className="text-sm text-gray-500">({activity.duration})</span>
                              </div>
                              <h5 className="font-semibold">{activity.title}</h5>
                              <p className="text-gray-700 text-sm mt-1">{activity.description}</p>
                              {activity.tips && (
                                <p className="text-xs text-gray-600 mt-1 italic">💡 {activity.tips}</p>
                              )}
                            </div>
                            <div className="text-right text-sm">
                              <span className="font-medium">${activity.cost.min}-${activity.cost.max}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transportation */}
                {day.transportation && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Transportation</h4>
                    <div className="text-sm">
                      <div className="font-medium">{day.transportation.method}</div>
                      <div className="text-gray-700">
                        {day.transportation.from} → {day.transportation.to}
                      </div>
                      <div className="text-gray-600">
                        Duration: {day.transportation.duration} |
                        Cost: ${day.transportation.cost.min}-${day.transportation.cost.max}
                      </div>
                    </div>
                  </div>
                )}

                {/* Meals */}
                {day.meals && day.meals.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Meals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {day.meals.map((meal, mealIdx) => (
                        <div key={mealIdx} className="border rounded-lg p-3">
                          <div className="text-xs text-gray-500 uppercase">{meal.type}</div>
                          <div className="font-medium">{meal.restaurant}</div>
                          <div className="text-sm text-gray-600">{meal.cuisine}</div>
                          <div className="text-sm font-medium mt-1">
                            ${meal.estimatedCost.min}-${meal.estimatedCost.max}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accommodation */}
                {day.accommodation && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Accommodation</h4>
                    <div className="font-medium">{day.accommodation.name}</div>
                    <div className="text-sm text-gray-700">{day.accommodation.description}</div>
                    <div className="text-sm font-medium mt-2">
                      ${day.accommodation.pricePerNight.min}-${day.accommodation.pricePerNight.max} per night
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Packing List & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
        </div>
      </main>
    </div>
  );
}
