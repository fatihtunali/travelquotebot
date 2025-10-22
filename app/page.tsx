export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-8 py-16">
        <div className="grid md:grid-cols-2 gap-16 min-h-[80vh] items-center">
          {/* Left Side */}
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Travel Quote AI
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700">
              AI-Powered Tour Operator Platform
            </h2>
            <p className="text-xl text-gray-600">
              B2B SaaS for Turkey
            </p>
          </div>

          {/* Right Side */}
          <div className="flex flex-col space-y-8">
            {/* Auth Buttons */}
            <div className="flex gap-4 justify-end">
              <button className="px-6 py-2 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-50 transition-colors border border-blue-600">
                Sign In
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
                Create Account
              </button>
            </div>

            {/* Bubble Sections */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-blue-600">AI POWERED</h3>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-indigo-600">Real Time Pricing</h3>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-purple-600">White Label</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
