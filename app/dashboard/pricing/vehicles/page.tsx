'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VehiclesPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedVehicleType, setSelectedVehicleType] = useState('All');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cities = ['All', 'Istanbul', 'Antalya', 'Cappadocia', 'Izmir', 'Ankara'];
  const vehicleTypes = ['All', 'Vito', 'Sprinter', 'Isuzu', 'Coach'];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pricing/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map API data to match the expected format
        const mappedVehicles = data.map((vehicle: any) => ({
          id: vehicle.id,
          vehicleType: vehicle.vehicle_type,
          maxCapacity: vehicle.max_capacity,
          city: vehicle.city,
          seasonName: vehicle.season_name,
          startDate: vehicle.start_date,
          endDate: vehicle.end_date,
          currency: vehicle.currency,
          fullDay: vehicle.fullDay || vehicle.full_day,
          halfDay: vehicle.halfDay || vehicle.half_day,
          airportToHotel: vehicle.airportToHotel || vehicle.airport_to_hotel,
          hotelToAirport: vehicle.hotelToAirport || vehicle.hotel_to_airport,
          roundTrip: vehicle.roundTrip || vehicle.round_trip,
          notes: vehicle.notes,
          status: vehicle.status
        }));
        setVehicles(mappedVehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <button
                onClick={() => router.push('/dashboard/pricing')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2"
              >
                ← Back to Pricing
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Transportation & Vehicle Pricing</h1>
              <p className="text-sm text-gray-600">Manage vehicle rentals and airport transfer pricing by city</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
                📥 Import Excel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
                📤 Export Excel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
                + Add Vehicle
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={selectedVehicleType}
                onChange={(e) => setSelectedVehicleType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
              >
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Total Vehicles</p>
            <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Vehicle Types</p>
            <p className="text-2xl font-bold text-green-600">{new Set(vehicles.map(v => v.vehicleType)).size}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Cities Covered</p>
            <p className="text-2xl font-bold text-blue-600">{new Set(vehicles.map(v => v.city)).size}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Capacity Range</p>
            <p className="text-2xl font-bold text-purple-600">
              {vehicles.length > 0 ? `${Math.min(...vehicles.map(v => v.maxCapacity))}-${Math.max(...vehicles.map(v => v.maxCapacity))} pax` : '-'}
            </p>
          </div>
        </div>

        {/* Vehicles List */}
        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No vehicles found.</p>
            </div>
          ) : (
            vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-xl shadow overflow-hidden">
              {/* Vehicle Header */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">🚐 {vehicle.vehicleType}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        Max {vehicle.maxCapacity} Passengers
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        📍 {vehicle.city}
                      </span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <div>🗓️ <strong>{vehicle.seasonName}</strong> ({vehicle.startDate} to {vehicle.endDate})</div>
                      <div>💶 <strong>{vehicle.currency}</strong></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300">
                      Duplicate
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-6 mb-4">
                  {/* Rental Pricing */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3">🚗 Rental Pricing</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                          <div className="text-xs text-gray-600">Full Day Rental</div>
                          <div className="text-sm font-semibold text-gray-500">8-10 hours</div>
                        </div>
                        <div className="text-xl font-bold text-blue-900">{vehicle.currency} {vehicle.fullDay}</div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                          <div className="text-xs text-gray-600">Half Day Rental</div>
                          <div className="text-sm font-semibold text-gray-500">4-5 hours</div>
                        </div>
                        <div className="text-xl font-bold text-blue-900">{vehicle.currency} {vehicle.halfDay}</div>
                      </div>
                    </div>
                  </div>

                  {/* Airport Transfer Pricing */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3">✈️ Airport Transfers</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <div className="text-xs text-gray-600">Airport → Hotel</div>
                          <div className="text-sm font-semibold text-gray-500">One way</div>
                        </div>
                        <div className="text-xl font-bold text-green-900">{vehicle.currency} {vehicle.airportToHotel}</div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <div className="text-xs text-gray-600">Hotel → Airport</div>
                          <div className="text-sm font-semibold text-gray-500">One way</div>
                        </div>
                        <div className="text-xl font-bold text-green-900">{vehicle.currency} {vehicle.hotelToAirport}</div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div>
                          <div className="text-xs text-gray-600">Round Trip</div>
                          <div className="text-sm font-semibold text-gray-500">Both ways (discounted)</div>
                        </div>
                        <div className="text-xl font-bold text-purple-900">{vehicle.currency} {vehicle.roundTrip}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Notes:</strong> {vehicle.notes}
                  </p>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-purple-900 mb-2">💡 Transportation Pricing Guide:</h4>
          <ul className="text-xs text-purple-800 space-y-1">
            <li>• <strong>Vehicle Types:</strong> Vito (4 pax), Sprinter (10 pax), Isuzu (18 pax), Coach (46 pax)</li>
            <li>• <strong>City-Specific:</strong> Airport transfer prices vary by city. Major airports: IST (Istanbul), AYT (Antalya), NAV/ASR (Cappadocia)</li>
            <li>• <strong>Full Day:</strong> Typically 8-10 hours with driver. Ideal for multi-stop tours.</li>
            <li>• <strong>Half Day:</strong> 4-5 hours with driver. Good for short tours or transfers with stops.</li>
            <li>• <strong>Airport Transfers:</strong> Point-to-point service. Round trip pricing usually discounted vs. 2x one-way.</li>
            <li>• <strong>Pricing Per Vehicle:</strong> Not per person. Same price regardless of 1 pax or maximum capacity.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
