'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ItineraryBuilder, { QuoteData } from '@/components/itinerary/ItineraryBuilder';

export default function PublicItineraryPage({ params }: { params: Promise<{ quoteId: string }> }) {
  const router = useRouter();
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setQuoteId(resolvedParams.quoteId);
    });
  }, [params]);

  useEffect(() => {
    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);

    try {
      // Public access - no authentication required
      // Need to get organization ID from the quote
      // For now, we'll try to fetch with a public endpoint
      // You might need to adjust this based on your setup

      // Try to fetch the quote - the API allows public access
      const response = await fetch(`/api/quotes/public/${quoteId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Quote not found. Please check the link and try again.');
        } else {
          setError('Failed to load itinerary. Please try again later.');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setQuoteData(data.quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
      setError('Failed to load itinerary. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!quoteData || !quoteId) return;

    if (!confirm('Accept this quote and create booking?')) {
      return;
    }

    try {
      // This would typically send an email to the operator or create a booking request
      alert('Thank you! We have received your acceptance. Our team will contact you shortly to complete the booking.');

      // You can add actual booking creation logic here
      // For now, we'll just show a success message
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert('Failed to accept quote. Please contact us directly.');
    }
  };

  const handleRequestChange = () => {
    if (!quoteData) return;

    // Open email client with pre-filled message
    const subject = `Request Changes - Quote ${quoteData.quote_number}`;
    const body = `Hi,\n\nI would like to request some changes to my quote (${quoteData.quote_number}):\n\n[Please describe the changes you would like]\n\nBest regards,\n${quoteData.customer_name}`;
    const mailtoLink = `mailto:${quoteData.organization_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Itinerary</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            If you continue to experience issues, please contact the tour operator directly.
          </p>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return null;
  }

  return (
    <div className="relative">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your Travel Itinerary</h2>
                <p className="text-xs text-gray-500">{quoteData.quote_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Content */}
      <ItineraryBuilder
        mode="view"
        initialData={quoteData}
      />

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-600">Questions about this itinerary?</p>
              <a
                href={`mailto:${quoteData.organization_email}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact {quoteData.organization_name}
              </a>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleRequestChange}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Request Changes
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg"
              >
                Accept & Book
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for bottom bar */}
      <div className="h-24"></div>
    </div>
  );
}
