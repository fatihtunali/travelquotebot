'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for PDF button (client-side only)
const PDFDownloadButton = dynamic(() => import('@/components/PDFDownloadButton'), {
  ssr: false,
  loading: () => (
    <button
      type="button"
      disabled
      className="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold shadow-md cursor-not-allowed"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Loading PDF...
    </button>
  )
});

interface ItineraryClientProps {
  itinerary: any;
  itineraryId: string;
}

export default function ItineraryClient({ itinerary, itineraryId }: ItineraryClientProps) {
  const [showContact, setShowContact] = useState(false);
  const [bookingRequested, setBookingRequested] = useState(!!itinerary.booking_requested_at);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const handleBookingRequest = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default and stop propagation to ensure click is captured
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (submittingBooking || bookingRequested) return;

    setSubmittingBooking(true);

    try {
      const response = await fetch(`/api/itinerary/${itineraryId}/request-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setBookingRequested(true);
        setShowContact(true);
      } else {
        alert('Failed to submit booking request. Please try again or contact us directly.');
      }
    } catch (error) {
      console.error('Error submitting booking request:', error);
      alert('Failed to submit booking request. Please try again or contact us directly.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const totalPeople = itinerary.adults + itinerary.children;

  return (
    <>
      {/* Social Sharing */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Love your itinerary? Share it with friends!</h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* WhatsApp Share */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out my dream ${itinerary.destination} trip! ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share on WhatsApp
            </a>

            {/* Facebook Share */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Share on Facebook
            </a>

            {/* Twitter/X Share */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Planning my dream ${itinerary.destination} trip!`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share on X
            </a>

            {/* Copy Link */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </button>

            {/* Download PDF */}
            <PDFDownloadButton itinerary={itinerary} />
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Help your friends plan their perfect Turkey adventure!
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-center mb-8">
        <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-full mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Price Per Person</h3>
        <div className="text-5xl font-bold text-white mb-2">
          €{parseFloat(itinerary.price_per_person || 0).toFixed(2)}
        </div>
        <p className="text-green-100 text-sm mb-4">
          Based on {totalPeople} traveler{totalPeople !== 1 ? 's' : ''}
        </p>
        <p className="text-white font-semibold">
          Total Trip Price: €{parseFloat(itinerary.total_price || 0).toFixed(2)}
        </p>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={(e) => handleBookingRequest(e)}
          disabled={submittingBooking || bookingRequested}
          className={`px-12 py-5 rounded-xl font-bold text-xl shadow-xl transition-all duration-200 ${
            bookingRequested
              ? 'bg-green-600 hover:bg-green-700 text-white cursor-default'
              : submittingBooking
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
          }`}
        >
          {submittingBooking ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : bookingRequested ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Booking Request Sent!
            </span>
          ) : (
            'Book This Trip'
          )}
        </button>
        {bookingRequested && (
          <p className="mt-4 text-green-600 font-semibold">
            ✅ We've received your request and will contact you within 24 hours!
          </p>
        )}
        <p className="mt-4 text-gray-600 text-sm">
          Have questions? <button type="button" onClick={() => setShowContact(true)} className="text-blue-600 hover:underline font-semibold">Contact us</button>
        </p>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            {bookingRequested ? (
              <>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h3>
                  <p className="text-green-600 font-semibold">
                    We've received your request successfully!
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 mb-3">
                    <strong>{itinerary.customer_name}</strong>, thank you for choosing <strong>{itinerary.destination}</strong>!
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    📧 Confirmation sent to: <strong>{itinerary.customer_email}</strong>
                  </p>
                  {itinerary.customer_phone && (
                    <p className="text-sm text-gray-600">
                      📱 We'll contact you at: <strong>{itinerary.customer_phone}</strong>
                    </p>
                  )}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>What happens next?</strong>
                  </p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Our team will review your itinerary</li>
                    <li>We'll contact you within 24 hours</li>
                    <li>We'll confirm availability and finalize details</li>
                    <li>You'll receive payment and booking instructions</li>
                  </ul>
                </div>
                {itinerary.organization && (
                  <div className="text-center text-sm text-gray-600 mb-6">
                    <p>Questions? Contact us:</p>
                    <p className="font-semibold text-blue-600">
                      {itinerary.organization.email}
                    </p>
                    {itinerary.organization.phone && (
                      <p className="font-semibold text-blue-600">
                        {itinerary.organization.phone}
                      </p>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowContact(false)}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Got It!
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>Your Name:</strong> {itinerary.customer_name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> {itinerary.customer_email}
                  </p>
                  {itinerary.customer_phone && (
                    <p className="text-sm text-gray-700">
                      <strong>Phone:</strong> {itinerary.customer_phone}
                    </p>
                  )}
                </div>
                {itinerary.organization && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Contact {itinerary.organization.name}:</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      📧 {itinerary.organization.email}
                    </p>
                    {itinerary.organization.phone && (
                      <p className="text-sm text-gray-600">
                        📱 {itinerary.organization.phone}
                      </p>
                    )}
                    {itinerary.organization.website && (
                      <p className="text-sm text-gray-600">
                        🌐 <a href={itinerary.organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {itinerary.organization.website}
                        </a>
                      </p>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowContact(false)}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
