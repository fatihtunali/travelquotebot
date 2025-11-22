'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, TrendingUp, DollarSign, Wallet } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    // Fetch analytics data
    fetch(`/api/analytics/${parsedUser.organizationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setAnalyticsData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const {
    overview = {},
    revenueTrends = [],
    popularDestinations = [],
    seasonalData = [],
    topTours = [],
    demographics = {},
    quoteStatusDistribution = []
  } = analyticsData || {};

  // Calculate max revenue for chart scaling
  const maxRevenue = revenueTrends.length > 0 ? Math.max(...revenueTrends.map((item: any) => item.revenue), 1) : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive insights into your tour operations</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Quotes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Quotes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalQuotes || 0}</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">{overview.acceptedQuotes || 0} accepted</span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-600">{overview.pendingQuotes || 0} pending</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{overview.conversionRate || '0.0'}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {overview.totalBookings || 0} bookings from {overview.totalQuotes || 0} quotes
          </div>
        </div>

        {/* Average Quote Value */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Quote Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${Number(overview.avgQuoteValue || 0).toFixed(0)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Per quote estimate
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${Number(overview.totalRevenue || 0).toFixed(0)}</p>
            </div>
            <div className="bg-cyan-100 p-3 rounded-lg">
              <Wallet className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            ${Number(overview.totalPaid || 0).toFixed(0)} collected
          </div>
        </div>
      </div>

      {/* Revenue Trends Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trends (Last 6 Months)</h2>
        {revenueTrends.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No revenue data available yet.</p>
            <p className="text-sm mt-2">Start converting quotes to bookings to see revenue trends.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {revenueTrends.map((item: any, idx: number) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.month}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">{item.bookings} bookings</span>
                    <span className="font-semibold text-gray-900">${Number(item.revenue).toFixed(0)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Quote Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quote Status Distribution</h2>
          {quoteStatusDistribution.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No quote data available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quoteStatusDistribution.map((item: any, idx: number) => {
                const colors: any = {
                  'accepted': 'bg-green-500',
                  'pending': 'bg-yellow-500',
                  'rejected': 'bg-red-500',
                  'draft': 'bg-gray-500'
                };
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[item.status] || 'bg-teal-500'}`}></div>
                        <span className="text-sm font-medium text-gray-700 capitalize">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">{item.count} quotes</span>
                        <span className="font-semibold text-gray-900">{Number(item.percentage).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${colors[item.status] || 'bg-teal-500'}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Demographics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Demographics</h2>
          {!demographics.totalBookings || demographics.totalBookings === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No customer data available yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-medium">Total Adults</p>
                  <p className="text-3xl font-bold text-teal-600 mt-2">{demographics.totalAdults || 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-medium">Total Children</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{demographics.totalChildren || 0}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Average Group Size</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Adults</span>
                      <span className="text-sm font-semibold text-gray-900">{Number(demographics.avgAdults || 0).toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${Math.min(((demographics.avgAdults || 0) / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Children</span>
                      <span className="text-sm font-semibold text-gray-900">{Number(demographics.avgChildren || 0).toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(((demographics.avgChildren || 0) / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Based on {demographics.totalBookings || 0} accepted bookings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Most Popular Destinations</h2>
        {popularDestinations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No destination data available yet.</p>
            <p className="text-sm mt-2">Create quotes with destinations to see popular locations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Destination</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Quotes</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Bookings</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {popularDestinations.map((dest: any, idx: number) => {
                  const conversionRate = dest.quote_count > 0 ? ((dest.bookings_count / dest.quote_count) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{dest.destination}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{dest.quote_count}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{dest.bookings_count}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">${Number(dest.avg_price).toFixed(0)}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={`font-semibold ${Number(conversionRate) >= 50 ? 'text-green-600' : Number(conversionRate) >= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {conversionRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Performing Tours */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Tours</h2>
        {topTours.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No tour performance data available yet.</p>
            <p className="text-sm mt-2">Accepted quotes will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topTours.map((tour: any, idx: number) => (
              <div key={idx} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">{tour.destination}</h3>
                  <span className="bg-teal-100 text-teal-700 text-xs font-medium px-2 py-1 rounded">#{idx + 1}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Bookings</span>
                    <span className="font-semibold text-gray-900">{tour.bookings}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Value</span>
                    <span className="font-semibold text-gray-900">${Number(tour.total_value).toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg Value</span>
                    <span className="font-semibold text-gray-900">${Number(tour.avg_value).toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg Group</span>
                    <span className="font-semibold text-gray-900">{Number(tour.avg_group_size).toFixed(1)} people</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Busiest Seasons */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Busiest Seasons</h2>
        {seasonalData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No seasonal data available yet.</p>
            <p className="text-sm mt-2">Accepted bookings with start dates will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {seasonalData.map((season: any, idx: number) => (
              <div key={idx} className="border border-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-gray-700 mb-2">{season.month_name}</p>
                <p className="text-2xl font-bold text-teal-600">{season.bookings_count}</p>
                <p className="text-xs text-gray-600 mt-1">bookings</p>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600">{season.total_travelers} travelers</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
