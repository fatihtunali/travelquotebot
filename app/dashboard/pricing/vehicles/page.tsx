'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VehiclesPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedVehicleType, setSelectedVehicleType] = useState('All');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [formData, setFormData] = useState({
    vehicle_type: '',
    max_capacity: 0,
    city: '',
    season_name: '',
    start_date: '',
    end_date: '',
    currency: 'EUR',
    price_per_day: 0,
    price_half_day: 0,
    airport_to_hotel: 0,
    hotel_to_airport: 0,
    airport_roundtrip: 0,
    notes: ''
  });

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
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedVehicle(null);
    setFormData({
      vehicle_type: '',
      max_capacity: 0,
      city: '',
      season_name: '',
      start_date: '',
      end_date: '',
      currency: 'EUR',
      price_per_day: 0,
      price_half_day: 0,
      airport_to_hotel: 0,
      hotel_to_airport: 0,
      airport_roundtrip: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (vehicle: any) => {
    setModalMode('edit');
    setSelectedVehicle(vehicle);
    setFormData({
      vehicle_type: vehicle.vehicle_type,
      max_capacity: vehicle.max_capacity,
      city: vehicle.city,
      season_name: vehicle.season_name,
      start_date: vehicle.start_date,
      end_date: vehicle.end_date,
      currency: vehicle.currency,
      price_per_day: vehicle.fullDay,
      price_half_day: vehicle.halfDay,
      airport_to_hotel: vehicle.airportToHotel,
      hotel_to_airport: vehicle.hotelToAirport,
      airport_roundtrip: vehicle.roundTrip,
      notes: vehicle.notes || ''
    });
    setShowModal(true);
  };

  const openDuplicateModal = (vehicle: any) => {
    setModalMode('duplicate');
    setSelectedVehicle(null);
    setFormData({
      vehicle_type: vehicle.vehicle_type,
      max_capacity: vehicle.max_capacity,
      city: vehicle.city,
      season_name: vehicle.season_name + ' (Copy)',
      start_date: vehicle.start_date,
      end_date: vehicle.end_date,
      currency: vehicle.currency,
      price_per_day: vehicle.fullDay,
      price_half_day: vehicle.halfDay,
      airport_to_hotel: vehicle.airportToHotel,
      hotel_to_airport: vehicle.hotelToAirport,
      airport_roundtrip: vehicle.roundTrip,
      notes: vehicle.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedVehicle) {
        // Update existing vehicle
        const response = await fetch('/api/pricing/vehicles', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            vehicleId: selectedVehicle.id,
            vehicle: {
              vehicle_type: formData.vehicle_type,
              max_capacity: formData.max_capacity,
              city: formData.city
            },
            pricing: {
              id: selectedVehicle.pricing_id,
              season_name: formData.season_name,
              start_date: formData.start_date,
              end_date: formData.end_date,
              currency: formData.currency,
              price_per_day: formData.price_per_day,
              price_half_day: formData.price_half_day,
              airport_to_hotel: formData.airport_to_hotel,
              hotel_to_airport: formData.hotel_to_airport,
              airport_roundtrip: formData.airport_roundtrip,
              notes: formData.notes
            }
          })
        });

        if (response.ok) {
          alert('Vehicle updated successfully!');
          setShowModal(false);
          fetchVehicles();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update vehicle'}`);
        }
      } else {
        // Create new vehicle (both 'add' and 'duplicate' modes)
        const response = await fetch('/api/pricing/vehicles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            vehicle: {
              vehicle_type: formData.vehicle_type,
              max_capacity: formData.max_capacity,
              city: formData.city
            },
            pricing: {
              season_name: formData.season_name,
              start_date: formData.start_date,
              end_date: formData.end_date,
              currency: formData.currency,
              price_per_day: formData.price_per_day,
              price_half_day: formData.price_half_day,
              airport_to_hotel: formData.airport_to_hotel,
              hotel_to_airport: formData.hotel_to_airport,
              airport_roundtrip: formData.airport_roundtrip,
              notes: formData.notes
            }
          })
        });

        if (response.ok) {
          alert('Vehicle created successfully!');
          setShowModal(false);
          fetchVehicles();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create vehicle'}`);
        }
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('An error occurred while saving the vehicle');
    }
  };

  const handleDelete = async (vehicle: any) => {
    if (!confirm(`Are you sure you want to archive ${vehicle.vehicle_type} in ${vehicle.city}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/vehicles?id=${vehicle.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Vehicle archived successfully!');
        fetchVehicles();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to archive vehicle'}`);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('An error occurred while archiving the vehicle');
    }
  };

  const sampleVehicles = vehicles.map((v) => ({
    ...v,
    vehicleType: v.vehicle_type,
    maxCapacity: v.max_capacity,
    seasonName: v.season_name,
    startDate: v.start_date,
    endDate: v.end_date,
    fullDay: v.fullDay,
    halfDay: v.halfDay,
    airportToHotel: v.airportToHotel,
    hotelToAirport: v.hotelToAirport,
    roundTrip: v.roundTrip
  }));

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
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
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
            <p className="text-2xl font-bold text-gray-900">{sampleVehicles.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Vehicle Types</p>
            <p className="text-2xl font-bold text-green-600">{new Set(sampleVehicles.map(v => v.vehicleType)).size}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Cities Covered</p>
            <p className="text-2xl font-bold text-blue-600">{new Set(sampleVehicles.map(v => v.city)).size}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Capacity Range</p>
            <p className="text-2xl font-bold text-purple-600">
              {sampleVehicles.length > 0 ? `${Math.min(...sampleVehicles.map(v => v.maxCapacity))}-${Math.max(...sampleVehicles.map(v => v.maxCapacity))} pax` : '-'}
            </p>
          </div>
        </div>

        {/* Vehicles List */}
        <div className="space-y-4">
          {sampleVehicles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No vehicles found.</p>
            </div>
          ) : (
            sampleVehicles.map((vehicle) => (
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
                    <button
                      onClick={() => openEditModal(vehicle)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDuplicateModal(vehicle)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                    >
                      Archive
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Vehicle' : modalMode === 'duplicate' ? 'Duplicate Vehicle' : 'Add New Vehicle'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Vehicle Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vehicle_type}
                      onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Vito, Sprinter, Coach"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Capacity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.max_capacity}
                      onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., 4, 10, 18"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Istanbul, Antalya"
                    />
                  </div>
                </div>
              </div>

              {/* Season Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Season Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Season Name
                    </label>
                    <input
                      type="text"
                      value={formData.season_name}
                      onChange={(e) => setFormData({ ...formData, season_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Summer 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency *
                    </label>
                    <select
                      required
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="TRY">TRY</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Rental Pricing */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Day Price (8-10 hours)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Half Day Price (4-5 hours)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price_half_day}
                      onChange={(e) => setFormData({ ...formData, price_half_day: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Airport Transfer Pricing */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Airport Transfer Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Airport to Hotel
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.airport_to_hotel}
                      onChange={(e) => setFormData({ ...formData, airport_to_hotel: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel to Airport
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.hotel_to_airport}
                      onChange={(e) => setFormData({ ...formData, hotel_to_airport: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Round Trip (Discounted)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.airport_roundtrip}
                      onChange={(e) => setFormData({ ...formData, airport_roundtrip: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Additional notes or comments..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalMode === 'edit' ? 'Update Vehicle' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
