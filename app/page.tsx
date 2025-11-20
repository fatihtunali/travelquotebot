'use client';

import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import Footer from '@/components/home/Footer';
import CookieConsent from '@/components/CookieConsent';
import ExitIntentPopup from '@/components/ExitIntentPopup';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
      </main>

      <Footer />

      <CookieConsent />
      <ExitIntentPopup />
    </div>
  );
}
