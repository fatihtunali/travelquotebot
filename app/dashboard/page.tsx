'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  Target,
  DollarSign,
  CreditCard,
  FileText,
  Receipt,
  Building2,
  Plane,
  Clock,
  ArrowRight,
  Sparkles,
  PenLine
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function OperatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
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
    fetchDashboardData(parsedUser.organizationId);
  }, [router]);

  const fetchDashboardData = async (orgId: number) => {
    try {
      const response = await fetch(`/api/operator/dashboard/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (response.ok) {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading || !user || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Pipeline data for bar chart
  const pipelineData = [
    { name: 'Sent', value: data.pipeline?.quotesSent || 0, color: '#94a3b8' },
    { name: 'Viewed', value: data.pipeline?.quotesViewed || 0, color: '#60a5fa' },
    { name: 'Accepted', value: data.pipeline?.quotesAccepted || 0, color: '#34d399' },
    { name: 'Confirmed', value: data.pipeline?.bookingsConfirmed || 0, color: '#a78bfa' },
    { name: 'Paid', value: data.pipeline?.bookingsPaid || 0, color: '#22c55e' }
  ];

  // Pie chart colors
  const COLORS = ['#3b82f6', '#ef4444'];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quote': return <FileText className="w-4 h-4" />;
      case 'booking': return <CalendarCheck className="w-4 h-4" />;
      case 'invoice': return <Receipt className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quote': return 'bg-blue-100 text-blue-600';
      case 'booking': return 'bg-green-100 text-green-600';
      case 'invoice': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening with <span className="font-semibold text-blue-600">{data.organization.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/quotes/ai-generate"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            AI Quote
          </Link>
          <Link
            href="/dashboard/quotes/create"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
          >
            <PenLine className="w-4 h-4" />
            New Quote
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            {data.keyMetrics?.revenueChange !== 0 && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                data.keyMetrics?.revenueChange > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {data.keyMetrics?.revenueChange > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(data.keyMetrics?.revenueChange)}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1">Revenue (MTD)</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(data.keyMetrics?.revenueThisMonth)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <CalendarCheck className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-xs text-gray-500 mb-1">Active Bookings</p>
          <p className="text-xl font-bold text-gray-900">
            {data.keyMetrics?.activeBookings || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <Target className="w-5 h-5 text-purple-600 mb-2" />
          <p className="text-xs text-gray-500 mb-1">Conversion Rate</p>
          <p className="text-xl font-bold text-gray-900">
            {data.keyMetrics?.conversionRate || 0}%
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Receivables</p>
          <p className="text-xl font-bold text-amber-600">
            {formatCurrency(data.keyMetrics?.outstandingReceivables)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Payables Due</p>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(data.keyMetrics?.payablesDue)}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64">
            {data.revenueTrend && data.revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month_name"
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#dbeafe"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No revenue data yet
              </div>
            )}
          </div>
        </div>

        {/* Booking Pipeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Booking Pipeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Agents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Top Performing Agents</h3>
            <Link href="/dashboard/finance/agent-balances" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {data.topAgents && data.topAgents.length > 0 ? (
            <div className="space-y-3">
              {data.topAgents.map((agent: any, index: number) => (
                <div key={agent.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.booking_count} bookings</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(agent.total_value)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Building2 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No agent bookings yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {data.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.slice(0, 6).map((activity: any) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.reference}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Financial Health & Upcoming Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Cash Flow (MTD)</h3>
          <div className="h-48 flex items-center justify-center">
            {data.financialHealth?.income > 0 || data.financialHealth?.expenses > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Income', value: data.financialHealth?.income || 0 },
                      { name: 'Expenses', value: data.financialHealth?.expenses || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-sm">No data yet</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Net Profit</span>
              <span className={`font-semibold ${
                data.financialHealth?.profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(data.financialHealth?.profit)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Income
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Expenses
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Invoices Due */}
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-medium text-amber-800">Collect Payments</h4>
              </div>
              {data.upcomingActions?.invoicesDueSoon?.length > 0 ? (
                <ul className="space-y-2">
                  {data.upcomingActions.invoicesDueSoon.slice(0, 3).map((inv: any) => (
                    <li key={inv.id} className="text-xs">
                      <Link href={`/dashboard/finance/invoices/${inv.id}`} className="text-amber-700 hover:underline">
                        {inv.invoice_number} - {formatCurrency(inv.total_amount)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-amber-600">No invoices due</p>
              )}
            </div>

            {/* Bills to Pay */}
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-red-600" />
                <h4 className="text-sm font-medium text-red-800">Bills to Pay</h4>
              </div>
              {data.upcomingActions?.paymentsToMake?.length > 0 ? (
                <ul className="space-y-2">
                  {data.upcomingActions.paymentsToMake.slice(0, 3).map((pay: any) => (
                    <li key={pay.id} className="text-xs">
                      <Link href="/dashboard/finance/payables" className="text-red-700 hover:underline">
                        {pay.supplier_name} - {formatCurrency(pay.amount_due)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-red-600">No bills due</p>
              )}
            </div>

            {/* Tours This Week */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Plane className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-medium text-green-800">Tours Starting</h4>
              </div>
              {data.upcomingActions?.toursThisWeek?.length > 0 ? (
                <ul className="space-y-2">
                  {data.upcomingActions.toursThisWeek.slice(0, 3).map((tour: any) => (
                    <li key={tour.id} className="text-xs">
                      <Link href={`/dashboard/bookings/${tour.id}`} className="text-green-700 hover:underline">
                        {tour.customer_name} - {formatDate(tour.start_date)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-green-600">No tours this week</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
