'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'credit_card';
  details: string;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  plan: string;
  downloadUrl: string;
}

interface User {
  organizationId: number;
  organizationName: string;
  role: string;
}

interface DashboardData {
  organization: any;
  credits: {
    credits_total: number;
    credits_used: number;
    credits_available: number;
    reset_date: string;
  };
  subscription: {
    plan_type: string;
    monthly_credits: number;
    price: number;
    status: string;
    trial_ends_at: string;
    current_period_start: string;
    current_period_end: string;
  };
  stats: {
    quotesThisMonth: number;
  };
}

export default function Billing() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState(50);
  const [billingData, setBillingData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Fetch dashboard data
    Promise.all([
      fetch(`/api/operator/dashboard/${parsedUser.organizationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`/api/billing/${parsedUser.organizationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json())
    ])
      .then(([dashboardData, billingDataRes]) => {
        setData(dashboardData);
        setBillingData(billingDataRes);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading || !user || !data || !billingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const { subscription, credits, stats } = data;
  const { usageHistory = [], paymentMethods = [], invoices = [] } = billingData || {};
  const isTrialActive = subscription?.status === 'trial';
  const trialDaysRemaining = isTrialActive && subscription.trial_ends_at
    ? Math.ceil((new Date(subscription.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const usagePercentage = credits.credits_total > 0
    ? ((credits.credits_used / credits.credits_total) * 100).toFixed(1)
    : 0;

  const plans = [
    {
      type: 'starter',
      name: 'Starter',
      price: 0,
      credits: 50,
      features: [
        '50 AI quotes per month',
        'Basic pricing management',
        'White-label platform',
        'Email support'
      ]
    },
    {
      type: 'professional',
      name: 'Professional',
      price: 99,
      credits: 200,
      popular: true,
      features: [
        '200 AI quotes per month',
        'Advanced pricing tools',
        'Custom branding',
        'Priority support',
        'Analytics dashboard'
      ]
    },
    {
      type: 'enterprise',
      name: 'Enterprise',
      price: 299,
      credits: 1000,
      features: [
        '1000 AI quotes per month',
        'Unlimited pricing rules',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ]
    }
  ];

  const currentPlan = plans.find(p => p.type === subscription?.plan_type) || plans[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Logo size="md" variant="gradient" />
              <div className="border-l border-gray-300 pl-6">
                <h1 className="text-2xl font-bold text-blue-600">{data.organization.name}</h1>
                <p className="text-sm text-gray-600">Billing & Subscription</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                  ← Back to Dashboard
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Trial Banner */}
          {isTrialActive && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Free Trial Active</h3>
                  <p className="text-blue-100">
                    You have <strong>{trialDaysRemaining} days</strong> remaining in your trial period.
                    {trialDaysRemaining <= 3 && ' Upgrade now to continue using all features!'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Trial ends on</p>
                  <p className="text-lg font-bold">{new Date(subscription.trial_ends_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Plan & Credits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Plan */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Current Plan</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{currentPlan.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {subscription.status === 'trial' ? 'Trial Period' : 'Active Subscription'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">
                      {currentPlan.price === 0 ? 'Free' : `€${currentPlan.price}`}
                    </p>
                    <p className="text-sm text-gray-600">per month</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Plan includes:</p>
                  <ul className="space-y-2">
                    {currentPlan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {subscription.status !== 'trial' && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Next billing date:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Credits Usage */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Credits Usage</h3>
              <div className="space-y-4">
                {/* Credits Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Credits Used</span>
                    <span className="font-semibold text-gray-900">{usagePercentage}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        Number(usagePercentage) > 90
                          ? 'bg-red-600'
                          : Number(usagePercentage) > 70
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${usagePercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{credits.credits_total}</p>
                    <p className="text-xs text-gray-600 mt-1">Total Credits</p>
                  </div>
                  <div className="text-center border-l border-r">
                    <p className="text-2xl font-bold text-red-600">{credits.credits_used}</p>
                    <p className="text-xs text-gray-600 mt-1">Used</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{credits.credits_available}</p>
                    <p className="text-xs text-gray-600 mt-1">Available</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Quotes this month:</span>
                    <span className="font-semibold text-gray-900">{stats.quotesThisMonth}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Credits reset on:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(credits.reset_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {credits.credits_available < 10 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      ⚠️ <strong>Low credits!</strong> Consider upgrading your plan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Available Plans */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Available Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.type}
                  className={`relative border-2 rounded-xl p-6 transition-all ${
                    plan.type === subscription?.plan_type
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  } ${plan.popular ? 'ring-2 ring-blue-600' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        POPULAR
                      </span>
                    </div>
                  )}

                  {plan.type === subscription?.plan_type && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        CURRENT
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-1">
                      {plan.price === 0 ? 'Free' : `€${plan.price}`}
                    </div>
                    <div className="text-sm text-gray-600">per month</div>
                  </div>

                  <div className="mb-6 text-center">
                    <span className="text-sm font-semibold text-gray-700">
                      {plan.credits} AI quotes/month
                    </span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.type !== subscription?.plan_type ? (
                    <button
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => alert(`Upgrade to ${plan.name} - Coming soon!`)}
                    >
                      {plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade'}
                    </button>
                  ) : (
                    <div className="w-full py-3 text-center text-gray-500 font-semibold border border-gray-300 rounded-lg">
                      Current Plan
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Usage Analytics */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Usage Analytics</h3>
              <span className="text-sm text-gray-600">Last 6 months</span>
            </div>

            {usageHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No usage data available yet.</p>
                <p className="text-sm mt-2">Start creating quotes to see your usage analytics.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {usageHistory.map((item: any, idx: number) => {
                    const percentage = (item.used / item.total) * 100;
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700">{item.month}</span>
                          <span className="text-gray-600">
                            {item.used} / {item.total} credits
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Avg Monthly Usage</p>
                    <p className="text-xl font-bold text-gray-900">
                      {Math.round(usageHistory.reduce((acc: number, item: any) => acc + item.used, 0) / usageHistory.length)}
                    </p>
                  </div>
                  <div className="text-center border-l border-r">
                    <p className="text-sm text-gray-600 mb-1">Peak Usage</p>
                    <p className="text-xl font-bold text-gray-900">
                      {Math.max(...usageHistory.map((item: any) => item.used))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Total This Year</p>
                    <p className="text-xl font-bold text-gray-900">
                      {usageHistory.reduce((acc: number, item: any) => acc + item.used, 0)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Purchase Credits */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase Additional Credits</h3>
            <p className="text-gray-600 mb-6">Need more credits before your renewal date? Purchase additional credits now.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { credits: 50, price: 49, savings: 0 },
                { credits: 100, price: 89, savings: 10, popular: true },
                { credits: 200, price: 159, savings: 30 }
              ].map((pack) => (
                <div
                  key={pack.credits}
                  className={`relative border-2 rounded-xl p-6 text-center transition-all cursor-pointer ${
                    selectedCredits === pack.credits
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  } ${pack.popular ? 'ring-2 ring-blue-600' : ''}`}
                  onClick={() => setSelectedCredits(pack.credits)}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        BEST VALUE
                      </span>
                    </div>
                  )}

                  <div className="text-4xl font-bold text-blue-600 mb-2">{pack.credits}</div>
                  <div className="text-sm text-gray-600 mb-4">Credits</div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">€{pack.price}</div>
                  {pack.savings > 0 && (
                    <div className="text-sm text-green-600 font-semibold">
                      Save €{pack.savings}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPurchaseModal(true)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg"
            >
              Purchase {selectedCredits} Credits
            </button>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                + Add Method
              </button>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No payment methods added yet.</p>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Payment Method
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method: any) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        method.type === 'bank_transfer' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {method.type === 'bank_transfer' ? (
                          <span className="text-2xl">🏦</span>
                        ) : (
                          <span className="text-2xl">💳</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{method.details}</p>
                        <p className="text-sm text-gray-600">
                          {method.type === 'bank_transfer' ? 'Bank Transfer' : 'Credit Card'}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        DEFAULT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Billing History & Invoices */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Billing History & Invoices</h3>

            {invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No invoices yet.</p>
                <p className="text-sm mt-2">Your billing history and invoices will appear here after your first payment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 text-sm font-semibold text-gray-700">Date</th>
                      <th className="pb-3 text-sm font-semibold text-gray-700">Description</th>
                      <th className="pb-3 text-sm font-semibold text-gray-700">Amount</th>
                      <th className="pb-3 text-sm font-semibold text-gray-700">Status</th>
                      <th className="pb-3 text-sm font-semibold text-gray-700">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice: any) => (
                      <tr key={invoice.id} className="border-b last:border-0">
                        <td className="py-4 text-sm text-gray-900">{invoice.date}</td>
                        <td className="py-4 text-sm text-gray-900">{invoice.plan}</td>
                        <td className="py-4 text-sm font-semibold text-gray-900">€{invoice.amount}</td>
                        <td className="py-4">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {invoice.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => window.open(invoice.downloadUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Purchase Credits Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Purchase Credits</h3>
            <p className="text-gray-600 mb-6">
              You are about to purchase <strong>{selectedCredits} credits</strong> for{' '}
              <strong>€{selectedCredits === 50 ? 49 : selectedCredits === 100 ? 89 : 159}</strong>.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Payment Instructions:</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Bank Transfer Details:</strong></p>
                <p>Bank: Ziraat Bankası</p>
                <p>Account Name: DYF TURIZM TIC LTD STI</p>
                <p>IBAN: TR00 0000 0000 0000 0000 0000 00</p>
                <p className="mt-2"><strong>Reference:</strong> Your Organization ID - {user?.organizationId}</p>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-6">
              After making the payment, please contact us at <a href="mailto:info@travelquoteai.com" className="text-blue-600 hover:underline">info@travelquoteai.com</a> with your payment proof.
              Credits will be added to your account within 24 hours.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Payment instructions sent to your email!');
                  setShowPurchaseModal(false);
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Payment Method</h3>

            <div className="space-y-4 mb-6">
              <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-600 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏦</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Bank Transfer</p>
                    <p className="text-sm text-gray-600">Pay via bank transfer</p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-600 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Credit Card (Manual)</p>
                    <p className="text-sm text-gray-600">Contact us to set up card payment</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                To add a credit card payment method, please contact our support team at{' '}
                <a href="mailto:info@travelquoteai.com" className="font-semibold underline">
                  info@travelquoteai.com
                </a>
              </p>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
