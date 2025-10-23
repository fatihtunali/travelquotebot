'use client';

import { CityNight } from './ItineraryBuilder';

interface CityNightsSelectorProps {
  cityNights: CityNight[];
  onChange: (cityNights: CityNight[]) => void;
  isEditable: boolean;
}

const AVAILABLE_CITIES = [
  'Ankara', 'Antalya', 'Bodrum', 'Cappadocia', 'Fethiye',
  'Gaziantep', 'Istanbul', 'Izmir', 'Konya', 'Kusadasi',
  'Oludeniz', 'Pamukkale', 'Selcuk', 'Trabzon'
];

export default function CityNightsSelector({
  cityNights,
  onChange,
  isEditable
}: CityNightsSelectorProps) {

  const handleAddCity = () => {
    onChange([...cityNights, { city: '', nights: 1 }]);
  };

  const handleRemoveCity = (index: number) => {
    const updated = cityNights.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleCityChange = (index: number, city: string) => {
    const updated = [...cityNights];
    updated[index].city = city;
    onChange(updated);
  };

  const handleNightsChange = (index: number, nights: number) => {
    const updated = [...cityNights];
    updated[index].nights = Math.max(1, nights);
    onChange(updated);
  };

  const getTotalNights = () => {
    return cityNights.reduce((sum, cn) => sum + cn.nights, 0);
  };

  if (!isEditable) {
    return (
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Itinerary Route</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {cityNights.map((cn, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {cn.city} ({cn.nights}N)
              </span>
              {index < cityNights.length - 1 && (
                <span className="text-gray-400">→</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">Total: {getTotalNights()} nights</p>
      </div>
    );
  }

  return (
    <div className="col-span-full">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-semibold text-gray-700">
          Cities & Nights *
        </label>
        <span className="text-xs text-gray-500">
          Total: {getTotalNights()} night{getTotalNights() !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        {cityNights.map((cityNight, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* City Dropdown */}
            <select
              value={cityNight.city}
              onChange={(e) => handleCityChange(index, e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            >
              <option value="">Select city...</option>
              {AVAILABLE_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Nights Input */}
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="30"
                value={cityNight.nights}
                onChange={(e) => handleNightsChange(index, parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-center"
                required
              />
              <span className="text-xs text-gray-600 whitespace-nowrap">night{cityNight.nights !== 1 ? 's' : ''}</span>
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemoveCity(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove city"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            {/* Order Indicator */}
            {cityNights.length > 1 && index < cityNights.length - 1 && (
              <div className="text-gray-400 text-sm">→</div>
            )}
          </div>
        ))}

        {/* Add City Button */}
        <button
          type="button"
          onClick={handleAddCity}
          className="w-full px-3 py-1.5 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium"
        >
          + Add City
        </button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-1">
        💡 Add cities in the order you want to visit them. Days will be auto-generated based on nights per city.
      </p>
    </div>
  );
}
