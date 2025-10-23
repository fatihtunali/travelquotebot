'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ItineraryBuilder, { QuoteData } from '@/components/itinerary/ItineraryBuilder';

export default function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setQuoteId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

  const fetchQuote = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    try {
      const response = await fetch(
        `/api/quotes/${parsedUser.organizationId}/${quoteId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQuoteData(data.quote);
      } else {
        alert('Failed to load quote');
        router.push('/dashboard/requests');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      alert('Failed to load quote');
      router.push('/dashboard/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedQuoteData: QuoteData) => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    try {
      const response = await fetch(`/api/quotes/${parsedUser.organizationId}/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_name: updatedQuoteData.customer_name,
          customer_email: updatedQuoteData.customer_email,
          customer_phone: updatedQuoteData.customer_phone,
          destination: updatedQuoteData.destination,
          start_date: updatedQuoteData.start_date,
          end_date: updatedQuoteData.end_date,
          adults: updatedQuoteData.adults,
          children: updatedQuoteData.children,
          total_price: updatedQuoteData.total_price,
          itinerary: updatedQuoteData.itinerary
        })
      });

      if (!response.ok) {
        alert('Failed to update quote');
        return;
      }

      alert('Quote updated successfully!');
      // Refresh the data
      fetchQuote();

    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Failed to update quote');
    }
  };

  const handleGenerateAI = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    if (!confirm('Generate AI-powered itinerary description? This will use Claude AI to create a guest-friendly description.')) {
      return;
    }

    try {
      const response = await fetch(`/api/quotes/${parsedUser.organizationId}/${quoteId}/generate-itinerary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert('AI itinerary generated successfully!');
        // Refresh to show the new description
        fetchQuote();
      } else {
        const error = await response.json();
        alert(`Failed to generate itinerary: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating AI itinerary:', error);
      alert('Failed to generate AI itinerary');
    }
  };

  const handleSend = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    if (!confirm('Send this quote to the customer?')) {
      return;
    }

    try {
      const response = await fetch(`/api/requests/${parsedUser.organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quoteId: quoteId,
          action: 'mark_sent'
        })
      });

      if (response.ok) {
        alert('Quote sent to customer successfully!');
        router.push('/dashboard/requests');
      } else {
        alert('Failed to send quote');
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      alert('Failed to send quote');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quote Not Found</h2>
          <button
            onClick={() => router.push('/dashboard/requests')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ItineraryBuilder
        mode="edit"
        initialData={quoteData}
        onSave={handleSave}
        onSend={handleSend}
        onGenerateAI={handleGenerateAI}
      />
    </div>
  );
}
