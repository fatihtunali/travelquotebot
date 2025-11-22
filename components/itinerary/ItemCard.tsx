'use client';

import { ItineraryItem } from './ItineraryBuilder';

interface ItemCardProps {
  item: ItineraryItem;
  isEditable: boolean;
  onRemove: () => void;
  adults: number;
  children: number;
  showPricing?: boolean;
}

export default function ItemCard({
  item,
  isEditable,
  onRemove,
  adults,
  children,
  showPricing = true
}: ItemCardProps) {

  const getItemIcon = () => {
    switch (item.type) {
      case 'hotel':
        return '🏨';
      case 'tour':
        return '🎯';
      case 'vehicle':
        return '🚗';
      case 'guide':
        return '👨‍🏫';
      case 'entrance_fee':
        return '🎫';
      case 'meal':
        return '🍽️';
      case 'extra':
        return '✨';
      default:
        return '📋';
    }
  };

  const getItemTypeLabel = () => {
    switch (item.type) {
      case 'hotel':
        return 'Accommodation';
      case 'tour':
        return 'Tour & Activity';
      case 'vehicle':
        return 'Transportation';
      case 'guide':
        return 'Guide Service';
      case 'entrance_fee':
        return 'Entrance Fee';
      case 'meal':
        return 'Meal';
      case 'extra':
        return 'Extra Service';
      default:
        return item.type;
    }
  };

  const getItemColor = () => {
    switch (item.type) {
      case 'hotel':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'tour':
        return 'bg-teal-50 border-teal-200 text-teal-700';
      case 'vehicle':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'guide':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'entrance_fee':
        return 'bg-pink-50 border-pink-200 text-pink-700';
      case 'meal':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'extra':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const formatPrice = (price: number | undefined | null) => {
    const validPrice = typeof price === 'number' ? price : parseFloat(String(price || 0));
    return `€${(isNaN(validPrice) ? 0 : validPrice).toFixed(2)}`;
  };

  const getQuantityLabel = () => {
    if (item.type === 'hotel') {
      return `${item.nights || item.quantity} night${(item.nights || item.quantity) > 1 ? 's' : ''}`;
    } else if (item.type === 'tour' || item.type === 'entrance_fee' || item.type === 'meal') {
      return `${item.quantity} person${item.quantity > 1 ? 's' : ''}`;
    } else if (item.type === 'vehicle' || item.type === 'guide') {
      return `${item.quantity} day${item.quantity > 1 ? 's' : ''}`;
    } else if (item.type === 'extra' && item.unit_type) {
      return `${item.quantity} ${item.unit_type}${item.quantity > 1 ? 's' : ''}`;
    }
    return `Qty: ${item.quantity}`;
  };

  return (
    <div className={`relative border-2 rounded-xl p-4 transition-all duration-200 ${
      isEditable ? 'hover:shadow-md' : ''
    } ${getItemColor()}`}>
      {/* Remove Button - Edit Mode Only */}
      {isEditable && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
          title="Remove item"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 text-4xl">
          {getItemIcon()}
        </div>

        {/* Content */}
        <div className="flex-grow">
          {/* Type Badge */}
          <span className="inline-block px-2 py-0.5 bg-white/50 rounded text-xs font-semibold mb-2">
            {getItemTypeLabel()}
          </span>

          {/* Name */}
          <h4 className="text-lg font-bold mb-1">
            {item.name}
          </h4>

          {/* Category/Location */}
          {(item.category || item.location) && (
            <p className="text-sm opacity-80 mb-2">
              {item.category && <span>{item.category}</span>}
              {item.category && item.location && <span> • </span>}
              {item.location && <span>{item.location}</span>}
            </p>
          )}

          {/* Duration */}
          {item.duration && (
            <p className="text-sm opacity-80 mb-2">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Duration: {item.duration}
            </p>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-sm opacity-75 mb-3 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Notes */}
          {item.notes && (
            <div className="bg-white/50 rounded-lg p-2 mb-3">
              <p className="text-xs font-semibold mb-1">Notes:</p>
              <p className="text-sm opacity-75">{item.notes}</p>
            </div>
          )}

          {/* Pricing Details - Only show for operators */}
          {showPricing && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/10">
              <div className="text-sm">
                <span className="opacity-75">{formatPrice(item.price_per_unit)} × {getQuantityLabel()}</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">
                  {formatPrice(item.total_price)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
