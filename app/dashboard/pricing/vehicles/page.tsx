'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GroupedVehicle {
  id: number;
  vehicle_type: string;
  max_capacity: number;
  city: string;
  currency: string;
  seasons: any[];
  minPrice: number;
  maxPrice: number;
}

export default function VehiclesPricing() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedVehicleType, setSelectedVehicleType] = useState('All');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [expandedVehicles, setExpandedVehicles] = useState<Set<number>>(new Set());
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

  useEffect(() => {
    // Auto-expand all vehicles by default
    if (vehicles.length > 0) {
      const vehicleIds = new Set<number>();
      vehicles.forEach(v => {
        if (v.id) vehicleIds.add(v.id);
      });
      setExpandedVehicles(vehicleIds);
    }
  }, [vehicles]);

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

  const toggleVehicle = (vehicleId: number) => {
    const newExpanded = new Set(expandedVehicles);
    if (newExpanded.has(vehicleId)) {
      newExpanded.delete(vehicleId);
    } else {
      newExpanded.add(vehicleId);
    }
    setExpandedVehicles(newExpanded);
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

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return '';

    let date: Date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      if (dateInput.includes('T')) {
        date = new Date(dateInput);
      } else {
        date = new Date(dateInput + 'T00:00:00');
      }
    } else {
      return '';
    }

    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Group vehicles by vehicle ID
  const groupedVehicles: GroupedVehicle[] = [];
  const vehicleMap = new Map<number, GroupedVehicle>();

  vehicles.forEach(v => {
    if (!vehicleMap.has(v.id)) {
      vehicleMap.set(v.id, {
        id: v.id,
        vehicle_type: v.vehicle_type,
        max_capacity: v.max_capacity,
        city: v.city,
        currency: v.currency || 'EUR',
        seasons: [],
        minPrice: Infinity,
        maxPrice: -Infinity
      });
    }

    const group = vehicleMap.get(v.id)!;
    if (v.pricing_id) {
      group.seasons.push(v);
      if (v.fullDay) {
        group.minPrice = Math.min(group.minPrice, v.fullDay);
        group.maxPrice = Math.max(group.maxPrice, v.fullDay);
      }
    }
  });

  vehicleMap.forEach(value => groupedVehicles.push(value));

  // Filter grouped vehicles
  const filteredVehicles = groupedVehicles.filter(vehicle => {
    const cityMatch = selectedCity === 'All' || vehicle.city === selectedCity;
    const typeMatch = selectedVehicleType === 'All' || vehicle.vehicle_type === selectedVehicleType;
    return cityMatch && typeMatch;
  });

  // Calculate stats
  const totalVehicles = groupedVehicles.length;
  const vehicleTypesCount = new Set(groupedVehicles.map(v => v.vehicle_type)).size;
  const citiesCount = new Set(groupedVehicles.map(v => v.city)).size;
  const capacityRange = groupedVehicles.length > 0
    ? `${Math.min(...groupedVehicles.map(v => v.max_capacity))}-${Math.max(...groupedVehicles.map(v => v.max_capacity))} pax`
    : '-';

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
                type="button"
                onClick={() => router.push('/dashboard/pricing')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2"
              >
                ← Back to Pricing
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Transportation & Vehicle Pricing</h1>
              <p className="text-sm text-gray-600">Manage vehicle rentals and airport transfer pricing by city</p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm">
                📥 Import Excel
              </button>
              <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
                📤 Export Excel
              </button>
              <button
                type="button"
                onClick={openAddModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
                + Add Vehicle Season
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
            <p className="text-2xl font-bold text-gray-900">{totalVehicles}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Vehicle Types</p>
            <p className="text-2xl font-bold text-green-600">{vehicleTypesCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Cities Covered</p>
            <p className="text-2xl font-bold text-blue-600">{citiesCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600">Capacity Range</p>
            <p className="text-2xl font-bold text-purple-600">{capacityRange}</p>
          </div>
        </div>

        {/* Grouped Vehicles List */}
        <div className="space-y-4">
          {filteredVehicles.map((vehicle) => {
            const isExpanded = expandedVehicles.has(vehicle.id);
            const priceRangeText = vehicle.minPrice !== Infinity
              ? `${vehicle.currency} ${vehicle.minPrice}${vehicle.minPrice !== vehicle.maxPrice ? ` - ${vehicle.maxPrice}` : ''}`
              : 'No pricing';

            return (
              <div key={vehicle.id} className="bg-white rounded-xl shadow overflow-hidden">
                {/* Vehicle Header - Always Visible, Clickable */}
                <div
                  onClick={() => toggleVehicle(vehicle.id)}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{isExpanded ? '▼' : '▶'}</div>
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                      <div>
                        <h3 className="font-bold text-gray-900">{vehicle.vehicle_type}</h3>
                        <p className="text-sm text-gray-600">Max {vehicle.max_capacity} pax</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">📍 {vehicle.city}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        🗓️ {vehicle.seasons.length} season{vehicle.seasons.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        💶 {priceRangeText}
                      </div>
                      <div className="text-sm text-gray-600">
                        Full Day Rate
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seasons Table - Expandable */}
                {isExpanded && vehicle.seasons.length > 0 && (
                  <div className="border-t">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season / Dates</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Day</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Half Day</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Airport Transfers</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {vehicle.seasons.map((season) => (
                          <tr key={season.pricing_id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">{season.season_name}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(season.start_date)} to {formatDate(season.end_date)}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">{vehicle.currency} {season.fullDay}</div>
                              <div className="text-xs text-gray-500">8-10 hours</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">{vehicle.currency} {season.halfDay}</div>
                              <div className="text-xs text-gray-500">4-5 hours</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-xs">
                                <div className="text-gray-600">To Hotel: <span className="font-bold text-gray-900">{vehicle.currency} {season.airportToHotel}</span></div>
                                <div className="text-gray-600">From Hotel: <span className="font-bold text-gray-900">{vehicle.currency} {season.hotelToAirport}</span></div>
                                <div className="text-gray-600">Round Trip: <span className="font-bold text-gray-900">{vehicle.currency} {season.roundTrip}</span></div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openEditModal(season); }}
                                  className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openDuplicateModal(season); }}
                                  className="text-green-600 hover:text-green-900 font-medium text-xs"
                                >
                                  Duplicate
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleDelete(season); }}
                                  className="text-red-600 hover:text-red-900 font-medium text-xs"
                                >
                                  Archive
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
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
            <li>• <strong>Multiple Seasons:</strong> Each vehicle can have different seasonal pricing. Click to expand and view all seasons.</li>
          </ul>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Vehicle Season' : modalMode === 'duplicate' ? 'Duplicate Vehicle Season' : 'Add New Vehicle Season'}
              </h2>
              <button
                type="button"
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
