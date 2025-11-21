'use client';

import { useState, useEffect } from 'react';
import { CityNight } from './ItineraryBuilder';
import { X, Plus, GripVertical } from 'lucide-react';

interface Country {
  id: number;
  country_code: string;
  country_name: string;
  flag_emoji: string;
}

interface City {
  city: string;
  country_name: string;
  country_id: number;
}

interface CityNightsSelectorProps {
  cityNights: CityNight[];
  onChange: (cityNights: CityNight[]) => void;
  isEditable: boolean;
}

// Extended interface for internal use with country tracking
interface CityNightRow extends CityNight {
  countryId?: number;
}

export default function CityNightsSelector({
  cityNights,
  onChange,
  isEditable
}: CityNightsSelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [citiesByCountry, setCitiesByCountry] = useState<Record<number, City[]>>({});
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState<Record<number, boolean>>({});

  // Track country selection for each row
  const [rowCountries, setRowCountries] = useState<Record<number, number>>({});

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

  // Initialize row countries from existing city data
  useEffect(() => {
    const initRowCountries = async () => {
      if (cityNights.length > 0 && countries.length > 0) {
        const newRowCountries: Record<number, number> = {};

        for (let i = 0; i < cityNights.length; i++) {
          const cn = cityNights[i];
          if (cn.city && !rowCountries[i]) {
            // Try to find the country for this city
            // Default to Turkey (id: 1) if not found
            const turkeyId = countries.find(c => c.country_name === 'Türkiye')?.id || 1;
            newRowCountries[i] = turkeyId;
          }
        }

        if (Object.keys(newRowCountries).length > 0) {
          setRowCountries(prev => ({ ...prev, ...newRowCountries }));
        }
      }
    };
    initRowCountries();
  }, [cityNights, countries]);

  // Fetch cities for a specific country
  const fetchCitiesForCountry = async (countryId: number) => {
    if (citiesByCountry[countryId] || loadingCities[countryId]) return;

    setLoadingCities(prev => ({ ...prev, [countryId]: true }));
    try {
      const response = await fetch(`/api/cities?country_ids=${countryId}`);
      const data = await response.json();
      setCitiesByCountry(prev => ({
        ...prev,
        [countryId]: data.citiesWithInfo || []
      }));
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(prev => ({ ...prev, [countryId]: false }));
    }
  };

  const handleCountryChange = (index: number, countryId: number) => {
    setRowCountries(prev => ({ ...prev, [index]: countryId }));
    // Clear the city when country changes
    const updated = cityNights.map((cn, i) =>
      i === index ? { ...cn, city: '' } : cn
    );
    onChange(updated);
    // Fetch cities for this country if not already loaded
    fetchCitiesForCountry(countryId);
  };

  const handleAddCity = () => {
    // Default to Turkey
    const turkeyId = countries.find(c => c.country_name === 'Türkiye')?.id || 1;
    const newIndex = cityNights.length;
    setRowCountries(prev => ({ ...prev, [newIndex]: turkeyId }));
    fetchCitiesForCountry(turkeyId);
    onChange([...cityNights, { city: '', nights: 2 }]);
  };

  const handleRemoveCity = (index: number) => {
    const updated = cityNights.filter((_, i) => i !== index);
    // Reindex row countries
    const newRowCountries: Record<number, number> = {};
    Object.keys(rowCountries).forEach(key => {
      const keyNum = parseInt(key);
      if (keyNum < index) {
        newRowCountries[keyNum] = rowCountries[keyNum];
      } else if (keyNum > index) {
        newRowCountries[keyNum - 1] = rowCountries[keyNum];
      }
    });
    setRowCountries(newRowCountries);
    onChange(updated);
  };

  const handleCityChange = (index: number, city: string) => {
    const updated = cityNights.map((cn, i) =>
      i === index ? { ...cn, city } : cn
    );
    onChange(updated);
  };

  const handleNightsChange = (index: number, nights: number) => {
    const updated = cityNights.map((cn, i) =>
      i === index ? { ...cn, nights: Math.max(1, nights) } : cn
    );
    onChange(updated);
  };

  const getTotalNights = () => {
    return cityNights.reduce((sum, cn) => sum + cn.nights, 0);
  };

  const getCountryForRow = (index: number) => {
    return rowCountries[index] || countries.find(c => c.country_name === 'Türkiye')?.id || 1;
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
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="block text-xs font-semibold text-gray-700">
          Cities & Nights *
        </label>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Total: {getTotalNights()} night{getTotalNights() !== 1 ? 's' : ''} ({getTotalNights() + 1} days)
        </span>
      </div>

      {loadingCountries ? (
        <div className="text-sm text-gray-500 py-4 text-center">Loading countries...</div>
      ) : (
        <div className="space-y-3">
          {cityNights.map((cityNight, index) => {
            const countryId = getCountryForRow(index);
            const countryCities = citiesByCountry[countryId] || [];
            const isLoadingCities = loadingCities[countryId];

            // Fetch cities if not loaded
            if (countryId && !citiesByCountry[countryId] && !loadingCities[countryId]) {
              fetchCitiesForCountry(countryId);
            }

            return (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {/* Row number */}
                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>

                {/* Country Dropdown */}
                <select
                  value={countryId}
                  onChange={(e) => handleCountryChange(index, parseInt(e.target.value))}
                  className="w-32 sm:w-40 px-2 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.flag_emoji} {country.country_name}
                    </option>
                  ))}
                </select>

                {/* City Dropdown */}
                <select
                  value={cityNight.city}
                  onChange={(e) => handleCityChange(index, e.target.value)}
                  className="flex-1 min-w-0 px-2 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                >
                  <option value="">Select city...</option>
                  {isLoadingCities ? (
                    <option disabled>Loading...</option>
                  ) : (
                    countryCities.map(city => (
                      <option key={city.city} value={city.city}>
                        {city.city}
                      </option>
                    ))
                  )}
                </select>

                {/* Nights Input */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={cityNight.nights}
                    onChange={(e) => handleNightsChange(index, parseInt(e.target.value) || 1)}
                    className="w-14 px-2 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-center"
                    required
                  />
                  <span className="text-xs text-gray-600 whitespace-nowrap">N</span>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveCity(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Remove city"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {/* Add City Button */}
          <button
            type="button"
            onClick={handleAddCity}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add City
          </button>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        Select country first, then choose city. Days are auto-generated from nights.
      </p>
    </div>
  );
}
