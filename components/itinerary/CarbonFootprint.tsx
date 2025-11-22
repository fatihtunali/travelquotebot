'use client';

import { useState, useEffect } from 'react';
import { Leaf, Plane, Car, Building, Info, ExternalLink } from 'lucide-react';

interface CarbonEmission {
  category: string;
  description: string;
  co2e_kg: number;
  source: string;
}

interface CarbonData {
  flights: CarbonEmission[];
  vehicles: CarbonEmission[];
  hotels: CarbonEmission[];
  total_co2e_kg: number;
  per_person_kg: number;
  offset_cost_eur: number;
  methodology: string;
  disclaimer: string;
}

interface CarbonFootprintProps {
  days: number;
  hasFlights: boolean;
  totalKm: number;
  totalPassengers: number;
  showDetailed?: boolean;
}

export default function CarbonFootprint({
  days,
  hasFlights,
  totalKm,
  totalPassengers,
  showDetailed = false
}: CarbonFootprintProps) {
  const [carbonData, setCarbonData] = useState<CarbonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    calculateCarbon();
  }, [days, hasFlights, totalKm, totalPassengers]);

  const calculateCarbon = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/carbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days,
          hasFlights,
          totalKm,
          totalPassengers,
          useSimpleEstimate: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCarbonData(data.data);
      }
    } catch (error) {
      console.error('Error calculating carbon:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-green-50 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-green-100 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-green-100 rounded w-1/2"></div>
      </div>
    );
  }

  if (!carbonData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-green-100/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Carbon Footprint</h3>
              <p className="text-xs text-gray-500">Estimated CO2 emissions</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-700">
              {carbonData.total_co2e_kg} kg
            </div>
            <div className="text-xs text-gray-500">
              {carbonData.per_person_kg} kg per person
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-green-200">
          {/* Breakdown */}
          <div className="mt-4 space-y-2">
            {carbonData.flights.length > 0 && carbonData.flights.map((item, i) => (
              <div key={`flight-${i}`} className="flex items-center justify-between py-2 border-b border-green-100">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">{item.description}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.co2e_kg} kg</span>
              </div>
            ))}

            {carbonData.vehicles.length > 0 && carbonData.vehicles.map((item, i) => (
              <div key={`vehicle-${i}`} className="flex items-center justify-between py-2 border-b border-green-100">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-700">{item.description}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.co2e_kg} kg</span>
              </div>
            ))}

            {carbonData.hotels.length > 0 && carbonData.hotels.map((item, i) => (
              <div key={`hotel-${i}`} className="flex items-center justify-between py-2 border-b border-green-100">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{item.description}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.co2e_kg} kg</span>
              </div>
            ))}
          </div>

          {/* Offset CTA */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Offset this trip</span>
              <span className="text-lg font-bold text-green-600">~€{carbonData.offset_cost_eur}</span>
            </div>
            <a
              href="https://www.goldstandard.org/take-action/offset-your-emissions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Leaf className="w-4 h-4" />
              Offset via Gold Standard
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Methodology Info */}
          <div className="mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(!showInfo);
              }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <Info className="w-3 h-3" />
              {showInfo ? 'Hide' : 'Show'} methodology & disclaimer
            </button>

            {showInfo && (
              <div className="mt-2 p-3 bg-white rounded-lg text-xs text-gray-600 space-y-2">
                <div>
                  <strong>Methodology:</strong> {carbonData.methodology}
                </div>
                <div>
                  <strong>Data Sources:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>ICAO Carbon Emissions Calculator</li>
                    <li>IATA Recommended Practice 1726</li>
                    <li>UK DEFRA Emission Factors 2024</li>
                    <li>Cornell Hotel Sustainability Benchmarking Index</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <strong>Disclaimer:</strong> {carbonData.disclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed hint */}
      {!expanded && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-500 text-center">
            Click to see breakdown and offset options
          </p>
        </div>
      )}
    </div>
  );
}
