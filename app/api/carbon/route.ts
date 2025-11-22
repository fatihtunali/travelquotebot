import { NextRequest, NextResponse } from 'next/server';
import {
  calculateItineraryFootprint,
  estimateSimpleFootprint,
  CarbonFootprintResult
} from '@/lib/carbonCalculator';

/**
 * POST /api/carbon
 * Calculate carbon footprint for an itinerary
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Detailed calculation
      flights,
      transfers,
      hotelNights,
      hotelStars,
      totalPassengers,
      // Simple estimation
      days,
      hasFlights,
      totalKm,
      useSimpleEstimate
    } = body;

    let result: CarbonFootprintResult;

    if (useSimpleEstimate) {
      // Use simple estimation when detailed data is not available
      result = estimateSimpleFootprint(
        days || 0,
        hasFlights || false,
        totalKm || 0,
        totalPassengers || 1
      );
    } else {
      // Use detailed calculation with Climatiq API
      result = await calculateItineraryFootprint({
        flights,
        transfers,
        hotelNights,
        hotelStars,
        totalPassengers: totalPassengers || 1
      });
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    return NextResponse.json(
      { error: 'Failed to calculate carbon footprint' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/carbon
 * Get methodology and disclaimer information
 */
export async function GET() {
  return NextResponse.json({
    methodology: 'GHG Protocol, ISO 14064 compliant',
    dataSources: [
      'ICAO Carbon Emissions Calculator',
      'IATA Recommended Practice 1726',
      'UK DEFRA Emission Factors 2024',
      'Cornell Hotel Sustainability Benchmarking Index'
    ],
    disclaimer: 'Carbon emissions are estimates based on ICAO/IATA methodologies and Climatiq emission factors. Actual emissions may vary based on aircraft type, load factors, and operational conditions. Data provided for informational purposes only.',
    offsetProviders: [
      { name: 'Gold Standard', url: 'https://www.goldstandard.org' },
      { name: 'Verra', url: 'https://verra.org' }
    ]
  });
}
