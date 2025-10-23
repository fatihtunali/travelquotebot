'use client';

import { QuoteData, CityNight } from './ItineraryBuilder';
import CityNightsSelector from './CityNightsSelector';

interface ItineraryHeaderProps {
  quoteData: QuoteData;
  setQuoteData: (data: QuoteData | ((prev: QuoteData) => QuoteData)) => void;
  isEditable: boolean;
}

export default function ItineraryHeader({
  quoteData,
  setQuoteData,
  isEditable
}: ItineraryHeaderProps) {

  const handleCityNightsChange = (cityNights: CityNight[]) => {
    // Auto-generate destination string from cities
    const destination = cityNights
      .filter(cn => cn.city)
      .map(cn => cn.city)
      .join(' & ');

    // Auto-calculate end date if start date is set
    let endDate = quoteData.end_date;
    if (quoteData.start_date && cityNights.length > 0) {
      const totalNights = cityNights.reduce((sum, cn) => sum + (cn.nights || 0), 0);
      if (totalNights > 0) {
        const start = new Date(quoteData.start_date);
        const end = new Date(start);
        end.setDate(start.getDate() + totalNights);
        endDate = end.toISOString().split('T')[0];
      }
    }

    setQuoteData(prev => ({
      ...prev,
      city_nights: cityNights,
      destination: destination || '',
      end_date: endDate
    }));
  };

  const formatDateRange = () => {
    if (!quoteData.start_date || !quoteData.end_date) return '';
    const start = new Date(quoteData.start_date);
    const end = new Date(quoteData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr} • ${diffDays} Days`;
  };

  if (isEditable) {
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              {quoteData.id ? 'Edit Itinerary' : 'Create New Itinerary'}
            </h1>
            {quoteData.quote_number && (
              <p className="text-sm text-gray-500">Quote: {quoteData.quote_number}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={quoteData.customer_name}
                onChange={(e) => setQuoteData(prev => ({ ...prev, customer_name: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="John Doe"
              />
            </div>

            {/* Customer Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={quoteData.customer_email}
                onChange={(e) => setQuoteData(prev => ({ ...prev, customer_email: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="john@example.com"
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={quoteData.customer_phone || ''}
                onChange={(e) => setQuoteData(prev => ({ ...prev, customer_phone: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="+1 234 567 8900"
              />
            </div>

            {/* City & Nights Selector */}
            <CityNightsSelector
              cityNights={quoteData.city_nights || []}
              onChange={handleCityNightsChange}
              isEditable={true}
            />

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={quoteData.start_date}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  let newEndDate = quoteData.end_date;

                  // Auto-calculate end date if city_nights is set
                  if (newStartDate && quoteData.city_nights && quoteData.city_nights.length > 0) {
                    const totalNights = quoteData.city_nights.reduce((sum, cn) => sum + (cn.nights || 0), 0);
                    if (totalNights > 0) {
                      const start = new Date(newStartDate);
                      const end = new Date(start);
                      end.setDate(start.getDate() + totalNights);
                      newEndDate = end.toISOString().split('T')[0];
                    }
                  }

                  setQuoteData(prev => ({ ...prev, start_date: newStartDate, end_date: newEndDate }));
                }}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* End Date - Auto-calculated, shown as read-only */}
            {quoteData.end_date && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  End Date (Auto-calculated)
                </label>
                <input
                  type="date"
                  value={quoteData.end_date}
                  readOnly
                  className="w-full px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm cursor-not-allowed"
                />
              </div>
            )}

            {/* Adults */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Adults *
              </label>
              <input
                type="number"
                required
                min="1"
                value={quoteData.adults}
                onChange={(e) => setQuoteData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Children */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Children
              </label>
              <input
                type="number"
                min="0"
                value={quoteData.children}
                onChange={(e) => setQuoteData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View Mode - Guest sees beautiful header
  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
            {quoteData.quote_number}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {quoteData.destination}
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            {formatDateRange()}
          </p>
          <div className="flex items-center justify-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{quoteData.adults} Adult{quoteData.adults > 1 ? 's' : ''}</span>
            </div>
            {quoteData.children > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{quoteData.children} Child{quoteData.children > 1 ? 'ren' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Organization Info */}
        {quoteData.organization_name && (
          <div className="mt-8 pt-8 border-t border-white/20 text-center">
            <p className="text-sm text-blue-100 mb-2">Prepared by</p>
            <p className="text-lg font-semibold">{quoteData.organization_name}</p>
            {quoteData.organization_email && (
              <p className="text-sm text-blue-100 mt-1">{quoteData.organization_email}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
