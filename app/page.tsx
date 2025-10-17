export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Turkish Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/MaidenTowerIstanbul.jpg')",
        }}
      ></div>

      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      {/* Right Side Feature Cards */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10 space-y-4 max-w-xs hidden lg:block">
        <div className="bubble-card p-6 text-center shadow-2xl backdrop-blur-sm bg-white/95">
          <div className="w-12 h-12 gradient-blue rounded-full flex items-center justify-center text-2xl mx-auto mb-3 shadow-xl">
            🤖
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-800">AI-Powered</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Generate personalized itineraries with Claude AI in seconds
          </p>
        </div>

        <div className="bubble-card p-6 text-center shadow-2xl backdrop-blur-sm bg-white/95">
          <div className="w-12 h-12 gradient-green rounded-full flex items-center justify-center text-2xl mx-auto mb-3 shadow-xl">
            ⚡
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-800">Real-Time Pricing</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Live prices from hotels, flights, and activities
          </p>
        </div>

        <div className="bubble-card p-6 text-center shadow-2xl backdrop-blur-sm bg-white/95">
          <div className="w-12 h-12 gradient-purple rounded-full flex items-center justify-center text-2xl mx-auto mb-3 shadow-xl">
            🎨
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-800">White-Label</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Custom branding for each tour operator
          </p>
        </div>
      </div>

      {/* Top Right Navigation Buttons */}
      <div className="absolute top-8 right-8 flex gap-4 z-20">
        <a
          href="/auth/register"
          className="group relative px-6 py-3 bg-white text-purple-600 rounded-full font-bold text-sm shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transform hover:scale-105 transition-all duration-300"
        >
          <span className="relative z-10">Create Account</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold">
            Get Started →
          </span>
        </a>
        <a
          href="/auth/login"
          className="px-6 py-3 bg-white/30 backdrop-blur-md text-white rounded-full font-bold text-sm border-2 border-white/50 hover:bg-white/40 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
        >
          Sign In
        </a>
        {process.env.NODE_ENV === 'development' && (
          <a
            href="/api/test"
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-bold text-sm shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transform hover:scale-105 transition-all duration-300"
          >
            Test API
          </a>
        )}
      </div>

      {/* Hero Section - Left Center */}
      <div className="flex items-center min-h-screen relative z-10 -mt-16">
        <div className="container mx-auto px-8 md:px-16">
          <div className="max-w-3xl">
            <div className="mb-6">
              <div className="text-6xl mb-4 animate-bounce drop-shadow-2xl">🇹🇷</div>
            </div>
            <h1
              className="text-6xl md:text-7xl font-bold text-white mb-6"
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.6)' }}
            >
              TravelQuoteBot
            </h1>
            <p
              className="text-2xl md:text-3xl text-white mb-4 font-light"
              style={{ textShadow: '0 2px 15px rgba(0,0,0,0.7), 0 1px 8px rgba(0,0,0,0.5)' }}
            >
              AI-Powered Tour Operator Platform
            </p>
            <p
              className="text-lg md:text-xl text-white mb-12 max-w-2xl"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7), 0 1px 6px rgba(0,0,0,0.5)' }}
            >
              B2B SaaS for Turkey Travel Itineraries with Real-Time Pricing
            </p>
          </div>
        </div>
      </div>

      {/* Bottom System Status Bar - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="backdrop-blur-md bg-white/10 border-t border-white/20">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span
                    className="text-white font-medium"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    Database Connected
                  </span>
                </div>
                <span className="text-white/50">•</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-white/80 font-medium"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    Server:
                  </span>
                  <span
                    className="text-white font-mono text-xs"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    Private Cluster
                  </span>
                </div>
                <span className="text-white/50">•</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-white/80 font-medium"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    Environment:
                  </span>
                  <span
                    className="text-purple-300 font-semibold"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                  >
                    Development
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
