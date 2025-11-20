'use client';

import { useState, useEffect } from 'react';
import { CityNight } from './ItineraryBuilder';

interface Country {
  id: number;
  country_code: string;
  country_name: string;
  flag_emoji: string;
}

interface City {
  city: string;
  country_name: string;
}

interface CityNightsSelectorProps {
  cityNights: CityNight[];
  onChange: (cityNights: CityNight[]) => void;
  isEditable: boolean;
}

export default function CityNightsSelector({
  cityNights,
  onChange,
  isEditable
}: CityNightsSelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        const data = await response.json();
        setCountries(data.countries || []);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities when countries change
  useEffect(() => {
    if (selectedCountries.length > 0) {
      fetchCities(selectedCountries.map(c => c.id));
    } else {
      setCities([]);
    }
  }, [selectedCountries]);

  const fetchCities = async (countryIds: number[]) => {
    setLoadingCities(true);
    try {
      const response = await fetch(`/api/cities?country_ids=${countryIds.join(',')}`);
      const data = await response.json();
      setCities(data.citiesWithInfo || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCountryToggle = (country: Country) => {
    if (selectedCountries.some(c => c.id === country.id)) {
      setSelectedCountries(selectedCountries.filter(c => c.id !== country.id));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const handleAddCity = () => {
    onChange([...cityNights, { city: '', nights: 2 }]);
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
      {/* Country Selection */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Select Countries *
        </label>
        {loadingCountries ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {countries.map(country => (
              <button
                key={country.id}
                type="button"
                onClick={() => handleCountryToggle(country)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCountries.some(c => c.id === country.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {country.flag_emoji} {country.country_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cities & Nights */}
      {selectedCountries.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700">
              Cities & Nights *
            </label>
            <span className="text-xs text-gray-500">
              Total: {getTotalNights()} night{getTotalNights() !== 1 ? 's' : ''} ({getTotalNights() + 1} days)
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
                  {loadingCities ? (
                    <option disabled>Loading cities...</option>
                  ) : (
                    cities.map(city => (
                      <option key={city.city} value={city.city}>
                        {city.city} ({city.country_name})
                      </option>
                    ))
                  )}
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
                  <span className="text-xs text-gray-600 whitespace-nowrap">N</span>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveCity(index)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove city"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
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
            Days auto-generated from nights. Add services after saving.
          </p>
        </>
      )}

      {selectedCountries.length === 0 && (
        <p className="text-xs text-amber-600 mt-1">
          Select at least one country to add cities
        </p>
      )}
    </div>
  );
}
