'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface ItineraryItem {
  type: string;
  name: string;
  price_per_unit: number;
  quantity: number;
  total_price: number;
  hotel_id?: number;
  tour_id?: number;
  transfer_id?: number;
  vehicle_id?: number;
  [key: string]: any;
}

interface ItineraryDay {
  day_number: number;
  date: string;
  title: string;
  location: string;
  narrative: string;
  meals: string;
  items: ItineraryItem[];
}

export default function EditCustomerRequestPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [itinerary, setItinerary] = useState<any>(null);
  const [itineraryData, setItineraryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItinerary();
  }, [resolvedParams.id]);

  const fetchItinerary = async () => {
    try {
      const response = await fetch(`/api/itinerary/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Itinerary not found');

      const data = await response.json();
      setItinerary(data);

      const parsedData = typeof data.itinerary_data === 'string'
        ? JSON.parse(data.itinerary_data)
        : data.itinerary_data;

      setItineraryData(parsedData);
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      alert('Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  };

  const updateItemField = (dayIndex: number, itemIndex: number, field: string, value: any) => {
    const updated = { ...itineraryData };
    updated.days[dayIndex].items[itemIndex][field] = value;

    // Recalculate total_price based on item type
    const item = updated.days[dayIndex].items[itemIndex];

    if (field === 'price_per_unit' || field === 'quantity' || field === 'nights') {
      if (item.type === 'hotel') {
        // Hotel: price_per_unit (per person per night) × nights
        item.total_price = Number(item.price_per_unit || 0) * (Number(item.nights) || 1);
      } else if (item.type === 'vehicle' || item.type === 'transfer') {
        // Transfer/Vehicle: total cost (will be divided by pax for per-person display)
        item.total_price = Number(item.price_per_unit || 0) * (Number(item.quantity) || 1);
      } else {
        // Tour, meal, entrance_fee, etc.: per person cost
        item.total_price = Number(item.price_per_unit || 0) * (Number(item.quantity) || 1);
      }
    }

    setItineraryData(updated);
  };

  const calculatePerPersonCost = () => {
    let perPersonTotal = 0;
    const totalPeople = itinerary?.adults + itinerary?.children || 1;

    if (itineraryData?.days) {
      itineraryData.days.forEach((day: ItineraryDay) => {
        day.items?.forEach((item: ItineraryItem) => {
          if (item.type === 'hotel') {
            // Hotel: price_per_unit is already per person per night
            perPersonTotal += Number(item.price_per_unit || 0) * (Number(item.nights) || 1);
          } else if (item.type === 'vehicle' || item.type === 'transfer') {
            // Transfer/Vehicle: total cost divided by number of people
            const totalCost = Number(item.price_per_unit || 0) * (Number(item.quantity) || 1);
            perPersonTotal += totalCost / totalPeople;
          } else {
            // Tour, meal, entrance_fee, etc.: already per person
            perPersonTotal += Number(item.price_per_unit || 0);
          }
        });
      });
    }
    return perPersonTotal;
  };

  const calculateGroupTotal = () => {
    const totalPeople = itinerary?.adults + itinerary?.children || 1;
    return calculatePerPersonCost() * totalPeople;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user.organizationId) {
        alert('Organization ID not found. Please log in again.');
        return;
      }

      const pricePerPerson = calculatePerPersonCost();
      const totalPeople = itinerary.adults + itinerary.children;
      const grandTotal = pricePerPerson * totalPeople;

      // Update the itinerary via API
      const response = await fetch(`/api/itinerary/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itinerary_data: itineraryData,
          total_price: grandTotal,
          price_per_person: pricePerPerson
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      alert('Itinerary updated successfully!');
      router.push(`/dashboard/customer-requests/${resolvedParams.id}`);
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (dayIndex: number, itemIndex: number) => {
    if (!confirm('Are you sure you want to remove this item?')) return;

    const updated = { ...itineraryData };
    updated.days[dayIndex].items.splice(itemIndex, 1);
    setItineraryData(updated);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'hotel': return '🏨';
      case 'tour': return '🎯';
      case 'vehicle': return '🚐';
      case 'transfer': return '🚐';
      case 'meal': return '🍽️';
      case 'entrance_fee': return '🎫';
      default: return '📌';
    }
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

  if (!itinerary || !itineraryData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Itinerary not found</p>
        </div>
      </div>
    );
  }

  const perPersonCost = calculatePerPersonCost();
  const totalPeople = itinerary.adults + itinerary.children;
  const groupTotal = calculateGroupTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/80 text-sm mb-1">Editing Request #{itinerary.id}</div>
            <h1 className="text-3xl font-bold text-white mb-2">{itinerary.destination}</h1>
            <div className="flex items-center gap-4 text-white/90 flex-wrap">
              <span>{itinerary.customer_name}</span>
              <span>•</span>
              <span>{formatDate(itinerary.start_date)} to {formatDate(itinerary.end_date)}</span>
              <span>•</span>
              <span>{totalPeople} travelers</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/customer-requests/${resolvedParams.id}`)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-green-100 text-sm mb-1">Per Person in Double Room</div>
            <div className="text-4xl font-bold">€{perPersonCost.toFixed(2)}</div>
            <div className="text-green-100 text-sm mt-1">
              Cost per person for {totalPeople} travelers
            </div>
          </div>
          <div>
            <div className="text-green-100 text-sm mb-1">Total Group Package</div>
            <div className="text-4xl font-bold">€{groupTotal.toFixed(2)}</div>
            <div className="text-green-100 text-sm mt-1">
              €{perPersonCost.toFixed(2)} × {totalPeople} travelers
            </div>
          </div>
        </div>
        {Math.abs(groupTotal - parseFloat(itinerary.total_price || 0)) > 0.01 && (
          <div className="mt-4 pt-4 border-t border-green-400">
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-100">Original Total: €{parseFloat(itinerary.total_price || 0).toFixed(2)}</span>
              <span className="text-yellow-200 font-semibold">
                {groupTotal > parseFloat(itinerary.total_price || 0) ? '↑' : '↓'}
                €{Math.abs(groupTotal - parseFloat(itinerary.total_price || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Editable Days */}
      {!itineraryData?.days || itineraryData.days.length === 0 ? (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">No itinerary data found</p>
          <p className="text-red-600 text-sm">Please go back and try again.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {itineraryData.days.map((day: ItineraryDay, dayIndex: number) => (
          <div key={dayIndex} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                {day.day_number}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{day.title}</h3>
                <p className="text-sm text-gray-600">{formatDate(day.date)} • {day.location}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {day.items?.map((item: ItineraryItem, itemIndex: number) => (
                <div key={itemIndex} className="border-2 border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{getItemIcon(item.type)}</div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Name */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Item Name ({item.type})
                          </label>
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => updateItemField(dayIndex, itemIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>

                        {/* Price per unit */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            {item.type === 'hotel' ? 'Per Person/Night (€)' :
                             item.type === 'vehicle' || item.type === 'transfer' ? 'Total Cost (€)' :
                             'Per Person (€)'}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.price_per_unit || 0}
                            onChange={(e) => updateItemField(dayIndex, itemIndex, 'price_per_unit', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>

                        {/* Nights (for hotels) or Quantity (for others) */}
                        {item.type === 'hotel' ? (
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Nights
                            </label>
                            <input
                              type="number"
                              value={item.nights || 1}
                              onChange={(e) => updateItemField(dayIndex, itemIndex, 'nights', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              value={item.quantity || 1}
                              onChange={(e) => updateItemField(dayIndex, itemIndex, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Total and Remove */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-sm">
                          {item.type === 'hotel' ? (
                            <>
                              <span className="text-gray-700 font-semibold">Per Person: </span>
                              <span className="font-bold text-gray-900">€{((item.price_per_unit || 0) * (item.nights || 1)).toFixed(2)}</span>
                              <span className="text-gray-600 ml-2">
                                (€{item.price_per_unit || 0} × {item.nights || 1} night{(item.nights || 1) > 1 ? 's' : ''})
                              </span>
                            </>
                          ) : item.type === 'vehicle' || item.type === 'transfer' ? (
                            <>
                              <span className="text-gray-700 font-semibold">Total Cost: </span>
                              <span className="font-bold text-gray-900">€{((item.price_per_unit || 0) * (item.quantity || 1)).toFixed(2)}</span>
                              <span className="text-gray-600 ml-2">
                                (€{((item.price_per_unit || 0) * (item.quantity || 1) / totalPeople).toFixed(2)} per person)
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-700 font-semibold">Per Person: </span>
                              <span className="font-bold text-gray-900">€{(item.price_per_unit || 0).toFixed(2)}</span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(dayIndex, itemIndex)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Save Button (Bottom) */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => router.push(`/dashboard/customer-requests/${resolvedParams.id}`)}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
