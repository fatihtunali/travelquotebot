'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ItineraryBuilder, { QuoteData } from '@/components/itinerary/ItineraryBuilder';

export default function CreateQuotePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (quoteData: QuoteData) => {
    setSaving(true);
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    try {
      // First, create the quote
      const createResponse = await fetch(`/api/quotes/${parsedUser.organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_name: quoteData.customer_name,
          customer_email: quoteData.customer_email,
          customer_phone: quoteData.customer_phone,
          destination: quoteData.destination,
          start_date: quoteData.start_date,
          end_date: quoteData.end_date,
          adults: quoteData.adults,
          children: quoteData.children,
          total_price: quoteData.total_price
        })
      });

      if (!createResponse.ok) {
        alert('Failed to create quote');
        return;
      }

      const createData = await createResponse.json();
      const quoteId = createData.quoteId;

      // Then, update with itinerary
      const updateResponse = await fetch(`/api/quotes/${parsedUser.organizationId}/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itinerary: quoteData.itinerary
        })
      });

      if (!updateResponse.ok) {
        alert('Quote created but failed to save itinerary');
        return;
      }

      alert(`Quote ${createData.quoteNumber} created successfully!`);
      router.push('/dashboard/requests');

    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Failed to create quote');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <ItineraryBuilder
        mode="edit"
        onSave={handleSave}
      />
    </div>
  );
}
