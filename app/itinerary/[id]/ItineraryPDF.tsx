import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  companyName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '1 solid #e5e7eb',
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 8,
  },
  dayContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    border: '1 solid #e5e7eb',
  },
  dayHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: '1 solid #2563eb',
  },
  dayText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#4b5563',
  },
  activityItem: {
    fontSize: 9,
    color: '#4b5563',
    marginLeft: 10,
    marginBottom: 2,
  },
  table: {
    marginTop: 10,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    paddingVertical: 6,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    color: '#ffffff',
  },
  tableCell: {
    fontSize: 9,
    padding: 4,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    padding: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 8,
  },
  overviewBox: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  overviewItem: {
    flex: 1,
    padding: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
    border: '1 solid #bfdbfe',
  },
  overviewLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  overviewValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  box: {
    padding: 8,
    marginTop: 6,
    marginBottom: 4,
    backgroundColor: '#f0f9ff',
    border: '1 solid #bae6fd',
    borderRadius: 3,
  },
  boxTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 3,
  },
  serviceImage: {
    width: 120,
    height: 80,
    objectFit: 'cover',
    borderRadius: 4,
    marginBottom: 4,
  },
  serviceItemWithImage: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    border: '1 solid #e5e7eb',
  },
});

interface ItineraryPDFProps {
  operator: {
    companyName: string;
    logoUrl?: string | null;
  };
  formData: {
    customerName: string;
    numberOfTravelers: number;
    duration: number;
    startDate: string;
    budget?: string;
  };
  itineraryData: any;
  pricingTiers?: any[];
  enrichedDays?: any[];
}

