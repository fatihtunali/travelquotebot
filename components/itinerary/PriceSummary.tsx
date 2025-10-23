'use client';

import { useState } from 'react';

interface PricingSummary {
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
}

interface PriceSummaryProps {
  pricingSummary: PricingSummary;
  isEditable: boolean;
  onUpdateDiscount?: (discount: number) => void;
  adults?: number;
  children?: number;
  showBreakdown?: boolean;
}

export default function PriceSummary({
  pricingSummary,
  isEditable,
  onUpdateDiscount,
  adults = 1,
  children = 0,
  showBreakdown: allowBreakdown = true
}: PriceSummaryProps) {

  const [showBreakdown, setShowBreakdown] = useState(allowBreakdown);

  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`;
  };

  const totalPeople = adults + children;
  const pricePerPerson = totalPeople > 0 ? pricingSummary.total / totalPeople : 0;

  const categories = [
    { label: '🏨 Hotels', amount: pricingSummary.hotels_total, color: 'text-purple-600' },
    { label: '🎯 Tours & Activities', amount: pricingSummary.tours_total, color: 'text-blue-600' },
    { label: '🚗 Transportation', amount: pricingSummary.vehicles_total, color: 'text-green-600' },
    { label: '👨‍🏫 Guide Services', amount: pricingSummary.guides_total, color: 'text-orange-600' },
    { label: '🎫 Entrance Fees', amount: pricingSummary.entrance_fees_total, color: 'text-pink-600' },
    { label: '🍽️ Meals', amount: pricingSummary.meals_total, color: 'text-yellow-600' },
    { label: '✨ Extra Services', amount: pricingSummary.extras_total, color: 'text-indigo-600' }
  ];

  // For guests - show ONLY per-person price, nothing else
  if (!allowBreakdown) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-full mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Price Per Person</h3>
        <div className="text-5xl font-bold text-white mb-2">
          {formatPrice(pricePerPerson)}
        </div>
        <p className="text-green-100 text-sm">
          Based on {totalPeople} traveler{totalPeople !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  // For operators - show full breakdown
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div
        className={`bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 ${allowBreakdown ? 'cursor-pointer' : ''}`}
        onClick={allowBreakdown ? () => setShowBreakdown(!showBreakdown) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Total Price</h3>
              {allowBreakdown && (
                <p className="text-xs text-green-100">Click to {showBreakdown ? 'hide' : 'show'} breakdown</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {formatPrice(pricingSummary.total)}
            </div>
            <div className="text-sm text-green-100">
              {formatPrice(pricePerPerson)} per person
            </div>
            {pricingSummary.discount > 0 && (
              <div className="text-xs text-green-100 line-through mt-1">
                {formatPrice(pricingSummary.subtotal)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="p-3">
          <div className="space-y-1.5 mb-2">
            {categories.map((cat, index) => (
              cat.amount > 0 && (
                <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                  <span className={`text-sm font-medium ${cat.color}`}>
                    {cat.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(cat.amount)}
                  </span>
                </div>
              )
            ))}
          </div>

          {/* Subtotal */}
          <div className="flex items-center justify-between py-3 border-t-2 border-gray-200">
            <span className="text-base font-semibold text-gray-700">Subtotal</span>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(pricingSummary.subtotal)}
            </span>
          </div>

          {/* Discount */}
          <div className="flex items-center justify-between py-2">
            <span className="text-base font-semibold text-gray-700">Discount</span>
            {isEditable && onUpdateDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">€</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingSummary.discount}
                  onChange={(e) => onUpdateDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 bg-white text-gray-900 border border-gray-300 rounded text-right text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ) : (
              pricingSummary.discount > 0 ? (
                <span className="text-lg font-bold text-red-600">
                  -{formatPrice(pricingSummary.discount)}
                </span>
              ) : (
                <span className="text-sm text-gray-500">No discount</span>
              )
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-4 border-t-2 border-gray-300 mt-2">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(pricingSummary.total)}
            </span>
          </div>

          {/* Info Text */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All prices include taxes and fees. Final price may vary based on seasonal rates and availability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
