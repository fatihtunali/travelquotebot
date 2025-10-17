'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Request {
  id: string;
  customerName: string;
  customerEmail: string;
  numTravelers: number;
  startDate: string;
  endDate: string;
  preferences: any;
  status: string;
  createdAt: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/operator/requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRequests(data.requests);
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'booked':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-purple-100 text-purple-700 border-purple-300';
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Customer Requests
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredRequests.length} {filter === 'all' ? 'total' : filter} request{filteredRequests.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="bubble-card p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            {['all', 'generated', 'contacted', 'booked', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === status
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({requests.filter(r => status === 'all' || r.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bubble-card p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Requests Yet</h3>
            <p className="text-gray-600">
              When customers generate itineraries, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bubble-card p-6 hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {request.customerName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">Email:</span> {request.customerEmail}
                      </div>
                      <div>
                        <span className="font-semibold">Travelers:</span> {request.numTravelers} people
                      </div>
                      <div>
                        <span className="font-semibold">Dates:</span> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold">Budget:</span> {request.preferences?.budget || 'N/A'}
                      </div>
                      {request.preferences?.phone && (
                        <div>
                          <span className="font-semibold">Phone:</span> {request.preferences.phone}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Requested:</span> {new Date(request.createdAt).toLocaleDateString()} {new Date(request.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    {request.preferences?.interests && request.preferences.interests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {request.preferences.interests.map((interest: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => router.push(`/itinerary/${request.id}`)}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      View Itinerary
                    </button>
                    <a
                      href={`mailto:${request.customerEmail}`}
                      className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:shadow-lg transition-all text-center"
                    >
                      📧 Contact Customer
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