export const ItineraryPDF: React.FC<ItineraryPDFProps> = ({
  operator,
  formData,
  itineraryData,
  pricingTiers,
  enrichedDays,
}) => {
  const itineraryDays: any[] = Array.isArray(itineraryData?.days)
    ? itineraryData.days
    : [];
  const hasEnrichedDays =
    Array.isArray(enrichedDays) && enrichedDays.length > 0;
  const dayEntries: any[] = hasEnrichedDays
    ? ((enrichedDays as any[]) ?? [])
    : itineraryDays;
  const currencyLabel: string =
    pricingTiers?.[0]?.currency ||
    itineraryData?.totalEstimatedCost?.currency ||
    '';

  const formatPrice = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    const numberValue =
      typeof value === 'number' ? value : parseFloat(String(value));
    if (Number.isNaN(numberValue)) {
      return '';
    }
    return currencyLabel
      ? `${currencyLabel} ${numberValue.toFixed(2)}`
      : numberValue.toFixed(2);
  };

  const safeArray = (value: any): any[] =>
    Array.isArray(value) ? value : [];

  const joinParts = (parts: Array<string | null | undefined>) =>
    parts.filter(Boolean).join(' • ');

  const renderBulletItems = (items: string[]) =>
    items
      .filter((item) => !!item)
      .map((item, idx) => (
        <Text key={idx} style={styles.activityItem}>
          - {item}
        </Text>
      ));

  const renderDetailedItems = (items: Array<{ header: string; details: string[]; image?: string }>) =>
    items.map((item, idx) => (
      <View key={idx} style={item.image ? styles.serviceItemWithImage : { marginBottom: 8 }}>
        {item.image && (
          <Image
            src={item.image}
            style={styles.serviceImage}
            cache={false}
          />
        )}
        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1e40af', marginBottom: 2 }}>
          {item.header}
        </Text>
        {item.details.map((detail, detailIdx) => (
          <Text key={detailIdx} style={{ fontSize: 8, color: '#4b5563', marginLeft: item.image ? 0 : 8, marginBottom: 1 }}>
            {detail}
          </Text>
        ))}
      </View>
    ));

  const getDayNumber = (day: any, index: number) => {
    if (typeof day?.dayNumber === 'number') return day.dayNumber;
    if (typeof day?.day === 'number') return day.day;
    const parsed = parseInt(
      day?.dayNumber ?? day?.day ?? day?.day_number ?? '',
      10
    );
    if (!Number.isNaN(parsed)) return parsed;
    return index + 1;
  };

  const findOriginalDay = (dayNumber: number) =>
    itineraryDays.find((original) => {
      if (!original) return false;
      if (typeof original.dayNumber === 'number') {
        return original.dayNumber === dayNumber;
      }
      if (typeof original.day === 'number') {
        return original.day === dayNumber;
      }
      const parsed = parseInt(
        original?.dayNumber ?? original?.day ?? '',
        10
      );
      return !Number.isNaN(parsed) && parsed === dayNumber;
    });

  const formatDate = (value?: string) => {
    if (!value) return '';
    const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Generate static map URL with all locations
  const generateTripMapUrl = () => {
    if (!enrichedDays || enrichedDays.length === 0) return null;

    const markers: string[] = [];

    // Add accommodations (red markers)
    enrichedDays.forEach((day: any, idx: number) => {
      if (day.accommodations && day.accommodations.length > 0) {
        day.accommodations.forEach((acc: any) => {
          if (acc.location && acc.location.lat && acc.location.lng) {
            markers.push(`color:red|label:H${idx + 1}|${acc.location.lat},${acc.location.lng}`);
          }
        });
      }
    });

    // Add activities (blue markers)
    let activityCount = 1;
    enrichedDays.forEach((day: any) => {
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((act: any) => {
          if (act.location && act.location.lat && act.location.lng && activityCount <= 26) {
            const label = String.fromCharCode(64 + activityCount); // A, B, C...
            markers.push(`color:blue|label:${label}|${act.location.lat},${act.location.lng}`);
            activityCount++;
          }
        });
      }
    });

    // Add restaurants (orange markers)
    enrichedDays.forEach((day: any) => {
      if (day.restaurants && day.restaurants.length > 0) {
        day.restaurants.forEach((rest: any) => {
          if (rest.location && rest.location.lat && rest.location.lng) {
            markers.push(`color:orange|label:R|${rest.location.lat},${rest.location.lng}`);
          }
        });
      }
    });

    if (markers.length === 0) return null;

    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const params = new URLSearchParams({
      size: '800x500',
      maptype: 'roadmap',
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    });

    // Add all markers
    markers.forEach(marker => {
      params.append('markers', marker);
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const tripMapUrl = generateTripMapUrl();

  const totalDuration =
    formData.duration ||
    dayEntries.length ||
    itineraryDays.length ||
    itineraryData?.duration ||
    'N/A';

  const hasPricing =
    Array.isArray(pricingTiers) && pricingTiers.length > 0;
  const firstPricingTier = hasPricing ? pricingTiers![0] : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {operator.companyName && (
            <Text style={styles.companyName}>{operator.companyName}</Text>
          )}
          <Text style={styles.title}>{itineraryData.title}</Text>
          <Text style={styles.subtitle}>
            {formData.customerName} - {formData.numberOfTravelers} travelers
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Overview</Text>
          {itineraryData.summary && (
            <Text style={styles.text}>{itineraryData.summary}</Text>
          )}

          <View style={styles.overviewBox}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Duration</Text>
              <Text style={styles.overviewValue}>
                {totalDuration} Days
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Start Date</Text>
              <Text style={styles.overviewValue}>
                {formData.startDate
                  ? new Date(`${formData.startDate}T00:00:00`).toLocaleDateString(
                      'en-US',
                      { year: 'numeric', month: 'short', day: 'numeric' }
                    )
                  : 'Flexible'}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Travel Style</Text>
              <Text style={styles.overviewValue}>
                {formData.budget === 'budget'
                  ? 'Value'
                  : formData.budget === 'moderate'
                  ? 'Comfort'
                  : formData.budget === 'luxury'
                  ? 'Premium'
                  : 'Standard'}
              </Text>
            </View>
          </View>
        </View>

        {/* Trip Route Map */}
        {tripMapUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Route Map</Text>
            <View style={{ marginTop: 8, alignItems: 'center' }}>
              <Image
                src={tripMapUrl}
                style={{ width: 500, height: 312, marginBottom: 8 }}
                cache={false}
              />
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, backgroundColor: 'red', borderRadius: 4 }} />
                  <Text style={{ fontSize: 8 }}>Hotels (H1, H2, H3...)</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, backgroundColor: 'blue', borderRadius: 4 }} />
                  <Text style={{ fontSize: 8 }}>Activities (A, B, C...)</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, backgroundColor: 'orange', borderRadius: 4 }} />
                  <Text style={{ fontSize: 8 }}>Restaurants (R)</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Day by Day Itinerary</Text>
          {dayEntries.length > 0 ? (
            dayEntries.map((day: any, index: number) => {
              const dayNumber = getDayNumber(day, index);
              const originalDay = hasEnrichedDays
                ? findOriginalDay(dayNumber) ?? day
                : day;
              const formattedDate = formatDate(
                originalDay?.date || day?.date
              );
              const mealCode =
                originalDay?.mealCode || day?.mealCode || '';
              const rawTitle =
                originalDay?.title || day?.title || `Day ${dayNumber}`;
              const dayTitle =
                rawTitle.replace(/Day\s*\d+\s*-?\s*/i, '').trim() ||
                `Day ${dayNumber}`;
              const dayCity = day?.city || originalDay?.city;
              const description =
                originalDay?.description || day?.description || '';
              const highlights = safeArray(originalDay?.highlights).map(
                (item) => String(item)
              );

              const accommodationsList = (() => {
                if (hasEnrichedDays) {
                  const entries = safeArray(day?.accommodations)
                    .map((acc: any) => {
                      if (!acc) return null;
                      const header = joinParts([
                        acc.name,
                        acc.starRating ? `${'⭐'.repeat(acc.starRating)}` : null,
                      ]);
                      const details: string[] = [];
                      if (acc.address) details.push(`📍 ${acc.address}`);
                      if (acc.phone) details.push(`📞 ${acc.phone}`);
                      if (acc.description) details.push(acc.description);
                      if (acc.amenities && acc.amenities.length > 0) {
                        details.push(`Amenities: ${acc.amenities.slice(0, 5).join(', ')}`);
                      }

                      // Add first image if available (add Google API key if it's a Google Places photo)
                      let image = acc.images && acc.images.length > 0 ? acc.images[0] : undefined;
                      if (image && image.includes('maps.googleapis.com') && !image.includes('&key=')) {
                        image = `${image}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}`;
                      }

                      return { header, details, image };
                    })
                    .filter((item) => item !== null) as Array<{ header: string; details: string[]; image?: string }>;
                  if (entries.length) return entries;
                }
                const fallbackHotel =
                  originalDay?.selectedHotel || day?.selectedHotel;
                return fallbackHotel ? [{ header: String(fallbackHotel), details: [] }] : [];
              })();

              const activitiesList = (() => {
                if (hasEnrichedDays) {
                  const entries = safeArray(day?.activities)
                    .map((activity: any) => {
                      if (!activity) return null;
                      const header = joinParts([
                        activity.name,
                        activity.category ? `[${activity.category}]` : null,
                      ]);
                      const details: string[] = [];
                      if (activity.description) details.push(activity.description);
                      if (activity.meetingPoint) details.push(`📍 Meeting Point: ${activity.meetingPoint}`);
                      const rawDuration = activity.duration_hours ?? activity.duration;
                      if (rawDuration) {
                        const durationText = typeof rawDuration === 'number'
                          ? `${rawDuration} hours`
                          : String(rawDuration);
                        details.push(`⏱️ Duration: ${durationText}`);
                      }

                      // Add first image if available (add Google API key if needed)
                      let image = activity.images && activity.images.length > 0 ? activity.images[0] : undefined;
                      if (image && image.includes('maps.googleapis.com') && !image.includes('&key=')) {
                        image = `${image}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}`;
                      }

                      return { header, details, image };
                    })
                    .filter((item) => item !== null) as Array<{ header: string; details: string[]; image?: string }>;
                  if (entries.length) return entries;
                }
                const fallback = safeArray(
                  originalDay?.selectedActivities ?? day?.selectedActivities
                );
                return fallback.map((item) => ({ header: String(item), details: [] }));
              })();

              const restaurantList = (() => {
                if (hasEnrichedDays) {
                  const entries = safeArray(day?.restaurants)
                    .map((restaurant: any) => {
                      if (!restaurant) return null;
                      const header = joinParts([
                        restaurant.name,
                        restaurant.cuisineType ? `[${restaurant.cuisineType}]` : null,
                      ]);
                      const details: string[] = [];
                      if (restaurant.address) details.push(`📍 ${restaurant.address}`);
                      if (restaurant.phone) details.push(`📞 ${restaurant.phone}`);

                      // Add first image if available (add Google API key if needed)
                      let image = restaurant.images && restaurant.images.length > 0 ? restaurant.images[0] : undefined;
                      if (image && image.includes('maps.googleapis.com') && !image.includes('&key=')) {
                        image = `${image}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}`;
                      }

                      return { header, details, image };
                    })
                    .filter((item) => item !== null) as Array<{ header: string; details: string[]; image?: string }>;
                  if (entries.length) return entries;
                }
                const fallback = safeArray(
                  originalDay?.selectedRestaurants ?? day?.selectedRestaurants
                );
                return fallback.map((item) => ({ header: String(item), details: [] }));
              })();

              const transportList = (() => {
                if (hasEnrichedDays) {
                  const entries = safeArray(day?.transports)
                    .map((transport: any) => {
                      if (!transport) return null;
                      const vehicleInfo = transport.type || transport.vehicleType;
                      const header = joinParts([
                        transport.name,
                        vehicleInfo ? `[${vehicleInfo}]` : null,
                      ]);
                      const details: string[] = [];
                      if (transport.capacity) {
                        details.push(`Capacity: ${transport.capacity} passengers`);
                      }
                      return { header, details };
                    })
                    .filter((item): item is { header: string; details: string[] } => item !== null);
                  if (entries.length) return entries;
                }
                const fallback = safeArray(
                  originalDay?.selectedTransport ?? day?.selectedTransport
                );
                return fallback.map((item) => ({ header: String(item), details: [] }));
              })();

              const guideList = (() => {
                if (hasEnrichedDays) {
                  const entries = safeArray(day?.guides)
                    .map((guide: any) => {
                      if (!guide) return null;
                      const header = guide.name;
                      const details: string[] = [];
                      if (guide.specialization) {
                        details.push(`Specialization: ${guide.specialization}`);
                      }
                      const languages = safeArray(guide.languages).join(', ');
                      if (languages) {
                        details.push(`Languages: ${languages}`);
                      }
                      if (guide.phone) {
                        details.push(`📞 ${guide.phone}`);
                      }
                      return { header, details };
                    })
                    .filter((item): item is { header: string; details: string[] } => item !== null);
                  if (entries.length) return entries;
                }
                const fallbackGuide =
                  originalDay?.selectedGuide || day?.selectedGuide;
                return fallbackGuide ? [{ header: String(fallbackGuide), details: [] }] : [];
              })();

              const servicesList = safeArray(
                originalDay?.selectedServices ?? day?.selectedServices
              ).map((item) => ({ header: String(item), details: [] }));

              return (
                <View
                  key={index}
                  style={styles.dayContainer}
                  break={index > 0 && index % 2 === 0}
                >
                  <Text style={styles.dayHeader}>
                    {formattedDate ? `${formattedDate} - ` : ''}Day{' '}
                    {dayNumber}
                    {dayTitle ? ` - ${dayTitle}` : ''}
                    {dayCity ? ` (${dayCity})` : ''}
                    {mealCode ? ` ${mealCode}` : ''}
                  </Text>

                  {description && (
                    <Text style={styles.dayText}>{description}</Text>
                  )}

                  {highlights.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>HIGHLIGHTS</Text>
                      {renderBulletItems(highlights)}
                    </View>
                  )}

                  {accommodationsList.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>ACCOMMODATION</Text>
                      {renderDetailedItems(accommodationsList)}
                    </View>
                  )}

                  {activitiesList.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>ACTIVITIES</Text>
                      {renderDetailedItems(activitiesList)}
                    </View>
                  )}

                  {restaurantList.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>DINING</Text>
                      {renderDetailedItems(restaurantList)}
                    </View>
                  )}

                  {transportList.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>TRANSPORTATION</Text>
                      {renderDetailedItems(transportList)}
                    </View>
                  )}

                  {guideList.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>TOUR GUIDE</Text>
                      {renderDetailedItems(guideList)}
                    </View>
                  )}

                  {servicesList.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>
                        ADDITIONAL SERVICES
                      </Text>
                      {renderDetailedItems(servicesList)}
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.dayText}>
              Detailed daily schedule is not available for this itinerary.
            </Text>
          )}
        </View>
      </Page>

      {hasPricing && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Pricing Details</Text>
          </View>

          {firstPricingTier?.three_star_double !== null &&
            firstPricingTier?.three_star_double !== undefined && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>3-STAR HOTELS</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableCellHeader, { width: '20%' }]}>
                      PAX
                    </Text>
                    <Text style={[styles.tableCellHeader, { width: '26%' }]}>
                      Double Room
                    </Text>
                    <Text style={[styles.tableCellHeader, { width: '26%' }]}>
                      Triple Room
                    </Text>
                    <Text style={[styles.tableCellHeader, { width: '28%' }]}>
                      Single Supp.
                    </Text>
                  </View>
                  {pricingTiers!.map((tier: any, index: number) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: '20%' }]}>
                        {tier.min_pax}-{tier.max_pax || '+'} PAX
                      </Text>
                      <Text style={[styles.tableCell, { width: '26%' }]}>
                        {tier.currency} {Number(tier.three_star_double).toFixed(2)}
                      </Text>
                      <Text style={[styles.tableCell, { width: '26%' }]}>
                        {tier.currency} {Number(tier.three_star_triple).toFixed(2)}
                      </Text>
                      <Text style={[styles.tableCell, { width: '28%' }]}>
                        +{tier.currency}{' '}
                        {Number(tier.three_star_single_supplement).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {firstPricingTier?.four_star_double !== null &&
            firstPricingTier?.four_star_double !== undefined && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>4-STAR HOTELS</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableCellHeader, { width: '20%' }]}>
                      PAX
                    </Text>
                    <Text style={[styles.tableCellHeader, { width: '26%' }]}>
                      Double Room
                    </Text>
                    <Text style={[styles.tableCellHeader, { width: '26%' }]}>
                      Triple Room
                    </Text>
                    <Text style={[styles.tableCellHeader, { width: '28%' }]}>
                      Single Supp.
                    </Text>
                  </View>
                  {pricingTiers!.map((tier: any, index: number) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: '20%' }]}>
                        {tier.min_pax}-{tier.max_pax || '+'} PAX
                      </Text>
                      <Text style={[styles.tableCell, { width: '26%' }]}>
                        {tier.currency} {Number(tier.four_star_double).toFixed(2)}
                      </Text>
                      <Text style={[styles.tableCell, { width: '26%' }]}>
                        {tier.currency} {Number(tier.four_star_triple).toFixed(2)}
                      </Text>
                      <Text style={[styles.tableCell, { width: '28%' }]}>
                        +{tier.currency}{' '}
                        {Number(tier.four_star_single_supplement).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {firstPricingTier?.five_star_double !== null &&
            firstPricingTier?.five_star_double !== undefined && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>5-STAR HOTELS</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableCellHeader, { width: '20%' }]}>
                      PAX
                    </Text>
                    <Text style={[styles.tableCellHeader, { width: '26%' }]}>
                      Double Room
                    </Text>
                    <Text style={[styles.tableCellHeader, { width: '26%' }]}>
                      Triple Room
                    </Text>
                    <Text style={[styles.tableCellHeader, { width: '28%' }]}>
                      Single Supp.
                    </Text>
                  </View>
                  {pricingTiers!.map((tier: any, index: number) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: '20%' }]}>
                        {tier.min_pax}-{tier.max_pax || '+'} PAX
                      </Text>
                      <Text style={[styles.tableCell, { width: '26%' }]}>
                        {tier.currency} {Number(tier.five_star_double).toFixed(2)}
                      </Text>
                      <Text style={[styles.tableCell, { width: '26%' }]}>
                        {tier.currency} {Number(tier.five_star_triple).toFixed(2)}
                      </Text>
                      <Text style={[styles.tableCell, { width: '28%' }]}>
                        +{tier.currency}{' '}
                        {Number(tier.five_star_single_supplement).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {itineraryData.inclusions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>WHAT'S INCLUDED</Text>
              <Text style={styles.text}>{itineraryData.inclusions}</Text>
            </View>
          )}

          {itineraryData.exclusions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>WHAT'S NOT INCLUDED</Text>
              <Text style={styles.text}>{itineraryData.exclusions}</Text>
            </View>
          )}

          {itineraryData.information && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>IMPORTANT INFORMATION</Text>
              <Text style={styles.text}>{itineraryData.information}</Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text>
              Generated with {operator.companyName} -{' '}
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
};
