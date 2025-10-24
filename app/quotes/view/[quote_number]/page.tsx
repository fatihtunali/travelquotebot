'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ItineraryBuilder from '@/components/itinerary/ItineraryBuilder';

export default function QuoteViewPage({
  params
}: {
  params: Promise<{ quote_number: string }>
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuote();
  }, [resolvedParams.quote_number]);

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/public-quotes/${resolvedParams.quote_number}`);

      if (!response.ok) {
        throw new Error('Quote not found');
      }

      const data = await response.json();
      setQuoteData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (!confirm('Are you sure you want to accept this quote?')) return;

    try {
      const response = await fetch(`/api/public-quotes/${resolvedParams.quote_number}/accept`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Thank you! Your quote has been accepted. We will contact you shortly.');
        fetchQuote(); // Refresh to show new status
      } else {
        alert('Failed to accept quote. Please try again or contact us directly.');
      }
    } catch (err) {
      alert('Failed to accept quote. Please try again or contact us directly.');
    }
  };

  const handleRequestChanges = () => {
    // Redirect to contact form or email
    if (quoteData?.organization_email) {
      window.location.href = `mailto:${quoteData.organization_email}?subject=Changes Request for ${resolvedParams.quote_number}&body=Hi, I would like to request changes to quote ${resolvedParams.quote_number}...`;
    } else {
      alert('Please contact us to request changes.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quoteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The quote you are looking for does not exist or has been removed.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Use the same ItineraryBuilder component in view mode */}
      <ItineraryBuilder
        mode="view"
        initialData={quoteData}
      />

      {/* Action Buttons - Fixed at bottom */}
      {quoteData.status !== 'accepted' && quoteData.status !== 'confirmed' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">Questions about this quote?</p>
                <p className="text-lg font-semibold text-gray-900">
                  Contact us: {quoteData.organization_email || quoteData.organization_phone}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleRequestChanges}
                  className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
                >
                  Request Changes
                </button>
                <button
                  onClick={handleAcceptQuote}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
                >
                  Accept Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accepted Status Banner */}
      {(quoteData.status === 'accepted' || quoteData.status === 'confirmed') && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-600/90 backdrop-blur-xl shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xl font-bold text-white">Quote Accepted!</p>
                <p className="text-green-100">We will contact you shortly to finalize your booking.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
