'use client';

import { useRouter } from 'next/navigation';
import ItineraryBuilder, { QuoteData } from '@/components/itinerary/ItineraryBuilder';

export default function CreateQuotePage() {
  const router = useRouter();

  const handleSave = async (data: QuoteData) => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    try {
      // Create the quote
      const createResponse = await fetch(`/api/quotes/${parsedUser.organizationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          destination: data.destination,
          start_date: data.start_date,
          end_date: data.end_date,
          adults: data.adults,
          children: data.children,
          total_price: data.total_price,
          agent_id: data.agent_id || null,
          client_id: data.client_id || null
        })
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        alert(error.error || 'Failed to create quote');
        return;
      }

      const createData = await createResponse.json();
      const quoteId = createData.quoteId;

      // Update with itinerary
      const updateResponse = await fetch(`/api/quotes/${parsedUser.organizationId}/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itinerary: data.itinerary
        })
      });

      if (!updateResponse.ok) {
        alert('Quote created but failed to save itinerary');
        return;
      }

      alert(`Quote ${createData.quoteNumber} created successfully!`);
      router.push(`/dashboard/quotes/${quoteId}`);

    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Failed to create quote');
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
