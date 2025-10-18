'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Itinerary {
  id: string;
  customerName: string;
  customerEmail: string;
  numberOfTravelers: number;
  duration: number;
  budget: string;
  startDate: string;
  status: string;
  createdAt: string;
  itineraryData: {
    title: string;
    summary: string;
  };
}

export default function ItinerariesPage() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const response = await fetch('/api/itineraries', {
          credentials: 'include',
        });

        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load itineraries');
        }

        const data = await response.json();
        setItineraries(data.itineraries || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading itineraries...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">My Itineraries</h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/itinerary/create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create New
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

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {itineraries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Itineraries Yet</h2>
            <p className="text-gray-600 mb-6">Create your first AI-powered travel itinerary</p>
            <button
              onClick={() => router.push('/itinerary/create')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Create Itinerary
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => (
              <div
                key={itinerary.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/itinerary/${itinerary.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {itinerary.itineraryData?.title || 'Untitled Itinerary'}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(itinerary.status)}`}>
                      {itinerary.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {itinerary.itineraryData?.summary || 'No summary available'}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Customer:</span>
                      <span>{itinerary.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Duration:</span>
                      <span>{itinerary.duration} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Travelers:</span>
                      <span>{itinerary.numberOfTravelers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Start Date:</span>
                      <span>{new Date(itinerary.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Created:</span>
                      <span>{new Date(itinerary.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/itinerary/${itinerary.id}`);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
