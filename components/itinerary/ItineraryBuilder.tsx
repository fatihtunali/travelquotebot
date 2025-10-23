'use client';

import { useState, useEffect, useRef } from 'react';
import DaySection from './DaySection';
import PriceSummary from './PriceSummary';
import ItineraryHeader from './ItineraryHeader';
import AddItemModal from './AddItemModal';

export interface ItineraryItem {
  type: 'hotel' | 'tour' | 'vehicle' | 'guide' | 'entrance_fee' | 'meal' | 'extra';
  id: number;
  name: string;
  description?: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  nights?: number; // for hotels
  duration?: string; // for tours
  category?: string;
  location?: string;
  notes?: string;
  unit_type?: string; // for extras
}

export interface ItineraryDay {
  day_number: number;
  date: string;
  location: string;
  items: ItineraryItem[];
}

export interface ItineraryData {
  days: ItineraryDay[];
  pricing_summary: {
    hotels_total: number;
    tours_total: number;
    vehicles_total: number;
    guides_total: number;
    entrance_fees_total: number;
    meals_total: number;
    extras_total: number;
    subtotal: number;
    discount: number;
    total: number;
  };
}

export interface CityNight {
  city: string;
  nights: number;
}

export interface QuoteData {
  id?: number;
  quote_number?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  destination: string; // Summary string like "Istanbul & Cappadocia"
  city_nights?: CityNight[]; // Detailed breakdown of cities and nights
  start_date: string;
  end_date: string;
  adults: number;
  children: number;
  total_price: number;
  itinerary?: ItineraryData;
  status?: string;
  organization_name?: string;
  organization_email?: string;
  organization_phone?: string;
  created_by_name?: string;
}

interface ItineraryBuilderProps {
  mode: 'edit' | 'view';
  initialData?: QuoteData;
  onSave?: (data: QuoteData) => Promise<void>;
  onSend?: () => void;
  onGenerateAI?: () => void;
}

