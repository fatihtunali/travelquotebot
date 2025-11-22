'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  MousePointer,
  Eye,
  DollarSign,
  Target,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface GoogleAdsData {
  success?: boolean;
  configured: boolean;
  error?: string;
  message?: string;
  headers?: string[];
  data?: any[];
  summary?: {
    totalClicks: number;
    totalImpressions: number;
    totalCost: string;
    totalConversions: number;
    totalConvValue: string;
    ctr: string;
    cpc: string;
    convRate: string;
    costPerConv: string;
    roas: string;
    campaigns: string[];
    dailyData: any[];
    dataPoints: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export default function GoogleAdsPage() {
  const [data, setData] = useState<GoogleAdsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/google-ads', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (!response.ok && response.status !== 200) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data?.configured) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Google Ads Dashboard</h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Configuration Required</h3>
              <p className="text-yellow-700 mb-4">{data?.message}</p>

              <div className="bg-white rounded-lg p-4 text-sm">
                <p className="font-medium text-gray-700 mb-2">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Create a Google Cloud project and enable Google Sheets API</li>
                  <li>Create a service account and download the JSON credentials</li>
                  <li>Share your Google Ads data sheet with the service account email</li>
                  <li>Add to <code className="bg-gray-100 px-1 rounded">.env.local</code>:
                    <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...}'
GOOGLE_ADS_SHEET_ID=your_sheet_id_here`}
                    </pre>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Google Ads Dashboard</h1>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">Error Loading Data</h3>
              <p className="text-red-700">{error || data?.message}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Google Ads Dashboard</h1>
          {summary?.dateRange && (
            <p className="text-gray-500 mt-1">
              {summary.dateRange.start} to {summary.dateRange.end} ({summary.dataPoints} data points)
            </p>
          )}
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <MousePointer className="w-4 h-4" />
            Clicks
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary?.totalClicks?.toLocaleString()}</p>
          <p className="text-xs text-gray-500">CTR: {summary?.ctr}%</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Eye className="w-4 h-4" />
            Impressions
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary?.totalImpressions?.toLocaleString()}</p>
          <p className="text-xs text-gray-500">CPC: ${summary?.cpc}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <DollarSign className="w-4 h-4" />
            Cost
          </div>
          <p className="text-2xl font-bold text-gray-900">${summary?.totalCost}</p>
          <p className="text-xs text-gray-500">Cost/Conv: ${summary?.costPerConv}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Target className="w-4 h-4" />
            Conversions
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary?.totalConversions}</p>
          <p className="text-xs text-gray-500">Conv Rate: {summary?.convRate}%</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            ROAS
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary?.roas}x</p>
          <p className="text-xs text-gray-500">Value: ${summary?.totalConvValue}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Clicks & Conversions Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Daily Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  name="Clicks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Daily Spend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => ['$' + value.toFixed(2), 'Cost']}
                />
                <Bar dataKey="cost" fill="#10b981" name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Campaigns */}
      {summary?.campaigns && summary.campaigns.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Active Campaigns</h3>
          <div className="flex flex-wrap gap-2">
            {summary.campaigns.map((campaign, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {campaign}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
