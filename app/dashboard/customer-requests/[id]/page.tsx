'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerRequestDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPricing, setShowPricing] = useState(true); // Show pricing by default for operators

  useEffect(() => {
    fetchItinerary();
  }, [resolvedParams.id]);

  const fetchItinerary = async () => {
    try {
      const response = await fetch(`/api/itinerary/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Itinerary not found');

      const data = await response.json();
      setItinerary(data);
    } catch (error) {
      console.error('Error fetching itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (action: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/customer-requests/${user.organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itineraryId: resolvedParams.id,
          action
        })
      });

      if (response.ok) {
        fetchItinerary();
        alert(`Itinerary ${action}ed successfully`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Itinerary not found</p>
        </div>
      </div>
    );
  }

  const itineraryData = typeof itinerary.itinerary_data === 'string'
    ? JSON.parse(itinerary.itinerary_data)
    : itinerary.itinerary_data;

  const totalPeople = itinerary.adults + itinerary.children;

  // Calculate item totals
  let itemSummary: any = {
    hotels: [],
    tours: [],
    vehicles: [],
    meals: [],
    entrance_fees: [],
    other: []
  };

  let grandTotal = 0;

  if (itineraryData?.days) {
    itineraryData.days.forEach((day: any) => {
      if (day.items) {
        day.items.forEach((item: any) => {
          const itemTotal = item.total_price || 0;
          grandTotal += itemTotal;

          const itemInfo = {
            day: day.day_number,
            name: item.name,
            price_per_unit: item.price_per_unit,
            quantity: item.quantity,
            total: itemTotal
          };

          if (item.type === 'hotel') {
            itemSummary.hotels.push(itemInfo);
          } else if (item.type === 'tour') {
            itemSummary.tours.push(itemInfo);
          } else if (item.type === 'vehicle') {
            itemSummary.vehicles.push(itemInfo);
          } else if (item.type === 'meal') {
            itemSummary.meals.push(itemInfo);
          } else if (item.type === 'entrance_fee') {
            itemSummary.entrance_fees.push(itemInfo);
          } else {
            itemSummary.other.push(itemInfo);
          }
        });
      }
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Operator Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/80 text-sm mb-1">Customer Request #{itinerary.id}</div>
            <h1 className="text-3xl font-bold text-white mb-2">{itinerary.destination}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <span>{itinerary.customer_name}</span>
              <span>•</span>
              <span>{itinerary.customer_email}</span>
              {itinerary.customer_phone && (
                <>
                  <span>•</span>
                  <span>{itinerary.customer_phone}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/dashboard/customer-requests')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setShowPricing(!showPricing)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
            >
              {showPricing ? 'Hide' : 'Show'} Pricing
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex gap-2">
          {itinerary.status === 'pending' && (
            <>
              <button
                onClick={() => updateStatus('confirm')}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
              >
                ✓ Confirm
              </button>
              <button
                onClick={() => updateStatus('cancel')}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                ✗ Cancel
              </button>
            </>
          )}
          {itinerary.status === 'confirmed' && (
            <button
              onClick={() => updateStatus('complete')}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Pricing Breakdown - VISIBLE TO OPERATORS ONLY */}
      {showPricing && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-amber-900">Pricing Breakdown (Operator View)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Hotels */}
            {itemSummary.hotels.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🏨</span> Hotels
                </h3>
                <div className="space-y-2">
                  {itemSummary.hotels.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm border-b border-gray-100 pb-2">
                      <div className="font-medium text-gray-900">Day {item.day}: {item.name}</div>
                      <div className="flex justify-between text-gray-600">
                        <span>€{item.price_per_unit} × {item.quantity}</span>
                        <span className="font-semibold">€{item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-bold text-gray-900">
                    <span>Subtotal:</span>
                    <span>€{itemSummary.hotels.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tours */}
            {itemSummary.tours.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🎯</span> Tours
                </h3>
                <div className="space-y-2">
                  {itemSummary.tours.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm border-b border-gray-100 pb-2">
                      <div className="font-medium text-gray-900">Day {item.day}: {item.name}</div>
                      <div className="flex justify-between text-gray-600">
                        <span>€{item.price_per_unit} × {item.quantity}</span>
                        <span className="font-semibold">€{item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-bold text-gray-900">
                    <span>Subtotal:</span>
                    <span>€{itemSummary.tours.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Vehicles */}
            {itemSummary.vehicles.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🚐</span> Vehicles & Transfers
                </h3>
                <div className="space-y-2">
                  {itemSummary.vehicles.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm border-b border-gray-100 pb-2">
                      <div className="font-medium text-gray-900">Day {item.day}: {item.name}</div>
                      <div className="flex justify-between text-gray-600">
                        <span>€{item.price_per_unit} × {item.quantity}</span>
                        <span className="font-semibold">€{item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-bold text-gray-900">
                    <span>Subtotal:</span>
                    <span>€{itemSummary.vehicles.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Meals */}
            {itemSummary.meals.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🍽️</span> Meals
                </h3>
                <div className="space-y-2">
                  {itemSummary.meals.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm border-b border-gray-100 pb-2">
                      <div className="font-medium text-gray-900">Day {item.day}: {item.name}</div>
                      <div className="flex justify-between text-gray-600">
                        <span>€{item.price_per_unit} × {item.quantity}</span>
                        <span className="font-semibold">€{item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-bold text-gray-900">
                    <span>Subtotal:</span>
                    <span>€{itemSummary.meals.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Entrance Fees */}
            {itemSummary.entrance_fees.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🎫</span> Entrance Fees
                </h3>
                <div className="space-y-2">
                  {itemSummary.entrance_fees.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm border-b border-gray-100 pb-2">
                      <div className="font-medium text-gray-900">Day {item.day}: {item.name}</div>
                      <div className="flex justify-between text-gray-600">
                        <span>€{item.price_per_unit} × {item.quantity}</span>
                        <span className="font-semibold">€{item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-bold text-gray-900">
                    <span>Subtotal:</span>
                    <span>€{itemSummary.entrance_fees.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-100 text-sm mb-1">Total Trip Cost</div>
                <div className="text-4xl font-bold">€{parseFloat(itinerary.total_price || 0).toFixed(2)}</div>
                <div className="text-green-100 text-sm mt-1">
                  €{parseFloat(itinerary.price_per_person || 0).toFixed(2)} per person × {totalPeople} travelers
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-100 text-sm mb-1">Calculated Total</div>
                <div className="text-3xl font-bold">€{grandTotal.toFixed(2)}</div>
                {Math.abs(grandTotal - parseFloat(itinerary.total_price || 0)) > 0.01 && (
                  <div className="text-xs text-red-200 mt-1">
                    ⚠️ Mismatch: €{Math.abs(grandTotal - parseFloat(itinerary.total_price || 0)).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer-Facing Itinerary (same as customer sees) */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Day-by-Day Itinerary</h2>
        <div className="space-y-6">
          {itineraryData.days.map((day: any, index: number) => (
            <div key={index} className="border-l-4 border-blue-500 pl-6 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                  {day.day_number}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{day.title}</h3>
                  <p className="text-sm text-gray-600">{formatDate(day.date)} • {day.location}</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{day.narrative}</p>
              {day.meals && (
                <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-sm font-semibold text-blue-700">
                  <span>🍽️</span>
                  <span>Meals: {day.meals}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hotels Section */}
      {itinerary.hotels_used && itinerary.hotels_used.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Accommodations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {itinerary.hotels_used.map((hotel: any) => (
              <div key={hotel.id} className="border rounded-lg overflow-hidden">
                {hotel.image_url && (
                  <img src={hotel.image_url} alt={hotel.hotel_name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex gap-1 mb-2">
                    {[...Array(hotel.star_rating || 0)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <h3 className="font-bold text-gray-900">{hotel.hotel_name}</h3>
                  <p className="text-sm text-gray-600">{hotel.city}</p>
                  {hotel.google_rating && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="font-semibold">{hotel.google_rating}</span> Google Rating
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
