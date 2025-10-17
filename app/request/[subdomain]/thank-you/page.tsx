'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

interface Operator {
  id: string;
  companyName: string;
  subdomain: string;
  logoUrl: string | null;
  brandColors: {
    primary: string;
    secondary: string;
  };
}

export default function ThankYouPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  const requestId = searchParams.get('id');

  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperator = async () => {
      try {
        const response = await fetch(`/api/public/operator/${subdomain}`);

        if (response.ok) {
          const data = await response.json();
          setOperator(data.operator);
        }
      } catch (err) {
        console.error('Error loading operator:', err);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchOperator();
    }
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const primaryColor = operator?.brandColors.primary || '#3b82f6';
  const secondaryColor = operator?.brandColors.secondary || '#8b5cf6';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      {operator && (
        <header className="glass-effect sticky top-0 z-50 shadow-lg">
          <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 justify-center">
              {operator.logoUrl ? (
                <img
                  src={operator.logoUrl}
                  alt={operator.companyName}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  ✈️
                </div>
              )}
              <h1
                className="text-3xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                {operator.companyName}
              </h1>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bubble-card p-12 text-center bg-gradient-to-br from-white to-green-50">
          {/* Success Icon */}
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            ✅
          </div>

          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Thank You!
          </h2>

          <p className="text-xl text-gray-600 mb-8">
            Your itinerary request has been submitted successfully.
          </p>

          <div className="bg-white p-6 rounded-2xl border-2 border-green-300 mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-2">Request ID</p>
            <code className="text-lg font-mono text-blue-600 font-bold">
              {requestId || 'N/A'}
            </code>
          </div>

          <div className="text-left max-w-lg mx-auto space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">What's Next?</h3>
                <p className="text-gray-600 text-sm">
                  Our travel experts will review your request and create a personalized itinerary tailored to your preferences.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Check Your Email</h3>
                <p className="text-gray-600 text-sm">
                  You'll receive a confirmation email shortly, followed by your custom itinerary within 24-48 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Need Changes?</h3>
                <p className="text-gray-600 text-sm">
                  Once you receive your itinerary, you can request modifications to ensure it's perfect for your trip.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-gray-200">
            <p className="text-gray-600 text-sm">
              Questions? Contact us at{' '}
              <a
                href={`mailto:info@${operator?.companyName.toLowerCase().replace(/\s+/g, '')}.com`}
                className="font-semibold"
                style={{ color: primaryColor }}
              >
                info@{operator?.companyName.toLowerCase().replace(/\s+/g, '')}.com
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-600 text-sm">
        <p>Powered by {operator?.companyName}</p>
      </footer>
    </div>
  );
}
