'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AddItemModalProps {
  onClose: () => void;
  onSelect: (item: any, quantity: number, notes?: string) => void;
  adults: number;
  children: number;
  destination?: string; // Filter items by city/destination
}

export default function AddItemModal({
  onClose,
  onSelect,
  adults,
  children,
  destination
}: AddItemModalProps) {

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any>({
    hotels: [],
    tours: [],
    vehicles: [],
    guides: [],
    entrance_fees: [],
    meals: [],
    extras: []
  });
  const [activeCategory, setActiveCategory] = useState<string>('hotels');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const categories = [
    { id: 'hotels', label: '🏨 Hotels', color: 'purple' },
    { id: 'tours', label: '🎯 Tours', color: 'blue' },
    { id: 'vehicles', label: '🚗 Vehicles', color: 'green' },
    { id: 'guides', label: '👨‍🏫 Guides', color: 'orange' },
    { id: 'entrance_fees', label: '🎫 Tickets', color: 'pink' },
    { id: 'meals', label: '🍽️ Meals', color: 'yellow' },
    { id: 'extras', label: '✨ Extras', color: 'indigo' }
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    try {
      console.log('Fetching items for org:', parsedUser.organizationId);
      const response = await fetch(
        `/api/pricing/items/${parsedUser.organizationId}?season=Winter 2025-26`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();
      console.log('API response:', response.status, data);

      if (response.ok) {
        setItems({
          hotels: data.hotels || [],
          tours: data.tours || [],
          vehicles: data.vehicles || [],
          guides: data.guides || [],
          entrance_fees: data.entrance_fees || [],
          meals: data.meals || [],
          extras: data.extras || []
        });
        console.log('Items loaded:', {
          hotels: data.hotels?.length || 0,
          tours: data.tours?.length || 0,
          vehicles: data.vehicles?.length || 0
        });
      } else {
        console.error('API error:', data.error || 'Unknown error');
        alert(`Failed to load items: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Failed to load pricing items. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    let categoryItems = items[activeCategory] || [];

    // Filter vehicles by capacity (show only appropriate vehicle sizes)
    if (activeCategory === 'vehicles') {
      const totalPeople = adults + children;
      categoryItems = categoryItems.filter((item: any) => {
        // If capacity is specified, filter by reasonable size
        if (item.capacity) {
          // Vehicle must accommodate all people
          if (item.capacity < totalPeople) return false;

          // Don't show oversized vehicles - max 2x the group size (or minimum 6)
          const maxReasonableCapacity = Math.max(totalPeople * 2, 6);
          return item.capacity <= maxReasonableCapacity;
        }
        return true; // Show vehicles without specified capacity
      });
    }

    // Filter by destination/city if provided
    if (destination) {
      const destinationLower = destination.toLowerCase();
      categoryItems = categoryItems.filter((item: any) => {
        // Check if item location matches destination
        if (!item.location) return false;
        const itemLocation = item.location.toLowerCase();

        // For vehicles (transfers), show from multiple cities on travel days
        // Check if destination has multiple cities (contains arrow or "to")
        if (activeCategory === 'vehicles' && destination.includes('→')) {
          // Travel day: show vehicles from both cities
          // Simply check if item location is mentioned anywhere in destination string
          return destinationLower.includes(itemLocation);
        }

        // Allow partial matches (e.g., "Istanbul" matches "Istanbul" or items from Istanbul)
        return itemLocation.includes(destinationLower) || destinationLower.includes(itemLocation);
      });
    }

    // Apply search filter
    if (!searchQuery) return categoryItems;

    return categoryItems.filter((item: any) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    // Set default quantity based on item type
    if (item.item_type === 'hotel') {
      setQuantity(1); // nights
    } else if (item.item_type === 'tour' || item.item_type === 'entrance_fee' || item.item_type === 'meal') {
      setQuantity(adults + children); // persons
    } else {
      setQuantity(1); // days or units
    }
  };

  const handleConfirmSelection = () => {
    if (!selectedItem) return;
    onSelect(selectedItem, quantity, notes);
  };

  const getItemPrice = (item: any) => {
    const price = item.price_per_night || item.price_per_person ||
                  item.price_per_day || item.price_per_unit;
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const parsed = parseFloat(price);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getItemPriceLabel = (item: any) => {
    if (item.price_per_night) return '/night';
    if (item.price_per_person) return '/person';
    if (item.price_per_day) return '/day';
    if (item.price_per_unit) return `/${item.unit_type || 'unit'}`;
    return '';
  };

  const getQuantityLabel = () => {
    if (!selectedItem) return 'Quantity';
    if (selectedItem.item_type === 'hotel') return 'Nights';
    if (selectedItem.item_type === 'tour' || selectedItem.item_type === 'entrance_fee' || selectedItem.item_type === 'meal') {
      return 'Persons';
    }
    if (selectedItem.item_type === 'vehicle' || selectedItem.item_type === 'guide') {
      return 'Days';
    }
    return selectedItem.unit_type || 'Quantity';
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900">Add Item to Itinerary</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, location, or description..."
              className="w-full px-4 py-3 pl-12 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? `bg-${cat.color}-100 text-${cat.color}-700 ring-2 ring-${cat.color}-500`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label} ({items[cat.id]?.length || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-hidden flex min-h-0">
          {/* Items List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading items...</p>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 text-lg mb-2">No items found</p>
                <p className="text-gray-400 text-sm">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item: any, index: number) => (
                  <button
                    key={`${item.item_type}_${item.id}_${index}`}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedItem?.id === item.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          €{getItemPrice(item).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getItemPriceLabel(item)}
                        </div>
                      </div>
                    </div>
                    {(item.category || item.type || item.location) && (
                      <div className="flex gap-2 mb-2">
                        {item.category && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {item.category}
                          </span>
                        )}
                        {item.type && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {item.type}
                          </span>
                        )}
                        {item.location && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                            📍 {item.location}
                          </span>
                        )}
                      </div>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    )}
                    {item.duration && (
                      <p className="text-xs text-gray-500 mt-1">⏱️ {item.duration}</p>
                    )}
                    {item.capacity && (
                      <p className="text-xs text-gray-500 mt-1">👥 Capacity: {item.capacity}</p>
                    )}
                    {item.languages && (
                      <p className="text-xs text-gray-500 mt-1">🗣️ {item.languages}</p>
                    )}
                    {item.specialization && (
                      <p className="text-xs text-gray-500 mt-1">⭐ {item.specialization}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selection Panel */}
          <div className="w-1/2 p-4 bg-gray-50 overflow-y-auto">
            {selectedItem ? (
              <div className="h-full flex flex-col">
                <div className="flex-grow overflow-y-auto">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Selected Item</h3>

                  <div className="bg-white rounded-xl p-4 mb-4 border-2 border-blue-500">
                    <h4 className="font-semibold text-lg mb-2">{selectedItem.name}</h4>
                    {selectedItem.description && (
                      <p className="text-sm text-gray-600 mb-3">{selectedItem.description}</p>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-gray-700">Price</span>
                      <span className="text-xl font-bold text-blue-600">
                        €{getItemPrice(selectedItem).toFixed(2)}{getItemPriceLabel(selectedItem)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {getQuantityLabel()}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                    />
                    {(selectedItem.item_type === 'tour' || selectedItem.item_type === 'entrance_fee' || selectedItem.item_type === 'meal') && (
                      <p className="text-xs text-gray-500 mt-1">
                        Suggestion: {adults + children} person{adults + children > 1 ? 's' : ''} ({adults} adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} child${children > 1 ? 'ren' : ''}` : ''})
                      </p>
                    )}
                  </div>

                  {/* Notes Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="E.g., Sea view room, Vegetarian meal, etc."
                    />
                  </div>

                  {/* Total Price */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Quantity</span>
                      <span className="font-semibold">{quantity} {getQuantityLabel().toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-green-200">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-green-600">
                        €{(getItemPrice(selectedItem) * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel Selection
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    Add to Day
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Select an Item</h3>
                  <p className="text-gray-500 text-sm">
                    Choose an item from the list to add it to the itinerary
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
