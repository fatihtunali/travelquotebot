import Link from 'next/link';
import Logo from '@/components/Logo';
import CookieConsent from '@/components/CookieConsent';
import ExitIntentPopup from '@/components/ExitIntentPopup';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      {/* Background Image with Parallax Effect */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: 'url(/MaidenTowerIstanbul.jpg)' }}
      >
        {/* Gradient Overlay for modern look */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-indigo-900/50 to-purple-900/60"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 container mx-auto px-4 md:px-8 py-4">
        <div className="flex justify-between items-center">
          <Logo size="md" variant="light" />
          <div className="flex gap-2 md:gap-4">
            <Link href="/plan-trip" className="hidden sm:block">
              <button type="button" className="px-4 md:px-6 py-2 md:py-2.5 bg-white/10 backdrop-blur-md text-white rounded-full text-sm md:text-base font-medium hover:bg-white/20 transition-all border border-white/30 shadow-lg hover:scale-105 duration-200">
                Plan Trip
              </button>
            </Link>
            <Link href="/login">
              <button type="button" className="px-4 md:px-6 py-2 md:py-2.5 bg-white/10 backdrop-blur-md text-white rounded-full text-sm md:text-base font-medium hover:bg-white/20 transition-all border border-white/30 shadow-lg hover:scale-105 duration-200">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button type="button" className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm md:text-base font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:scale-105 duration-200">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative flex-1 container mx-auto px-4 md:px-8 flex items-center py-8 md:py-0">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 md:gap-8 w-full items-center">
          {/* Left Side - Hero Text */}
          <div className="flex flex-col justify-center space-y-4 md:space-y-6 max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/20 w-fit">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-white text-xs md:text-sm font-medium">B2B SaaS for Turkey</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2 md:space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Travel Quote
                <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-white/90">
                AI-Powered Tour Operator Platform
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm md:text-base lg:text-lg text-white/80 leading-relaxed">
              Transform your tour operations with intelligent pricing, real-time quotes, and seamless white-label solutions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-2 md:gap-3 pt-2">
              <Link href="/signup">
                <button type="button" className="px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 duration-200">
                  Start Free Trial
                </button>
              </Link>
              <Link href="/plan-trip">
                <button type="button" className="px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-white/10 backdrop-blur-md text-white rounded-full font-semibold hover:bg-white/20 transition-all border border-white/30 shadow-lg hover:scale-105 duration-200">
                  Plan Turkey Trip
                </button>
              </Link>
            </div>
          </div>

          {/* Right Side - Feature Cards */}
          <div className="flex flex-col gap-2 md:gap-3 justify-center">
            {/* AI Powered Card */}
            <div className="group bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 md:p-2.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-white mb-0.5">AI POWERED</h3>
                  <p className="text-xs text-white/70">Intelligent algorithms optimize your pricing and operations in real-time</p>
                </div>
              </div>
            </div>

            {/* Real Time Pricing Card */}
            <div className="group bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 md:p-2.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-white mb-0.5">Real Time Pricing</h3>
                  <p className="text-xs text-white/70">Dynamic pricing updates instantly based on market conditions</p>
                </div>
              </div>
            </div>

            {/* White Label Card */}
            <div className="group bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 md:p-2.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-bold text-white mb-0.5">White Label</h3>
                  <p className="text-xs text-white/70">Fully customizable platform to match your brand identity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Video Section */}
      <section className="relative z-10 container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3">
              See TQA in Action
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-white/80">
              Watch how we transform 2-hour quote creation into a 10-minute process
            </p>
          </div>

          {/* Video Container */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-lg bg-white/5">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/wDUW9kzqh78?rel=0&modestbranding=1"
                title="Travel Quote AI Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* CTA Below Video */}
          <div className="text-center mt-6 md:mt-8">
            <Link href="/signup">
              <button type="button" className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-2xl hover:scale-105 duration-200">
                Start Your Free Trial
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 backdrop-blur-md bg-white/5 mt-auto">
        <div className="container mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            {/* Left side - Logo and Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <Logo size="sm" variant="light" />
              <div className="text-white/80 text-xs md:text-sm text-center md:text-left">
                <p>© {new Date().getFullYear()} All rights reserved by</p>
                <p className="font-semibold">DYF TURIZM TIC LTD STI</p>
              </div>
            </div>

            {/* Right side - Links */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-white/70 text-xs md:text-sm">
              <Link href="/features" className="hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsent />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
}