export default function ItineraryBuilder({
  mode,
  initialData,
  onSave,
  onSend,
  onGenerateAI
}: ItineraryBuilderProps) {
  const [quoteData, setQuoteData] = useState<QuoteData>(
    initialData || {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      destination: '',
      city_nights: [],
      start_date: '',
      end_date: '',
      adults: 2,
      children: 0,
      total_price: 0,
      itinerary: {
        days: [],
        pricing_summary: {
          hotels_total: 0,
          tours_total: 0,
          vehicles_total: 0,
          guides_total: 0,
          entrance_fees_total: 0,
          meals_total: 0,
          extras_total: 0,
          subtotal: 0,
          discount: 0,
          total: 0
        }
      }
    }
  );

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Track last generated date range to prevent infinite loops
  const lastDateRangeRef = useRef<string>('');

  const isEditable = mode === 'edit';

  // Calculate total days between start and end date
  const getTotalDays = () => {
    if (!quoteData.start_date || !quoteData.end_date) return 0;
    const start = new Date(quoteData.start_date);
    const end = new Date(quoteData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Initialize days based on city_nights and date range
  useEffect(() => {
    // Only run in edit mode
    if (!isEditable) return;

    // Check if start date and city_nights are set
    if (!quoteData.start_date || !quoteData.city_nights || quoteData.city_nights.length === 0) return;

    // Create a unique key for this configuration
    const cityNightsKey = quoteData.city_nights.map(cn => `${cn.city}:${cn.nights}`).join('|');
    const configKey = `${quoteData.start_date}|${cityNightsKey}`;

    // Skip if we already generated days for this configuration
    if (lastDateRangeRef.current === configKey) return;

    // Only generate days if itinerary doesn't exist or has no days
    if (quoteData.itinerary && quoteData.itinerary.days.length > 0) {
      // Update the ref even if we don't regenerate (user manually created days)
      lastDateRangeRef.current = configKey;
      return;
    }

    // Generate days based on city_nights
    const totalNights = quoteData.city_nights.reduce((sum, cn) => sum + (cn.nights || 0), 0);
    if (totalNights <= 0 || totalNights > 365) return; // Sanity check

    // Total days = total nights + 1 (final departure day)
    const totalDays = totalNights + 1;

    const days: ItineraryDay[] = [];
    let dayIndex = 0;

    // For each city in the itinerary
    for (let cityIndex = 0; cityIndex < quoteData.city_nights.length; cityIndex++) {
      const cityNight = quoteData.city_nights[cityIndex];
      if (!cityNight.city || !cityNight.nights) continue;

      // For the last city, include the checkout day
      const isLastCity = cityIndex === quoteData.city_nights.length - 1;
      const daysInCity = isLastCity ? cityNight.nights + 1 : cityNight.nights;

      for (let i = 0; i < daysInCity; i++) {
        const date = new Date(quoteData.start_date);
        date.setDate(date.getDate() + dayIndex);

        days.push({
          day_number: dayIndex + 1,
          date: date.toISOString().split('T')[0],
          location: cityNight.city, // Assign specific city to each day
          items: []
        });

        dayIndex++;
      }
    }

    // Update the ref before setting state to prevent race conditions
    lastDateRangeRef.current = configKey;

    // Use setTimeout to prevent blocking the UI
    setTimeout(() => {
      setQuoteData(prev => ({
        ...prev,
        itinerary: {
          days,
          pricing_summary: prev.itinerary?.pricing_summary || {
            hotels_total: 0,
            tours_total: 0,
            vehicles_total: 0,
            guides_total: 0,
            entrance_fees_total: 0,
            meals_total: 0,
            extras_total: 0,
            subtotal: 0,
            discount: 0,
            total: 0
          }
        }
      }));
    }, 0);
  }, [quoteData.start_date, quoteData.city_nights, isEditable]);

  // Recalculate pricing summary whenever items change
  useEffect(() => {
    if (!quoteData.itinerary) return;

    let hotels_total = 0;
    let tours_total = 0;
    let vehicles_total = 0;
    let guides_total = 0;
    let entrance_fees_total = 0;
    let meals_total = 0;
    let extras_total = 0;

    quoteData.itinerary.days.forEach(day => {
      day.items.forEach(item => {
        switch (item.type) {
          case 'hotel':
            hotels_total += item.total_price;
            break;
          case 'tour':
            tours_total += item.total_price;
            break;
          case 'vehicle':
            vehicles_total += item.total_price;
            break;
          case 'guide':
            guides_total += item.total_price;
            break;
          case 'entrance_fee':
            entrance_fees_total += item.total_price;
            break;
          case 'meal':
            meals_total += item.total_price;
            break;
          case 'extra':
            extras_total += item.total_price;
            break;
        }
      });
    });

    const subtotal = hotels_total + tours_total + vehicles_total +
                     guides_total + entrance_fees_total + meals_total + extras_total;
    const discount = quoteData.itinerary.pricing_summary.discount || 0;
    const total = subtotal - discount;

    setQuoteData(prev => ({
      ...prev,
      total_price: total,
      itinerary: {
        ...prev.itinerary!,
        pricing_summary: {
          hotels_total,
          tours_total,
          vehicles_total,
          guides_total,
          entrance_fees_total,
          meals_total,
          extras_total,
          subtotal,
          discount,
          total
        }
      }
    }));
  }, [quoteData.itinerary?.days]);

  const handleAddItem = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setShowAddItemModal(true);
  };

  const handleItemSelected = (item: any, quantity: number, notes?: string) => {
    if (selectedDayIndex === null || !quoteData.itinerary) return;

    // Extract price and ensure it's a valid number
    const rawPrice = item.price_per_night || item.price_per_person ||
                     item.price_per_day || item.price_per_unit || 0;
    const pricePerUnit = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || 0));
    const validPrice = isNaN(pricePerUnit) ? 0 : pricePerUnit;

    // Calculate total price based on item type
    let totalPrice = validPrice * quantity;

    // For hotels only, multiply by number of people (quantity = nights, need to × people)
    const totalPeople = quoteData.adults + quoteData.children;
    if (item.item_type === 'hotel') {
      totalPrice = validPrice * quantity * totalPeople;
    }
    // For tours/entrance_fees/meals: quantity already includes number of people, so just price × quantity
    // For vehicles and guides: fixed price per day, so just price × quantity
    // For extras: depends on unit_type but default to price × quantity

    const newItem: ItineraryItem = {
      type: item.item_type,
      id: item.id,
      name: item.name,
      description: item.description,
      quantity,
      price_per_unit: validPrice,
      total_price: totalPrice,
      category: item.category,
      location: item.location,
      duration: item.duration,
      unit_type: item.unit_type,
      notes
    };

    // If hotel, set nights based on quantity
    if (newItem.type === 'hotel') {
      newItem.nights = quantity;
    }

    const updatedDays = [...quoteData.itinerary.days];

    // Add item to the selected day
    updatedDays[selectedDayIndex].items.push(newItem);

    // If it's a hotel, auto-add to all other days in the same city (except final departure day)
    if (newItem.type === 'hotel') {
      const currentCity = updatedDays[selectedDayIndex].location;
      const finalDayIndex = updatedDays.length - 1; // Last day of entire trip

      // Add hotel to all days in this city except the final departure day
      updatedDays.forEach((day, index) => {
        if (index !== selectedDayIndex &&
            day.location === currentCity &&
            index !== finalDayIndex) { // Don't add to final departure day

          // Check if this hotel is not already added to this day
          const hasThisHotel = day.items.some(
            item => item.type === 'hotel' && item.id === newItem.id
          );

          if (!hasThisHotel) {
            // Add the same hotel to this day
            day.items.push({ ...newItem });
          }
        }
      });
    }

    setQuoteData(prev => ({
      ...prev,
      itinerary: {
        ...prev.itinerary!,
        days: updatedDays
      }
    }));

    setShowAddItemModal(false);
    setSelectedDayIndex(null);
  };

  const handleRemoveItem = (dayIndex: number, itemIndex: number) => {
    if (!quoteData.itinerary) return;

    const updatedDays = [...quoteData.itinerary.days];
    const removedItem = updatedDays[dayIndex].items[itemIndex];

    // Remove from current day
    updatedDays[dayIndex].items.splice(itemIndex, 1);

    // If it's a hotel, remove from all other days in the same city (except final departure day)
    if (removedItem.type === 'hotel') {
      const currentCity = updatedDays[dayIndex].location;
      const finalDayIndex = updatedDays.length - 1; // Last day of entire trip

      updatedDays.forEach((day, index) => {
        if (index !== dayIndex &&
            day.location === currentCity &&
            index !== finalDayIndex) { // Don't touch final departure day
          // Remove this hotel from this day
          day.items = day.items.filter(
            item => !(item.type === 'hotel' && item.id === removedItem.id)
          );
        }
      });
    }

    setQuoteData(prev => ({
      ...prev,
      itinerary: {
        ...prev.itinerary!,
        days: updatedDays
      }
    }));
  };

  const handleUpdateDayLocation = (dayIndex: number, location: string) => {
    if (!quoteData.itinerary) return;

    const updatedDays = [...quoteData.itinerary.days];
    updatedDays[dayIndex].location = location;

    setQuoteData(prev => ({
      ...prev,
      itinerary: {
        ...prev.itinerary!,
        days: updatedDays
      }
    }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(quoteData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <ItineraryHeader
        quoteData={quoteData}
        setQuoteData={setQuoteData}
        isEditable={isEditable}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Days Section */}
        {quoteData.itinerary && quoteData.itinerary.days.length > 0 ? (
          <div className="space-y-6 mb-8">
            {quoteData.itinerary.days.map((day, index) => (
              <DaySection
                key={index}
                day={day}
                dayIndex={index}
                isEditable={isEditable}
                onAddItem={() => handleAddItem(index)}
                onRemoveItem={(itemIndex) => handleRemoveItem(index, itemIndex)}
                onUpdateLocation={(location) => handleUpdateDayLocation(index, location)}
                adults={quoteData.adults}
                children={quoteData.children}
                showPricing={isEditable}
              />
            ))}
          </div>
        ) : (
          isEditable && (
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Set Travel Dates First</h3>
                <p className="text-gray-600">Please fill in the customer information and travel dates above to start building the itinerary.</p>
              </div>
            </div>
          )
        )}

        {/* Inclusions & Exclusions */}
        {quoteData.itinerary && quoteData.itinerary.days.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Inclusions */}
            <div className="bg-green-50 rounded-2xl shadow-lg border border-green-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Inclusions
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{quoteData.itinerary.days.filter((d: any) => d.items.some((i: any) => i.type === 'hotel')).length} nights accommodation in mentioned hotels</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Meals as per itinerary (B=Breakfast, L=Lunch, D=Dinner)</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Return airport transfers on private basis</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Professional English-speaking guidance on tour days</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Sightseeing as per itinerary with entrance fees for mentioned places</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Local taxes</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Exclusions */}
            <div className="bg-red-50 rounded-2xl shadow-lg border border-red-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Exclusions
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>International and domestic flights</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Personal expenses</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Drinks at meals</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Tips and porterage at hotels</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Tips to the driver and guide</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Price Summary */}
        {quoteData.itinerary && quoteData.itinerary.days.length > 0 && (
          <PriceSummary
            pricingSummary={quoteData.itinerary.pricing_summary}
            isEditable={isEditable}
            adults={quoteData.adults}
            children={quoteData.children}
            showBreakdown={isEditable}
            onUpdateDiscount={(discount) => {
              setQuoteData(prev => ({
                ...prev,
                itinerary: {
                  ...prev.itinerary!,
                  pricing_summary: {
                    ...prev.itinerary!.pricing_summary,
                    discount
                  }
                }
              }));
            }}
          />
        )}

        {/* Action Buttons */}
        {isEditable && onSave && (
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Itinerary'}
            </button>
            {onGenerateAI && quoteData.id && quoteData.itinerary && quoteData.itinerary.days.length > 0 && (
              <button
                onClick={onGenerateAI}
                disabled={saving}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Generate AI Itinerary
              </button>
            )}
            {onSend && quoteData.id && (
              <button
                onClick={onSend}
                disabled={saving}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send to Customer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && selectedDayIndex !== null && quoteData.itinerary && (() => {
        const currentDay = quoteData.itinerary.days[selectedDayIndex];
        const previousDay = selectedDayIndex > 0 ? quoteData.itinerary.days[selectedDayIndex - 1] : null;

        // Detect travel day: if previous day exists and has different city
        let destination = currentDay?.location || quoteData.destination;
        if (previousDay && previousDay.location && currentDay.location !== previousDay.location) {
          // Travel day: show both cities (from previous city to current city)
          destination = `${previousDay.location} → ${currentDay.location}`;
        }

        return (
          <AddItemModal
            onClose={() => {
              setShowAddItemModal(false);
              setSelectedDayIndex(null);
            }}
            onSelect={handleItemSelected}
            adults={quoteData.adults}
            children={quoteData.children}
            destination={destination}
          />
        );
      })()}
    </div>
  );
}
