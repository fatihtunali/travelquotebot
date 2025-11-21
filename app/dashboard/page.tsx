'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bot,
  FileText,
  MessageSquare,
  Palette,
  CreditCard,
  BarChart3,
  Wallet,
  Users,
  Globe,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign,
  Plane
} from 'lucide-react';

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

  if (loading || !user || !orgData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.firstName}! 👋
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening with <span className="font-semibold text-blue-600">{orgData.organization.name}</span> today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            System Operational
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">Current Plan</span>
          </div>
          <h4 className="text-sm text-gray-600 font-medium mb-1">Subscription Tier</h4>
          <p className="text-2xl font-bold text-gray-900 capitalize">
            {orgData.subscription?.plan_type || 'No Plan'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12% vs last month</span>
          </div>
          <h4 className="text-sm text-gray-600 font-medium mb-1">Itineraries Generated</h4>
          <p className="text-2xl font-bold text-gray-900">{orgData.stats.quotesThisMonth}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">Monthly Quota</span>
          </div>
          <h4 className="text-sm text-gray-600 font-medium mb-1">Credits Remaining</h4>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-900">{orgData.credits.credits_available}</p>
            <span className="text-sm text-gray-400 mb-1">/ {orgData.credits.credits_total}</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${(orgData.credits.credits_available / orgData.credits.credits_total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {orgData.alerts && (
        (orgData.alerts.expiringQuotes?.length > 0 ||
         orgData.alerts.depositsDue?.length > 0 ||
         orgData.alerts.balancesDue?.length > 0 ||
         orgData.alerts.upcomingTrips?.length > 0 ||
         orgData.alerts.overdueFollowups?.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Alerts & Reminders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Expiring Quotes */}
            {orgData.alerts.expiringQuotes?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Expiring Quotes</h4>
                </div>
                <ul className="space-y-2">
                  {orgData.alerts.expiringQuotes.map((q: any) => (
                    <li key={q.id} className="text-sm">
                      <Link href={`/dashboard/quotes/${q.id}`} className="text-amber-700 hover:text-amber-900">
                        <span className="font-medium">{q.quote_number}</span> - {q.customer_name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deposits Due */}
            {orgData.alerts.depositsDue?.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Deposits Due</h4>
                </div>
                <ul className="space-y-2">
                  {orgData.alerts.depositsDue.map((b: any) => (
                    <li key={b.id} className="text-sm">
                      <Link href={`/dashboard/bookings/${b.id}`} className="text-blue-700 hover:text-blue-900">
                        <span className="font-medium">{b.booking_number}</span> - €{Number(b.deposit_amount).toFixed(0)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Balances Due */}
            {orgData.alerts.balancesDue?.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">Balances Due</h4>
                </div>
                <ul className="space-y-2">
                  {orgData.alerts.balancesDue.map((b: any) => (
                    <li key={b.id} className="text-sm">
                      <Link href={`/dashboard/bookings/${b.id}`} className="text-purple-700 hover:text-purple-900">
                        <span className="font-medium">{b.booking_number}</span> - €{Number(b.balance_amount).toFixed(0)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upcoming Trips */}
            {orgData.alerts.upcomingTrips?.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Upcoming Trips</h4>
                </div>
                <ul className="space-y-2">
                  {orgData.alerts.upcomingTrips.map((b: any) => (
                    <li key={b.id} className="text-sm">
                      <Link href={`/dashboard/bookings/${b.id}`} className="text-green-700 hover:text-green-900">
                        <span className="font-medium">{b.customer_name}</span> - {new Date(b.start_date).toLocaleDateString()}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overdue Follow-ups */}
            {orgData.alerts.overdueFollowups?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Overdue Follow-ups</h4>
                </div>
                <ul className="space-y-2">
                  {orgData.alerts.overdueFollowups.map((q: any) => (
                    <li key={q.id} className="text-sm">
                      <Link href={`/dashboard/quotes/${q.id}`} className="text-red-700 hover:text-red-900">
                        <span className="font-medium">{q.quote_number}</span> - {q.customer_name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        )
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/quotes/ai-generate"
            className="group relative p-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Bot className="w-24 h-24 text-white transform rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">NEW</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">AI Quote Generator</h4>
              <p className="text-blue-100 text-sm mb-4">Create complete itineraries in seconds with AI.</p>
              <div className="flex items-center text-white text-sm font-medium group-hover:gap-2 transition-all">
                Start Generating <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/quotes/create"
            className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600 w-fit mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Manual Quote</h4>
            <p className="text-sm text-gray-500">Create a quote manually step by step.</p>
          </Link>

          <Link
            href="/dashboard/customer-requests"
            className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600 w-fit mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Customer Requests</h4>
            <p className="text-sm text-gray-500">View and manage incoming requests.</p>
          </Link>

          <Link
            href="/dashboard/branding"
            className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600 w-fit mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Palette className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Customize Branding</h4>
            <p className="text-sm text-gray-500">Set your logo, colors, and domain.</p>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600 w-fit mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Analytics</h4>
            <p className="text-sm text-gray-500">Track performance and conversions.</p>
          </Link>

          <Link
            href="/dashboard/team"
            className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600 w-fit mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Team Management</h4>
            <p className="text-sm text-gray-500">Manage staff access and roles.</p>
          </Link>
        </div>
      </div>

      {/* Platform URL */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

        <div className="relative z-10 flex items-start gap-6">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Globe className="w-8 h-8 text-blue-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-2">Your Platform URL</h4>
            <p className="text-blue-200 text-sm mb-4 max-w-2xl">
              Share this URL with your customers to access your white-labeled itinerary builder. They will see your branding, not ours.
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-black/30 rounded-lg px-4 py-3 font-mono text-sm text-blue-300 border border-white/10">
                https://{orgData.organization.subdomain || orgData.organization.slug}.travelquotebot.com
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(`https://${orgData.organization.subdomain || orgData.organization.slug}.travelquotebot.com`)}
                className="px-4 py-3 bg-white text-blue-900 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
