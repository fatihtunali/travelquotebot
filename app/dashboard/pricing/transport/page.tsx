'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TransportService {
  id: string;
  name: string;
  type: string;
  from_location: string;
  to_location: string;
  distance_km: number | null;
  duration_minutes: number | null;
  base_price: number;
  price_per_person: number | null;
  currency: string;
  max_passengers: number | null;
  vehicle_type: string | null;
  amenities: string[] | null;
  is_active: boolean;
}

export default function TransportPricingPage() {
  const router = useRouter();
  const [services, setServices] = useState<TransportService[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/pricing/transport');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Failed to fetch transport services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices =
    filter === 'all'
      ? services
      : services.filter((s) => s.type === filter);

  const transportTypes = [
    { value: 'all', label: 'All Types', icon: '🚗' },
    { value: 'flight', label: 'Flights', icon: '✈️' },
    { value: 'bus', label: 'Buses', icon: '🚌' },
    { value: 'private_transfer', label: 'Private Transfer', icon: '🚙' },
    { value: 'car_rental', label: 'Car Rental', icon: '🚗' },
    { value: 'train', label: 'Trains', icon: '🚆' },
    { value: 'ferry', label: 'Ferries', icon: '⛴️' },
  ];

  const getTypeIcon = (type: string) => {
    const typeObj = transportTypes.find((t) => t.value === type);
    return typeObj?.icon || '🚗';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing')}
            className="mb-4 text-green-600 hover:text-green-800 flex items-center gap-2"
          >
            ← Back to Pricing
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Transportation Services
              </h1>
              <p className="text-gray-600">
                Manage flights, transfers, and vehicle rentals
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/pricing/transport/new')}
              className="bubble-button bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
            >
              + Add Service
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bubble-card p-4 bg-white">
          <div className="flex flex-wrap gap-2">
            {transportTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === type.value
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bubble-card p-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-sm text-gray-600 mb-1">Total Services</div>
            <div className="text-3xl font-bold text-gray-900">{services.length}</div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-gray-900">
              {services.filter((s) => s.is_active).length}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-sm text-gray-600 mb-1">Avg Price</div>
            <div className="text-3xl font-bold text-gray-900">
              ${services.length > 0
                ? Math.round(
                    services.reduce((sum, s) => sum + s.base_price, 0) /
                      services.length
                  )
                : 0}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="text-sm text-gray-600 mb-1">Service Types</div>
            <div className="text-3xl font-bold text-gray-900">
              {new Set(services.map((s) => s.type)).size}
            </div>
          </div>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading services...</div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bubble-card p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Services Found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'Add your first transportation service'
                : `No ${filter} services available`}
            </p>
            <button
              onClick={() => router.push('/dashboard/pricing/transport/new')}
              className="bubble-button bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 font-semibold"
            >
              + Add Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bubble-card p-6 bg-white hover:shadow-xl transition-all cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/pricing/transport/${service.id}`)
                }
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getTypeIcon(service.type)}</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {service.name}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {service.type.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      service.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {service.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Route:</span>
                    {service.from_location} → {service.to_location}
                  </div>
                  {service.vehicle_type && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Vehicle:</span>
                      {service.vehicle_type}
                    </div>
                  )}
                  {service.max_passengers && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Capacity:</span>
                      Up to {service.max_passengers} passengers
                    </div>
                  )}
                  {service.duration_minutes && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Duration:</span>
                      {Math.round(service.duration_minutes / 60)} hours
                    </div>
                  )}
                </div>

                {service.amenities && service.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${service.base_price}
                      <span className="text-sm text-gray-600 font-normal ml-1">
                        {service.currency}
                      </span>
                    </div>
                    {service.price_per_person && (
                      <div className="text-xs text-gray-600">
                        + ${service.price_per_person} per person
                      </div>
                    )}
                  </div>
                  <button className="text-green-600 hover:text-green-800 font-semibold">
                    Edit →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
