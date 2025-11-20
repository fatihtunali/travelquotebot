'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import CookieConsent from '@/components/CookieConsent';
import ExitIntentPopup from '@/components/ExitIntentPopup';

export default function Home() {
  const [videoExpanded, setVideoExpanded] = useState(false);

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: 'url(/MaidenTowerIstanbul.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-indigo-900/60 to-purple-900/70"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          <Logo size="sm" variant="light" />
          <div className="flex gap-2">
            <Link href="/plan-trip?orgId=5" className="hidden sm:block">
              <button type="button" className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-white rounded-full text-xs font-medium hover:bg-white/20 transition-all border border-white/30">
                Plan Trip
              </button>
            </Link>
            <Link href="/login">
              <button type="button" className="px-3 py-1.5 bg-white/10 backdrop-blur-md text-white rounded-full text-xs font-medium hover:bg-white/20 transition-all border border-white/30">
                Sign In
              </button>
            </Link>
            <Link href="/signup">
              <button type="button" className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - Single Screen Layout */}
      <div className="relative flex-1 container mx-auto px-4 py-3 flex flex-col">
        {/* Top Section - Hero + Video */}
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 mb-4">
          {/* Left - Hero Content */}
          <div className="flex flex-col justify-center space-y-3">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 w-fit">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-white text-xs font-medium">Turkey • Greece • Egypt</span>
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Travel Quote
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent"> AI</span>
              </h1>
              <p className="text-sm text-white/80 mt-2">
                AI-Powered Tour Operator Platform for intelligent pricing & real-time quotes
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <Link href="/signup">
                <button type="button" className="px-5 py-2.5 text-sm bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg hover:scale-105">
                  Start Free Trial
                </button>
              </Link>
              <Link href="/plan-trip?orgId=5">
                <button type="button" className="px-5 py-2.5 text-sm bg-white/10 backdrop-blur-md text-white rounded-full font-semibold hover:bg-white/20 transition-all border border-white/30">
                  Plan Your Trip
                </button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-500/20 backdrop-blur-sm rounded-full text-xs text-white border border-blue-400/30">⚡ AI Powered</span>
              <span className="px-3 py-1 bg-indigo-500/20 backdrop-blur-sm rounded-full text-xs text-white border border-indigo-400/30">💰 Real Time Pricing</span>
              <span className="px-3 py-1 bg-purple-500/20 backdrop-blur-sm rounded-full text-xs text-white border border-purple-400/30">🎨 White Label</span>
            </div>
          </div>

          {/* Right - Destination Cards */}
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-3 gap-3 w-full">
              {/* Turkey */}
              <div className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="h-16 bg-gradient-to-br from-red-500/30 to-red-600/30 flex items-center justify-center">
                  <Image src="https://flagcdn.com/w80/tr.png" alt="Turkey Flag" width={48} height={32} className="rounded shadow-lg" priority />
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-bold text-white">Turkey</h3>
                  <p className="text-[9px] text-white/70">Istanbul, Cappadocia</p>
                </div>
              </div>

              {/* Greece */}
              <div className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="h-16 bg-gradient-to-br from-blue-500/30 to-blue-600/30 flex items-center justify-center">
                  <Image src="https://flagcdn.com/w80/gr.png" alt="Greece Flag" width={48} height={32} className="rounded shadow-lg" priority />
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-bold text-white">Greece</h3>
                  <p className="text-[9px] text-white/70">Athens, Santorini</p>
                </div>
              </div>

              {/* Egypt */}
              <div className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="h-16 bg-gradient-to-br from-amber-500/30 to-amber-600/30 flex items-center justify-center">
                  <Image src="https://flagcdn.com/w80/eg.png" alt="Egypt Flag" width={48} height={32} className="rounded shadow-lg" priority />
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-bold text-white">Egypt</h3>
                  <p className="text-[9px] text-white/70">Cairo, Luxor</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Modal */}
        {videoExpanded && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setVideoExpanded(false)}
          >
            <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setVideoExpanded(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 text-sm flex items-center gap-1"
              >
                <span>Close</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/wDUW9kzqh78?rel=0&modestbranding=1&autoplay=1"
                    title="Travel Quote AI Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section - Video */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Section Header */}
          <div className="text-center mb-3">
            <h2 className="text-xl md:text-2xl font-bold text-white">See How It Works</h2>
            <p className="text-xs text-white/70">Watch our demo to see AI-powered quote generation in action</p>
          </div>

          {/* Video Thumbnail */}
          <div className="flex justify-center">
            <div
              onClick={() => setVideoExpanded(true)}
              className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 backdrop-blur-lg bg-white/5 cursor-pointer hover:scale-105 transition-transform duration-300 group"
            >
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  src="https://www.youtube.com/embed/wDUW9kzqh78?rel=0&modestbranding=1"
                  title="Travel Quote AI Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                ></iframe>
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-2 text-center">
                <p className="text-[10px] text-white/70">Click to watch demo</p>
              </div>
            </div>
          </div>

          {/* Multi-Country Badge */}
          <div className="text-center mt-3">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-white text-xs">
              🌍 Combine countries in a single itinerary!
            </span>
          </div>
        </div>
      </div>

      {/* Compact Footer */}
      <footer className="relative z-10 border-t border-white/20 backdrop-blur-md bg-white/5">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-2 text-white/70">
              <span>© {new Date().getFullYear()} DYF TURIZM TIC LTD STI</span>
            </div>
            <div className="flex gap-3 text-white/70">
              <Link href="/features" className="hover:text-white transition-colors">Features</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
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
