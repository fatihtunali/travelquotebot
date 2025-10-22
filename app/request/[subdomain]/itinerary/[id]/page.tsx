'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ItineraryMap from '@/app/components/ItineraryMap';
import EnrichedServiceDetails from '@/app/components/EnrichedServiceDetails';

interface Itinerary {
  id: string;
  customerName: string;
  customerEmail: string;
  numberOfTravelers: number;
  startDate: string;
  company_name?: string;
  logo_url?: string;
  pricingTiers?: any[];
  itineraryData: any;
  preferences?: any;
  duration?: number;
  enrichedDays?: any[];
}

export default function PublicItineraryViewPage() {
  const router = useRouter();
  const params = useParams();
  const subdomain = params.subdomain as string;
  const itineraryId = params.id as string;

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch(`/api/public/itinerary/${itineraryId}`);

        if (!response.ok) {
          throw new Error('Failed to load itinerary');
        }

        const data = await response.json();
        setItinerary(data.itinerary);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (itineraryId) {
      fetchItinerary();
    }
  }, [itineraryId]);

  const mapLocations = useMemo(() => {
    if (!Array.isArray(itinerary?.enrichedDays)) {
      return [];
    }

    type MapLocation = {
      lat: number;
      lng: number;
      title: string;
      type: 'hotel' | 'activity' | 'restaurant';
      day?: number;
    };

    const result: MapLocation[] = [];

    (itinerary?.enrichedDays ?? []).forEach((day: any) => {
      const dayNumber = day?.dayNumber;

      day?.accommodations?.forEach((acc: any) => {
        const lat = acc?.location?.lat ?? acc?.location_lat;
        const lng = acc?.location?.lng ?? acc?.location_lng;
        if (lat !== undefined && lng !== undefined) {
          const latNum = parseFloat(String(lat));
          const lngNum = parseFloat(String(lng));
          if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
            return;
          }
          result.push({
            lat: latNum,
            lng: lngNum,
            title: acc?.name || 'Accommodation',
            type: 'hotel',
            day: dayNumber,
          });
        }
      });

      day?.activities?.forEach((act: any) => {
        const lat = act?.location?.lat ?? act?.location_lat;
        const lng = act?.location?.lng ?? act?.location_lng;
        if (lat !== undefined && lng !== undefined) {
          const latNum = parseFloat(String(lat));
          const lngNum = parseFloat(String(lng));
          if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
            return;
          }
          result.push({
            lat: latNum,
            lng: lngNum,
            title: act?.name || 'Activity',
            type: 'activity',
            day: dayNumber,
          });
        }
      });

      day?.restaurants?.forEach((rest: any) => {
        const lat = rest?.location?.lat ?? rest?.location_lat;
        const lng = rest?.location?.lng ?? rest?.location_lng;
        if (lat !== undefined && lng !== undefined) {
          const latNum = parseFloat(String(lat));
          const lngNum = parseFloat(String(lng));
          if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
            return;
          }
          result.push({
            lat: latNum,
            lng: lngNum,
            title: rest?.name || 'Restaurant',
            type: 'restaurant',
            day: dayNumber,
          });
        }
      });
    });

    return result;
  }, [itinerary?.enrichedDays]);

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { ItineraryPDF } = await import('../../ItineraryPDF');

      const operator = {
        companyName: itinerary!.company_name || 'Travel Agency',
        logoUrl: itinerary!.logo_url || null,
      };

      const formData = {
        customerName: itinerary!.customerName,
        numberOfTravelers: itinerary!.numberOfTravelers,
        duration:
          itinerary!.duration ||
          itinerary!.enrichedDays?.length ||
          itinerary!.itineraryData.days?.length ||
          0,
        startDate: itinerary!.startDate,
        budget: itinerary!.preferences?.budget || 'moderate',
      };

      // Generate PDF blob
      const blob = await pdf(
        <ItineraryPDF
          operator={operator}
          formData={formData}
          itineraryData={itinerary!.itineraryData}
          pricingTiers={itinerary!.pricingTiers || []}
          enrichedDays={itinerary!.enrichedDays || []}
        />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `${(itinerary!.itineraryData.title || 'itinerary').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
      link.download = filename;
      link.click();

      // Cleanup
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('PDF generation error:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-xl">Loading your itinerary...</div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error || 'Itinerary not found'}</div>
          <button
            onClick={() => router.push(`/request/${subdomain}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Request Form
          </button>
        </div>
      </div>
    );
  }

  const data = itinerary.itineraryData;
  const pricingTiers = itinerary.pricingTiers || [];

  const formData = {
    customerName: itinerary.customerName,
    numberOfTravelers: itinerary.numberOfTravelers,
    duration: data.days?.length || 0,
    startDate: itinerary.startDate,
    budget: itinerary.preferences?.budget || 'moderate',
  };

  const primaryColor = '#2563eb';
  const secondaryColor = '#3b82f6';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 justify-center">
            {itinerary.logo_url ? (
              <img
                src={itinerary.logo_url}
                alt={itinerary.company_name}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                ✈️
              </div>
            )}
            <h1
              className="text-3xl font-bold bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {itinerary.company_name || 'Travel Agency'}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="bubble-card p-8 text-center bg-gradient-to-br from-white to-green-50 mb-6">
          <div
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            ✅
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Your Itinerary is Ready!
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            {data.title || data.tourName}
          </p>
          <p className="text-gray-600 mb-6">{data.summary}</p>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
          >
            {generatingPDF ? '📄 Generating PDF...' : '📥 Download PDF'}
          </button>
        </div>

        {/* Trip Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">Trip Overview</h2>
          <p className="text-gray-700 mb-4">{data.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Starting Price</div>
              <div className="text-2xl font-bold text-blue-600">
                {(() => {
                  if (!pricingTiers || pricingTiers.length === 0) {
                    return 'Contact for pricing';
                  }
                  const tier = pricingTiers[0];
                  // Show price for the first available hotel category
                  let price = null;
                  if (tier.five_star_double !== null) {
                    price = tier.five_star_double;
                  } else if (tier.four_star_double !== null) {
                    price = tier.four_star_double;
                  } else if (tier.three_star_double !== null) {
                    price = tier.three_star_double;
                  }
                  return price !== null
                    ? `${tier.currency} ${Number(price).toFixed(2)}`
                    : 'Contact for pricing';
                })()}
              </div>
              <div className="text-xs text-gray-500">
                {(() => {
                  if (!pricingTiers || pricingTiers.length === 0) return '';
                  const tier = pricingTiers[0];
                  let hotelCategory = '';
                  if (tier.five_star_double !== null) hotelCategory = '5-star';
                  else if (tier.four_star_double !== null) hotelCategory = '4-star';
                  else if (tier.three_star_double !== null) hotelCategory = '3-star';
                  return hotelCategory ? `per person (${hotelCategory} hotels, double room)` : '';
                })()}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Trip Duration</div>
              <div className="text-2xl font-bold text-green-600">
                {formData.duration ? `${formData.duration} Days` : (data.days ? `${data.days.length} Days` : 'N/A')}
              </div>
              <div className="text-xs text-gray-500">
                {formData.startDate ? new Date(formData.startDate + 'T00:00:00').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : (data.days && data.days.length > 0 && data.days[0].date
                  ? new Date(data.days[0].date + 'T00:00:00').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'Flexible dates')}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Travel Style</div>
              <div className="text-2xl font-bold text-purple-600">
                {formData.budget === 'budget' ? 'Value'
                  : formData.budget === 'moderate' ? 'Comfort'
                  : formData.budget === 'luxury' ? 'Premium'
                  : 'Standard'}
              </div>
              <div className="text-xs text-gray-500">
                {formData.numberOfTravelers ? `${formData.numberOfTravelers} ${formData.numberOfTravelers === 1 ? 'traveler' : 'travelers'}` : 'Group size varies'}
              </div>
            </div>
          </div>
        </div>

        {/* Route Map */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Trip Route</h2>
          <ItineraryMap
            itineraryData={data}
            locations={mapLocations}
            className="h-96"
          />
        </div>

        {/* Itinerary Days */}
        <div className="space-y-6 mb-8">
          {data.days?.map((day: any, index: number) => {
            const formatDate = (dateStr: string) => {
              if (!dateStr) return '';
              const [year, month, dayNum] = dateStr.split('-');
              return `${month}/${dayNum}/${year}`;
            };

            const formattedDate = formatDate(day.date);
            const dayNumber = day.dayNumber || day.day;
            const title = day.title?.replace(/Day \d+ - /, '');
            const mealCode = day.mealCode || '';

            return (
              <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                  <div className="flex justify-between items-center">
                    <div className="w-full">
                      <h3 className="text-xl font-bold">
                        {formattedDate} - Day {dayNumber} - {title} {mealCode}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Narrative Description */}
                  {day.description && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">{day.description}</p>
                    </div>
                  )}

                  {/* ENRICHED DATA FROM DATABASE WITH CLOUDINARY PHOTOS */}
                  {itinerary.enrichedDays && (
                    <EnrichedServiceDetails enrichedDays={itinerary.enrichedDays} dayNumber={dayNumber} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Tables */}
        {pricingTiers && pricingTiers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">💰 Pricing Options</h2>

            {(() => {
              const firstTier = pricingTiers[0];

              // Define all possible hotel categories with their configuration
              const hotelCategories = [
                {
                  key: 'three_star',
                  label: '3-STAR HOTELS',
                  stars: '⭐⭐⭐',
                  colorClass: 'text-amber-700',
                  bgClass: 'bg-amber-50',
                  doubleField: 'three_star_double',
                  tripleField: 'three_star_triple',
                  singleField: 'three_star_single_supplement'
                },
                {
                  key: 'four_star',
                  label: '4-STAR HOTELS',
                  stars: '⭐⭐⭐⭐',
                  colorClass: 'text-blue-700',
                  bgClass: 'bg-blue-50',
                  doubleField: 'four_star_double',
                  tripleField: 'four_star_triple',
                  singleField: 'four_star_single_supplement'
                },
                {
                  key: 'five_star',
                  label: '5-STAR HOTELS',
                  stars: '⭐⭐⭐⭐⭐',
                  colorClass: 'text-purple-700',
                  bgClass: 'bg-purple-50',
                  doubleField: 'five_star_double',
                  tripleField: 'five_star_triple',
                  singleField: 'five_star_single_supplement'
                }
              ];

              // Determine which category to show based on available pricing
              // Show ONLY the highest available category (represents selected hotels)
              let selectedCategory = null;
              for (const category of hotelCategories.reverse()) {
                if (firstTier[category.doubleField] !== null) {
                  selectedCategory = category;
                  break;
                }
              }

              return (
                <>
                  {/* Show ONLY ONE pricing table for the selected hotel category */}
                  {selectedCategory && (
                    <div key={selectedCategory.key} className="mb-8">
                      <h3 className={`text-xl font-semibold mb-4 ${selectedCategory.colorClass}`}>
                        {selectedCategory.stars} {selectedCategory.label}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className={selectedCategory.bgClass}>
                              <th className="border border-gray-300 px-4 py-2 text-left">PAX</th>
                              <th className="border border-gray-300 px-4 py-2 text-right">Double Room</th>
                              <th className="border border-gray-300 px-4 py-2 text-right">Triple Room</th>
                              <th className="border border-gray-300 px-4 py-2 text-right">Single Supplement</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pricingTiers.map((tier: any, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2 font-medium">
                                  {tier.min_pax}-{tier.max_pax || '+'} persons
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-right">
                                  {tier.currency} {Number(tier[selectedCategory.doubleField]).toFixed(2)}/person
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-right">
                                  {tier.currency} {Number(tier[selectedCategory.tripleField]).toFixed(2)}/person
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                                  +{tier.currency} {Number(tier[selectedCategory.singleField]).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            <div className="text-sm text-gray-600 italic mt-4">
              * Prices are per person and include all services mentioned in the itinerary<br/>
              * Single supplement applies when a single traveler wants a private room
            </div>
          </div>
        )}

        {/* Inclusions & Exclusions */}
        {(data.inclusions || data.exclusions || data.information) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {data.inclusions && (
              <div className="bubble-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-green-700">✓ What's Included</h3>
                <div className="text-gray-700 whitespace-pre-line">{data.inclusions}</div>
              </div>
            )}

            {data.exclusions && (
              <div className="bubble-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-red-700">✗ What's Not Included</h3>
                <div className="text-gray-700 whitespace-pre-line">{data.exclusions}</div>
              </div>
            )}
          </div>
        )}

        {data.information && (
          <div className="bubble-card p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">ℹ️ Important Information</h3>
            <div className="text-gray-700 whitespace-pre-line">{data.information}</div>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push(`/request/${subdomain}`)}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition"
          >
            Create Another Itinerary
          </button>
        </div>
      </main>
    </div>
  );
}
