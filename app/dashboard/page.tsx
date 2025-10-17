'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Operator {
  id: string;
  companyName: string;
  subdomain: string;
  subscriptionTier: string;
  logoUrl?: string | null;
  brandColors?: {
    primary: string;
    secondary: string;
  };
}

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperatorBranding = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      try {
        // Fetch operator branding from API
        const response = await fetch('/api/operator/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOperator(data.operator);
          // Update localStorage with latest operator data
          localStorage.setItem('operator', JSON.stringify(data.operator));
        } else {
          // Fallback to localStorage if API fails
          const operatorData = localStorage.getItem('operator');
          if (operatorData) {
            setOperator(JSON.parse(operatorData));
          }
        }
      } catch (err) {
        console.error('Error fetching operator branding:', err);
        // Fallback to localStorage
        const operatorData = localStorage.getItem('operator');
        if (operatorData) {
          setOperator(JSON.parse(operatorData));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorBranding();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('operator');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const primaryColor = operator?.brandColors?.primary || '#3b82f6';
  const secondaryColor = operator?.brandColors?.secondary || '#8b5cf6';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {operator?.logoUrl ? (
                <img
                  src={operator.logoUrl}
                  alt={operator.companyName}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  🌍
                </div>
              )}
              <div>
                <h1
                  className="text-3xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  {operator?.companyName || 'TravelQuoteBot'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">Operator Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bubble-card p-8 mb-8 bg-gradient-to-br from-white to-blue-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 gradient-blue rounded-full flex items-center justify-center text-3xl shadow-lg">
              👋
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Welcome back, {user?.fullName}!
              </h2>
              <p className="text-gray-600">
                Managing: <span className="font-bold text-indigo-600">{operator?.companyName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bubble-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Subscription Tier
              </h3>
              <div className="w-10 h-10 gradient-blue rounded-full flex items-center justify-center text-xl shadow-md">
                ⭐
              </div>
            </div>
            <p className="text-4xl font-bold text-indigo-600 capitalize">
              {operator?.subscriptionTier}
            </p>
          </div>

          <div className="bubble-card p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Itineraries Generated
              </h3>
              <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center text-xl shadow-md">
                📝
              </div>
            </div>
            <p className="text-4xl font-bold text-green-600">0</p>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>

          <div className="bubble-card p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Monthly Quota
              </h3>
              <div className="w-10 h-10 gradient-purple rounded-full flex items-center justify-center text-xl shadow-md">
                🎯
              </div>
            </div>
            <p className="text-4xl font-bold text-purple-600">100</p>
            <p className="text-xs text-gray-500 mt-2">Remaining: 100</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bubble-card p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/itinerary/create')}
              className="bubble-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 hover:shadow-xl text-left group transition-all"
              style={{
                borderColor: primaryColor + '40',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform text-white"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                📝
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Create Itinerary</h4>
              <p className="text-sm text-gray-600">
                Generate AI-powered travel itineraries
              </p>
            </button>

            <button
              onClick={() => router.push('/requests')}
              className="bubble-card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 text-left group hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 gradient-green rounded-full flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                📋
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Customer Requests</h4>
              <p className="text-sm text-gray-600">
                View and follow up on itinerary requests
              </p>
            </button>

            <button
              onClick={() => router.push('/settings')}
              className="bubble-card p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 text-left group hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 gradient-purple rounded-full flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                🎨
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Customize Branding</h4>
              <p className="text-sm text-gray-600">
                Set your logo, colors, and domain
              </p>
            </button>

            <button
              onClick={() => router.push('/dashboard/pricing')}
              className="bubble-card p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:border-yellow-400 text-left group hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 gradient-orange rounded-full flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                💰
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Pricing Management</h4>
              <p className="text-sm text-gray-600">
                Manage service pricing and inventory
              </p>
            </button>

            <button className="bubble-card p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 hover:border-rose-400 text-left group">
              <div className="w-14 h-14 gradient-orange rounded-full flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                📊
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">View Analytics</h4>
              <p className="text-sm text-gray-600">
                Track itineraries and conversions
              </p>
            </button>

            <button className="bubble-card p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 hover:border-indigo-400 text-left group">
              <div className="w-14 h-14 gradient-teal rounded-full flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                💳
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-800">Billing</h4>
              <p className="text-sm text-gray-600">
                Manage subscription and payments
              </p>
            </button>
          </div>
        </div>

        {/* Operator Info */}
        <div className="bubble-card p-8 bg-gradient-to-br from-cyan-50 to-blue-100 border-2 border-cyan-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
              🌐
            </div>
            <h3 className="text-xl font-bold text-gray-800">Your Platform URL</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border-2 border-blue-300 shadow-inner mb-3">
            <code className="text-blue-600 font-mono text-lg font-semibold">
              https://{operator?.subdomain}.travelquotebot.com
            </code>
          </div>
          <p className="text-sm text-gray-700">
            💡 Share this URL with your customers to access your white-labeled itinerary builder.
          </p>
        </div>
      </main>
    </div>
  );
}
