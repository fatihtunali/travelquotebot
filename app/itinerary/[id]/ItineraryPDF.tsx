import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

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
  dayTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
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
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  overviewValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
});

interface ItineraryPDFProps {
  itinerary: any;
  data: any;
}

export const ItineraryPDF: React.FC<ItineraryPDFProps> = ({ itinerary, data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {itinerary.company_name && (
            <Text style={styles.companyName}>{itinerary.company_name}</Text>
          )}
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>
            {itinerary.customerName} • {itinerary.numberOfTravelers} travelers
          </Text>
        </View>

        {/* Trip Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Overview</Text>
          <Text style={styles.text}>{data.summary}</Text>

          <View style={styles.overviewBox}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Duration</Text>
              <Text style={styles.overviewValue}>
                {itinerary.duration || data.days?.length || 'N/A'} Days
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Start Date</Text>
              <Text style={styles.overviewValue}>
                {itinerary.startDate ? new Date(itinerary.startDate + 'T00:00:00').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'Flexible'}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Travel Style</Text>
              <Text style={styles.overviewValue}>
                {itinerary.budget === 'budget' ? 'Value'
                  : itinerary.budget === 'moderate' ? 'Comfort'
                  : itinerary.budget === 'luxury' ? 'Premium'
                  : 'Standard'}
              </Text>
            </View>
          </View>
        </View>

        {/* Day by Day Itinerary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Day by Day Itinerary</Text>
          {data.days && data.days.map((day: any, index: number) => {
            const formattedDate = day.date ? new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric'
            }).replace(/\//g, '/') : '';

            return (
              <View key={index} style={styles.dayContainer} break={index > 0 && index % 2 === 0}>
                <Text style={styles.dayHeader}>
                  {formattedDate} - Day {day.dayNumber || day.day} - {day.title?.replace(/Day \d+ - /, '')} {day.mealCode}
                </Text>
                <Text style={styles.dayText}>{day.description}</Text>

                {day.activities && Array.isArray(day.activities) && day.activities.length > 0 && (
                  <View style={{ marginTop: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#2563eb', marginBottom: 3 }}>
                      Activities & Highlights:
                    </Text>
                    {day.activities.map((activity: string, i: number) => (
                      <Text key={i} style={styles.activityItem}>• {activity}</Text>
                    ))}
                  </View>
                )}

                {day.restaurants && Array.isArray(day.restaurants) && day.restaurants.length > 0 && (
                  <View style={{ marginTop: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#ea580c', marginBottom: 3 }}>
                      Dining:
                    </Text>
                    {day.restaurants.map((restaurant: string, i: number) => (
                      <Text key={i} style={styles.activityItem}>• {restaurant}</Text>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Page>

      {/* Pricing Page */}
      {itinerary.pricingTiers && itinerary.pricingTiers.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Pricing Details</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4-Star Hotels</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableCellHeader, { width: '20%' }]}>PAX</Text>
                <Text style={[styles.tableCellHeader, { width: '26%' }]}>Double Room</Text>
                <Text style={[styles.tableCellHeader, { width: '26%' }]}>Triple Room</Text>
                <Text style={[styles.tableCellHeader, { width: '28%' }]}>Single Supp.</Text>
              </View>
              {itinerary.pricingTiers.map((tier: any, index: number) => (
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
                    +{tier.currency} {Number(tier.four_star_single_supplement).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {data.inclusions && Array.isArray(data.inclusions) && data.inclusions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inclusions</Text>
              {data.inclusions.map((item: string, i: number) => (
                <Text key={i} style={styles.text}>✓ {item}</Text>
              ))}
            </View>
          )}

          {data.notes && Array.isArray(data.notes) && data.notes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Important Notes</Text>
              {data.notes.map((note: string, i: number) => (
                <Text key={i} style={styles.text}>⚠ {note}</Text>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            <Text>Generated with TravelQuoteBot • {new Date().toLocaleDateString()}</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};
