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
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/pricing/transport', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        console.error('Failed to fetch transport services:', response.status);
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
          <div className="bubble-card bg-white overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
              <div className="col-span-3">Service Name</div>
              <div className="col-span-2">Route</div>
              <div className="col-span-2">Type/Vehicle</div>
              <div className="col-span-1 text-center">Capacity</div>
              <div className="col-span-1 text-center">Duration</div>
              <div className="col-span-1 text-right">Price</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-green-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/pricing/transport/${service.id}`)}
                >
                  {/* Service Name */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(service.type)}</span>
                      <div className="font-semibold text-gray-900">{service.name}</div>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="col-span-2 flex items-center text-sm text-gray-600">
                    {service.from_location} → {service.to_location}
                  </div>

                  {/* Type/Vehicle */}
                  <div className="col-span-2 flex items-center">
                    <div>
                      <div className="text-xs text-gray-900 font-medium capitalize">
                        {service.type.replace('_', ' ')}
                      </div>
                      {service.vehicle_type && (
                        <div className="text-xs text-gray-500">{service.vehicle_type}</div>
                      )}
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="col-span-1 flex items-center justify-center text-sm text-gray-600">
                    {service.max_passengers ? `${service.max_passengers} pax` : '-'}
                  </div>

                  {/* Duration */}
                  <div className="col-span-1 flex items-center justify-center text-sm text-gray-600">
                    {service.duration_minutes ? `${Math.round(service.duration_minutes / 60)}h` : '-'}
                  </div>

                  {/* Price */}
                  <div className="col-span-1 flex items-center justify-end">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${service.base_price}</div>
                      {service.price_per_person && (
                        <div className="text-xs text-gray-500">+${service.price_per_person}/pp</div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex items-center justify-center">
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

                  {/* Action */}
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/pricing/transport/${service.id}`);
                      }}
                      className="text-green-600 hover:text-green-800 font-semibold text-sm"
                    >
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
