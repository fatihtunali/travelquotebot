export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="container mx-auto px-4 py-16 relative z-10 max-w-7xl">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="text-6xl mb-4 animate-bounce">✈️</div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              TravelQuoteBot
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-4 font-light">
              AI-Powered Tour Operator Platform
            </p>
            <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              B2B SaaS for Turkey Travel Itineraries with Real-Time Pricing
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bubble-card p-8 text-center">
              <div className="w-16 h-16 gradient-blue rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                🤖
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">AI-Powered</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate personalized itineraries with Claude AI in seconds
              </p>
            </div>

            <div className="bubble-card p-8 text-center">
              <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                💰
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Real-Time Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                Live prices from hotels, flights, and activities
              </p>
            </div>

            <div className="bubble-card p-8 text-center">
              <div className="w-16 h-16 gradient-purple rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                🏷️
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">White-Label</h3>
              <p className="text-gray-600 leading-relaxed">
                Custom branding for each tour operator
              </p>
            </div>
          </div>

          {/* System Status */}
          <div className="bubble-card p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              System Status
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                <span className="font-semibold text-gray-700">Database</span>
                <span className="flex items-center gap-2 text-green-600 font-bold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                <span className="font-semibold text-gray-700">Server</span>
                <span className="text-blue-600 font-mono text-sm">188.132.230.193</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                <span className="font-semibold text-gray-700">Environment</span>
                <span className="text-purple-600 font-bold">Development</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/auth/register"
              className="group relative px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10">Create Account</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold">
                Get Started →
              </span>
            </a>
            <a
              href="/auth/login"
              className="px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-full font-bold text-lg border-2 border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Sign In
            </a>
            <a
              href="/api/test"
              className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Test API
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
