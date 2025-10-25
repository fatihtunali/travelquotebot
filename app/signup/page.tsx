'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Link from 'next/link';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Form data
  const [formData, setFormData] = useState({
    // Tour Operator details
    organizationName: '',
    slug: '',
    // Admin user details
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Subscription plan
    planType: 'starter'
  });

  // Auto-generate slug from tour operator name
  const handleOrgNameChange = (name: string) => {
    setFormData({
      ...formData,
      organizationName: name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      // Auto-login after successful signup
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const plans = [
    {
      type: 'starter',
      name: 'Starter',
      price: 'Free',
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
      price: '€99',
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
      price: '€299',
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-transparent to-purple-500/30 animate-pulse"></div>
      </div>

      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl border border-white/20">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex justify-center mb-4">
              <Logo size="lg" variant="gradient" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Create Your Account</h1>
            <p className="text-gray-600 text-center">Start your 14-day free trial. No credit card required.</p>

            {/* Progress indicator */}
            <div className="flex justify-center mt-6 gap-2">
              <div className={`h-2 w-20 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`h-2 w-20 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`h-2 w-20 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Step 1: Tour Operator Details */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Tour Operator Details</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tour Operator Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) => handleOrgNameChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="e.g., Istanbul Tours & Travel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subdomain (URL Slug) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="e.g., istanbul-tours"
                    />
                    <span className="text-gray-500 text-sm">.travelquoteai.com</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This will be your white-label platform URL</p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.organizationName || !formData.slug}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Admin User Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Step 2: Your Details</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Choose Plan */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Step 3: Choose Your Plan</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.type}
                      onClick={() => setFormData({ ...formData, planType: plan.type })}
                      className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.planType === plan.type
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

                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold text-blue-600 mb-1">{plan.price}</div>
                        <div className="text-sm text-gray-600">per month</div>
                      </div>

                      <div className="mb-4 text-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {plan.credits} AI quotes/month
                        </span>
                      </div>

                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    ✨ <strong>14-day free trial</strong> - No credit card required. You can upgrade, downgrade, or cancel anytime.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
