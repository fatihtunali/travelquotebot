import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register Roboto font with full Unicode support for Turkish characters
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf',
      fontWeight: 400,
      fontStyle: 'italic'
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700
    },
  ]
});

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '3px solid #3B82F6',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 20,
  },
  dateRange: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  travelers: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 25,
    marginBottom: 15,
    borderBottom: '2px solid #E5E7EB',
    paddingBottom: 8,
  },
  dayContainer: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeft: '4px solid #3B82F6',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  dayDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  dayLocation: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: 'bold',
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  narrative: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.6,
    marginBottom: 10,
  },
  meals: {
    fontSize: 10,
    color: '#059669',
    backgroundColor: '#D1FAE5',
    padding: '6 10',
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  hotel: {
    fontSize: 10,
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    padding: '6 10',
    borderRadius: 12,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #E5E7EB',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  footerBrand: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  pageNumber: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  itemsSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  itemsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: '1px solid #E5E7EB',
  },
  itemName: {
    fontSize: 10,
    color: '#4B5563',
    flex: 1,
  },
  itemPrice: {
    fontSize: 10,
    color: '#059669',
    fontWeight: 'bold',
  },
  pricingSummary: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderLeft: '4px solid #3B82F6',
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  pricingValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2px solid #3B82F6',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  hotelSection: {
    marginTop: 20,
  },
  hotelGrid: {
    marginTop: 10,
  },
  hotelCard: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeft: '3px solid #3B82F6',
  },
  hotelImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginBottom: 8,
    objectFit: 'cover',
  },
  hotelName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  hotelInfo: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  star: {
    fontSize: 10,
    color: '#F59E0B',
  },
  tourSection: {
    marginTop: 20,
  },
  tourGrid: {
    marginTop: 10,
  },
  tourCard: {
    marginBottom: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  tourImage: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    marginBottom: 8,
    objectFit: 'cover',
  },
  tourName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 3,
  },
  tourDescription: {
    fontSize: 9,
    color: '#4B5563',
    lineHeight: 1.4,
  },
  mapSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  mapImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  inclusionsSection: {
    marginTop: 20,
  },
  inclusionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  inclusionsColumn: {
    flex: 1,
  },
  inclusionBox: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  exclusionBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 10,
  },
  inclusionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 6,
  },
  exclusionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 6,
  },
  inclusionItem: {
    fontSize: 9,
    color: '#047857',
    marginBottom: 3,
  },
  exclusionItem: {
    fontSize: 9,
    color: '#B91C1C',
    marginBottom: 3,
  },
  organizationInfo: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 8,
  },
});

interface ItineraryPDFProps {
  itinerary: any;
}

