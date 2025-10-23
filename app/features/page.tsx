import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <Logo size="sm" variant="dark" />
            </Link>
            <div className="flex gap-4">
              <Link href="/plan-trip">
                <button type="button" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                  Plan Turkey Trip
                </button>
              </Link>
              <Link href="/login">
                <button type="button" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            AI-Powered Tour Operator Platform
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Transform your tour operations with intelligent pricing, real-time quotes, AI-generated itineraries, and seamless white-label solutions for Turkey travel.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Key Features */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Powerful Features for Modern Tour Operators
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Itinerary Generation */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Itinerary Generation</h3>
              <p className="text-gray-600">
                Generate professional, detailed itineraries in seconds using AI. Perfect day-by-day plans with hotels, tours, transfers, and pricing automatically calculated.
              </p>
            </div>

            {/* Smart Pricing Database */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Pricing Database</h3>
              <p className="text-gray-600">
                Manage all your pricing in one place: hotels, tours, vehicles, guides, entrance fees, meals, and extras. Season-based pricing with instant updates.
              </p>
            </div>

            {/* Real-Time Quote Generation */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Quotes</h3>
              <p className="text-gray-600">
                Generate accurate quotes instantly based on your live pricing database. No more manual calculations or spreadsheet errors.
              </p>
            </div>

            {/* White Label Solution */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">White Label Branding</h3>
              <p className="text-gray-600">
                Customize the platform with your logo, colors, and domain. Provide a seamless branded experience to your customers.
              </p>
            </div>

            {/* Customer Lead Management */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lead Management</h3>
              <p className="text-gray-600">
                Track all customer inquiries, saved itineraries, and booking requests in one dashboard. Never lose a potential customer.
              </p>
            </div>

            {/* Multi-Organization */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🏢</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Organization</h3>
              <p className="text-gray-600">
                Manage multiple tour operator accounts on one platform. Perfect for DMCs managing different brands or locations.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your account and set up your tour operator profile with branding.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Add Pricing</h3>
              <p className="text-gray-600">
                Import or add your hotels, tours, vehicles, and service pricing to the database.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Generate Quotes</h3>
              <p className="text-gray-600">
                Let AI create perfect itineraries with accurate pricing in seconds.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Track & Convert</h3>
              <p className="text-gray-600">
                Manage leads, follow up with customers, and convert inquiries to bookings.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Perfect For
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Tour Operators</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Automate quote generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Manage seasonal pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Track customer inquiries</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Brand customization</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Travel Agencies</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Quick quote turnaround</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Professional itineraries</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Real-time pricing updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Lead capture system</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-teal-600 text-white rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">DMCs & Wholesalers</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Multi-brand management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Bulk pricing updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>White-label portals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>Analytics & reporting</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Tour Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join modern tour operators using AI to save time, increase efficiency, and grow their business.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <button type="button" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Start Free Trial
              </button>
            </Link>
            <Link href="/plan-trip">
              <button type="button" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-colors border border-white/30">
                Try Trip Planner
              </button>
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-md mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Logo size="sm" variant="dark" />
              <div className="text-gray-600 text-sm text-center md:text-left">
                <p>© {new Date().getFullYear()} All rights reserved by</p>
                <p className="font-semibold">DYF TURIZM TIC LTD STI</p>
              </div>
            </div>
            <div className="flex gap-6 text-gray-600 text-sm">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-gray-900 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
