'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdditionalService {
  id: string;
  name: string;
  service_type: string;
  price: number;
  price_type: string;
  mandatory: boolean;
  included_in_packages: string[] | null;
  description: string | null;
  is_active: boolean;
}

export default function AdditionalServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<AdditionalService[]>([]);
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

      const response = await fetch('/api/pricing/additional', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Failed to fetch additional services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices =
    filter === 'all'
      ? services
      : filter === 'mandatory'
      ? services.filter((s) => s.mandatory)
      : services.filter((s) => s.service_type === filter);

  const serviceTypes = [
    { value: 'all', label: 'All Services', icon: '🔧' },
    { value: 'mandatory', label: 'Mandatory', icon: '⚠️' },
    { value: 'insurance', label: 'Insurance', icon: '🛡️' },
    { value: 'visa', label: 'Visa', icon: '📄' },
    { value: 'equipment', label: 'Equipment', icon: '🎒' },
    { value: 'upgrade', label: 'Upgrades', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/pricing')}
            className="mb-4 text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            ← Back to Pricing
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Additional Services
              </h1>
              <p className="text-gray-600">
                Manage extra services, insurance, and add-ons
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/pricing/additional/new')}
              className="bubble-button bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 font-semibold hover:shadow-lg"
            >
              + Add Service
            </button>
          </div>
        </div>

        <div className="mb-6 bubble-card p-4 bg-white">
          <div className="flex flex-wrap gap-2">
            {serviceTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === type.value
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bubble-card p-4 bg-gradient-to-br from-indigo-50 to-violet-50">
            <div className="text-sm text-gray-600 mb-1">Total Services</div>
            <div className="text-3xl font-bold text-gray-900">{services.length}</div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-gray-900">
              {services.filter((s) => s.is_active).length}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-red-50 to-rose-50">
            <div className="text-sm text-gray-600 mb-1">Mandatory</div>
            <div className="text-3xl font-bold text-gray-900">
              {services.filter((s) => s.mandatory).length}
            </div>
          </div>
          <div className="bubble-card p-4 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="text-sm text-gray-600 mb-1">Avg Price</div>
            <div className="text-3xl font-bold text-gray-900">
              ${services.length > 0
                ? Math.round(
                    services.reduce((sum, s) => sum + s.price, 0) /
                      services.length
                  )
                : 0}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading services...</div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bubble-card p-12 text-center">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Services Found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'Add your first additional service'
                : `No ${filter} services available`}
            </p>
          </div>
        ) : (
          <div className="bubble-card bg-white overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
              <div className="col-span-3">Service Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Price Type</div>
              <div className="col-span-2">Packages</div>
              <div className="col-span-1 text-right">Price</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-indigo-50 transition-colors cursor-pointer ${
                    service.mandatory ? 'bg-red-50/30' : ''
                  }`}
                  onClick={() => router.push(`/dashboard/pricing/additional/${service.id}`)}
                >
                  {/* Service Name */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-900">{service.name}</div>
                      {service.mandatory && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          MANDATORY
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {service.description}
                      </div>
                    )}
                  </div>

                  {/* Type */}
                  <div className="col-span-2 flex items-center">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full capitalize">
                      {service.service_type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Price Type */}
                  <div className="col-span-2 flex items-center text-sm text-gray-600 capitalize">
                    {service.price_type}
                  </div>

                  {/* Packages */}
                  <div className="col-span-2 flex items-center">
                    {service.included_in_packages && service.included_in_packages.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {service.included_in_packages.slice(0, 1).map((pkg, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                          >
                            {pkg}
                          </span>
                        ))}
                        {service.included_in_packages.length > 1 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{service.included_in_packages.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="col-span-1 flex items-center justify-end">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${service.price}</div>
                      <div className="text-xs text-gray-500">/{service.price_type}</div>
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
                        router.push(`/dashboard/pricing/additional/${service.id}`);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
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
