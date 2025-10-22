'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OperatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchOrgData(parsedUser.organizationId);
  }, [router]);

  const fetchOrgData = async (orgId: number) => {
    try {
      const response = await fetch(`/api/operator/dashboard/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrgData(data);
      }
    } catch (error) {
      console.error('Error fetching org data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading || !user || !orgData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">{orgData.organization.name}</h1>
            <p className="text-sm text-gray-600">Operator Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">👋</h2>
          <h3 className="text-2xl font-semibold text-gray-900 mt-2">
            Welcome back, {user.firstName} {user.lastName}!
          </h3>
          <p className="text-gray-600">Managing: {orgData.organization.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl mb-2">⭐</div>
            <h4 className="text-sm text-gray-600 mb-2">Subscription Tier</h4>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {orgData.subscription?.plan_type || 'No Plan'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl mb-2">📝</div>
            <h4 className="text-sm text-gray-600 mb-2">Itineraries Generated</h4>
            <p className="text-2xl font-bold text-gray-900">{orgData.stats.quotesThisMonth}</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="text-sm text-gray-600 mb-2">Monthly Quota</h4>
            <p className="text-2xl font-bold text-gray-900">{orgData.credits.credits_total}</p>
            <p className="text-xs text-gray-500 mt-1">
              Remaining: {orgData.credits.credits_available}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/dashboard/itinerary/create"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-semibold text-gray-900">Create Itinerary</h4>
              <p className="text-sm text-gray-600 mt-1">Generate AI-powered travel itineraries</p>
            </Link>

            <Link
              href="/dashboard/requests"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-semibold text-gray-900">Customer Requests</h4>
              <p className="text-sm text-gray-600 mt-1">View and follow up on itinerary requests</p>
            </Link>

            <Link
              href="/dashboard/branding"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-semibold text-gray-900">Customize Branding</h4>
              <p className="text-sm text-gray-600 mt-1">Set your logo, colors, and domain</p>
            </Link>

            <Link
              href="/dashboard/pricing"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold text-gray-900">Pricing Management</h4>
              <p className="text-sm text-gray-600 mt-1">Manage service pricing and inventory</p>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-600 mt-1">Track itineraries and conversions</p>
            </Link>

            <Link
              href="/dashboard/billing"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">💳</div>
              <h4 className="font-semibold text-gray-900">Billing</h4>
              <p className="text-sm text-gray-600 mt-1">Manage credits and payments</p>
            </Link>

            <Link
              href="/dashboard/team"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-semibold text-gray-900">Team Management</h4>
              <p className="text-sm text-gray-600 mt-1">Manage staff and their access</p>
            </Link>

            <Link
              href="/dashboard/test-crud"
              className="p-4 border-2 border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <div className="text-2xl mb-2">🧪</div>
              <h4 className="font-semibold text-gray-900">Test CRUD Operations</h4>
              <p className="text-sm text-gray-600 mt-1">Run comprehensive API tests (Admin only)</p>
            </Link>
          </div>
        </div>

        {/* Platform URL */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🌐</div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Platform URL</h4>
              <div className="bg-white rounded-lg px-4 py-3 mb-2">
                <code className="text-blue-600 font-mono text-sm">
                  https://{orgData.organization.slug}.travelquotebot.com
                </code>
              </div>
              <p className="text-sm text-gray-600">
                💡 Share this URL with your customers to access your white-labeled itinerary builder.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
