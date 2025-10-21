import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
                      if (!acc) return '';
                      const parts = [
                        acc.name,
                        acc.starRating
                          ? `${acc.starRating}-star`
                          : null,
                        acc.nights
                          ? `${acc.nights} night${
                              acc.nights === 1 ? '' : 's'
                            }`
                          : null,
                        acc.pricePerNight
                          ? `${formatPrice(acc.pricePerNight)} /night per person`
                          : null,
                      ];
                      return joinParts(parts);
                    })
                    .filter(Boolean);
                  if (entries.length) return entries;
                }
                const fallbackHotel =
                  originalDay?.selectedHotel || day?.selectedHotel;
                return fallbackHotel ? [String(fallbackHotel)] : [];
              })();

              const activitiesList = (() => {
                if (hasEnrichedDays) {
                  const entries = safeArray(day?.activities)
                    .map((activity: any) => {
                      if (!activity) return '';
                      const rawDuration =
                        activity.duration_hours ?? activity.duration;
                      const durationText =
                        typeof rawDuration === 'number'
                          ? `${rawDuration} hrs`
                          : rawDuration
                          ? String(rawDuration)
                          : null;
                      const parts = [
                        activity.name,
                        activity.category,
                        durationText,
                        activity.pricePerPerson
                          ? `${formatPrice(activity.pricePerPerson)} /person`
                          : null,
                      ];
                      return joinParts(parts);
                    })
                    .filter(Boolean);
                  if (entries.length) return entries;
                }
                return safeArray(
                  originalDay?.selectedActivities ??
                    day?.selectedActivities
                ).map((item) => String(item));
              })();

              const restaurantList = (() => {
                if (hasEnrichedDays) {
                  const entries = safeArray(day?.restaurants)
                    .map((restaurant: any) => {
                      if (!restaurant) return '';
                      const parts = [
                        restaurant.name,
                        restaurant.cuisineType,
                        restaurant.pricePerPerson
                          ? `${formatPrice(restaurant.pricePerPerson)} /person`
                          : null,
                      ];
                      return joinParts(parts);
                    })
                    .filter(Boolean);
                  if (entries.length) return entries;
                }
                return safeArray(
                  originalDay?.selectedRestaurants ??
                    day?.selectedRestaurants
                ).map((item) => String(item));
              })();

              const transportList = (() => {
                if (hasEnrichedDays) {
                  const entries = safeArray(day?.transports)
                    .map((transport: any) => {
                      if (!transport) return '';
                      const parts = [
                        transport.name,
                        transport.type || transport.vehicleType,
                        transport.capacity
                          ? `Capacity ${transport.capacity}`
                          : null,
                        transport.pricePerPerson
                          ? `${formatPrice(transport.pricePerPerson)} /person`
                          : null,
                      ];
                      return joinParts(parts);
                    })
                    .filter(Boolean);
                  if (entries.length) return entries;
                }
                return safeArray(
                  originalDay?.selectedTransport ??
                    day?.selectedTransport
                ).map((item) => String(item));
              })();

              const guideList = (() => {
                if (hasEnrichedDays) {
                  const entries = safeArray(day?.guides)
                    .map((guide: any) => {
                      if (!guide) return '';
                      const languages = safeArray(
                        guide.languages
                      ).join(', ');
                      const parts = [
                        guide.name,
                        languages ? `Languages: ${languages}` : null,
                        guide.specialization,
                        guide.pricePerPerson
                          ? `${formatPrice(guide.pricePerPerson)} /person`
                          : null,
                      ];
                      return joinParts(parts);
                    })
                    .filter(Boolean);
                  if (entries.length) return entries;
                }
                const fallbackGuide =
                  originalDay?.selectedGuide || day?.selectedGuide;
                return fallbackGuide ? [String(fallbackGuide)] : [];
              })();

              const servicesList = safeArray(
                originalDay?.selectedServices ?? day?.selectedServices
              ).map((item) => String(item));

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
                      {renderBulletItems(accommodationsList)}
                    </View>
                  )}

                  {activitiesList.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>ACTIVITIES</Text>
                      {renderBulletItems(activitiesList)}
                    </View>
                  )}

                  {restaurantList.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>DINING</Text>
                      {renderBulletItems(restaurantList)}
                    </View>
                  )}

                  {transportList.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>TRANSPORTATION</Text>
                      {renderBulletItems(transportList)}
                    </View>
                  )}

                  {guideList.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>TOUR GUIDE</Text>
                      {renderBulletItems(guideList)}
                    </View>
                  )}

                  {servicesList.length > 0 && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>
                        ADDITIONAL SERVICES
                      </Text>
                      {renderBulletItems(servicesList)}
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
