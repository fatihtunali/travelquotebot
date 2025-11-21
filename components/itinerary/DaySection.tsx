'use client';

import { ItineraryDay } from './ItineraryBuilder';
import ItemCard from './ItemCard';

interface DaySectionProps {
  day: ItineraryDay;
  dayIndex: number;
  isEditable: boolean;
  onAddItem: () => void;
  onRemoveItem: (itemIndex: number) => void;
  onUpdateLocation: (location: string) => void;
  adults: number;
  children: number;
  showPricing?: boolean;
}

export default function DaySection({
  day,
  dayIndex,
  isEditable,
  onAddItem,
  onRemoveItem,
  onUpdateLocation,
  adults,
  children,
  showPricing = true
}: DaySectionProps) {

  // Debug: Log what DaySection receives
  console.log(`DaySection ${dayIndex} render:`, {
    dayIndex,
    location: day.location,
    itemsCount: day.items.length,
    items: day.items,
    isEditable,
    showPricing
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="text-xl font-bold text-white">{day.day_number}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Day {day.day_number}
              </h3>
              <p className="text-blue-100 text-sm">
                {formatDate(day.date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isEditable ? (
              <input
                type="text"
                value={day.location}
                onChange={(e) => onUpdateLocation(e.target.value)}
                className="bg-white/20 backdrop-blur-sm text-white placeholder-blue-100 border border-white/30 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
                placeholder="Location"
              />
            ) : (
              <span className="text-white font-semibold">{day.location}</span>
            )}
          </div>
        </div>
      </div>

      {/* Day Content */}
      <div className="p-6">
        {/* Narrative Description - Always show if exists */}
        {(day as any).narrative && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-l-4 border-blue-500">
            {(day as any).title && (
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                {(day as any).title}
              </h4>
            )}
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {(day as any).narrative}
            </p>
            {(day as any).meals && (
              <div className="mt-3 inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-blue-700">
                <span>🍽️</span>
                <span>Meals: {(day as any).meals}</span>
              </div>
            )}
          </div>
        )}

        {/* Items List - ONLY show for operators (when showPricing is true) */}
        {showPricing && day.items.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Services & Pricing ({day.items.length})</span>
            </div>
            <div className="space-y-4">
              {day.items.map((item, itemIndex) => (
                <ItemCard
                  key={itemIndex}
                  item={item}
                  isEditable={isEditable}
                  onRemove={() => onRemoveItem(itemIndex)}
                  adults={adults}
                  children={children}
                  showPricing={showPricing}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state - only for operators when editing */}
        {isEditable && day.items.length === 0 && !(day as any).narrative && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm">No activities added yet</p>
          </div>
        )}

        {/* Add Item Buttons */}
        {isEditable && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onAddItem}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-blue-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Activity / Service
            </button>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              <button
                onClick={onAddItem}
                className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors border border-gray-200 flex items-center justify-center gap-1"
              >
                <span>🏨</span>
                <span>Hotel</span>
              </button>
              <button
                onClick={onAddItem}
                className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors border border-gray-200 flex items-center justify-center gap-1"
              >
                <span>🎯</span>
                <span>Tour</span>
              </button>
              <button
                onClick={onAddItem}
                className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors border border-gray-200 flex items-center justify-center gap-1"
              >
                <span>🍽️</span>
                <span>Meal</span>
              </button>
              <button
                onClick={onAddItem}
                className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors border border-gray-200 flex items-center justify-center gap-1"
              >
                <span>➕</span>
                <span>More</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