const ItineraryPDF: React.FC<ItineraryPDFProps> = ({ itinerary }) => {
  const itineraryData = typeof itinerary.itinerary_data === 'string'
    ? JSON.parse(itinerary.itinerary_data)
    : itinerary.itinerary_data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = () => {
    const start = new Date(itinerary.start_date);
    const end = new Date(itinerary.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr} • ${diffDays} Days`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>TQA</Text>
          <Text style={styles.subtitle}>Travel Quote AI - Your Personalized Itinerary</Text>
          {itinerary.organization && (
            <View style={styles.organizationInfo}>
              <Text style={{ fontSize: 10, color: '#4B5563', marginTop: 8 }}>
                Prepared by: {itinerary.organization.name}
              </Text>
              {itinerary.organization.email && (
                <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 2 }}>
                  {itinerary.organization.email}
                  {itinerary.organization.phone && ` • ${itinerary.organization.phone}`}
                </Text>
              )}
              {itinerary.organization.website && (
                <Text style={{ fontSize: 8, color: '#3B82F6', marginTop: 2 }}>
                  {itinerary.organization.website}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Trip Title */}
        <Text style={styles.title}>{itinerary.destination}</Text>
        <Text style={styles.dateRange}>{formatDateRange()}</Text>
        <Text style={styles.travelers}>
          {itinerary.adults} Adult{itinerary.adults > 1 ? 's' : ''}
          {itinerary.children > 0 && `, ${itinerary.children} Child${itinerary.children > 1 ? 'ren' : ''}`}
        </Text>

        {/* Customer Info */}
        {itinerary.customer_name && (
          <View style={{ marginBottom: 20, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 8 }}>
            <Text style={{ fontSize: 12, color: '#1F2937', fontWeight: 'bold', marginBottom: 4 }}>
              Prepared for: {itinerary.customer_name}
            </Text>
            {itinerary.customer_email && (
              <Text style={{ fontSize: 10, color: '#4B5563' }}>
                Email: {itinerary.customer_email}
              </Text>
            )}
            {itinerary.customer_phone && (
              <Text style={{ fontSize: 10, color: '#4B5563' }}>
                Phone: {itinerary.customer_phone}
              </Text>
            )}
            {itinerary.special_requests && (
              <Text style={{ fontSize: 10, color: '#DC2626', marginTop: 4, fontStyle: 'italic' }}>
                Special Request: {itinerary.special_requests}
              </Text>
            )}
          </View>
        )}

        {/* Itinerary Days */}
        <Text style={styles.sectionTitle}>Day-by-Day Itinerary</Text>

        {itineraryData.days.map((day: any, index: number) => (
          <View key={index} style={styles.dayContainer} wrap={false}>
            <View style={styles.dayHeader}>
              <View>
                <Text style={styles.dayNumber}>Day {day.day_number}</Text>
                <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
              </View>
              <Text style={styles.dayLocation}>{day.location}</Text>
            </View>

            {day.title && (
              <Text style={styles.dayTitle}>{day.title}</Text>
            )}

            {day.narrative && (
              <Text style={styles.narrative}>{day.narrative}</Text>
            )}

            {day.meals && (
              <Text style={styles.meals}>Meals: {day.meals}</Text>
            )}

            {day.hotel && (
              <Text style={styles.hotel}>Hotel: {day.hotel}</Text>
            )}
          </View>
        ))}

        {/* Hotels Section */}
        {itinerary.hotels_used && itinerary.hotels_used.length > 0 && (
          <View style={styles.hotelSection} wrap={false}>
            <Text style={styles.sectionTitle}>Your Accommodations</Text>
            <View style={styles.hotelGrid}>
              {itinerary.hotels_used.map((hotel: any, index: number) => (
                <View key={index} style={styles.hotelCard} wrap={false}>
                  {hotel.image_url && (
                    <Image
                      src={hotel.image_url}
                      style={styles.hotelImage}
                    />
                  )}
                  <View style={styles.stars}>
                    {[...Array(hotel.star_rating || 0)].map((_, i) => (
                      <Text key={i} style={styles.star}>★</Text>
                    ))}
                  </View>
                  <Text style={styles.hotelName}>{hotel.hotel_name}</Text>
                  <Text style={styles.hotelInfo}>{hotel.city}</Text>
                  {hotel.google_rating && (
                    <Text style={styles.hotelInfo}>Google Rating: {hotel.google_rating}/5</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tours/Sightseeing Section */}
        {itinerary.tours_visited && itinerary.tours_visited.length > 0 && (
          <View style={styles.tourSection} wrap={false}>
            <Text style={styles.sectionTitle}>Sightseeing Highlights</Text>
            <View style={styles.tourGrid}>
              {itinerary.tours_visited.map((tour: any, index: number) => (
                <View key={index} style={styles.tourCard} wrap={false}>
                  {tour.photo_url_1 && (
                    <Image
                      src={tour.photo_url_1}
                      style={styles.tourImage}
                    />
                  )}
                  <Text style={styles.tourName}>{tour.tour_name}</Text>
                  <Text style={styles.hotelInfo}>{tour.city}</Text>
                  {tour.description && (
                    <Text style={styles.tourDescription}>
                      {tour.description.length > 150
                        ? tour.description.substring(0, 150) + '...'
                        : tour.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Inclusions & Exclusions */}
        <View style={styles.inclusionsSection} wrap={false}>
          <Text style={styles.sectionTitle}>What's Included & Excluded</Text>
          <View style={styles.inclusionsGrid}>
            <View style={styles.inclusionsColumn}>
              <View style={styles.inclusionBox}>
                <Text style={styles.inclusionTitle}>✓ Inclusions</Text>
                <Text style={styles.inclusionItem}>• Accommodation in mentioned hotels</Text>
                <Text style={styles.inclusionItem}>• All tours and activities</Text>
                <Text style={styles.inclusionItem}>• All transfers and transportation</Text>
                <Text style={styles.inclusionItem}>• Professional tour guides</Text>
                <Text style={styles.inclusionItem}>• Entrance fees to attractions</Text>
              </View>
            </View>
            <View style={styles.inclusionsColumn}>
              <View style={styles.exclusionBox}>
                <Text style={styles.exclusionTitle}>✗ Exclusions</Text>
                <Text style={styles.exclusionItem}>• International flights</Text>
                <Text style={styles.exclusionItem}>• Personal expenses</Text>
                <Text style={styles.exclusionItem}>• Drinks at meals</Text>
                <Text style={styles.exclusionItem}>• Tips and gratuities</Text>
                <Text style={styles.exclusionItem}>• Travel insurance</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Price Per Person */}
        {itinerary.price_per_person && (
          <View style={styles.pricingSummary} wrap={false}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Price Per Person:</Text>
              <Text style={styles.totalValue}>
                €{parseFloat(itinerary.price_per_person).toFixed(2)}
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
              Based on {itinerary.adults + itinerary.children} traveler{(itinerary.adults + itinerary.children) !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerBrand}>Travel Quote AI</Text>
            <Text style={styles.footerText}>travelquoteai.com</Text>
          </View>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export default ItineraryPDF;
