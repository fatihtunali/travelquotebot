import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { authenticateRequest } from '@/lib/security';

// POST - Recalculate pricing for all itineraries in an organization
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const connection = await pool.getConnection();

  try {
    const { orgId } = await params;
    const orgIdNum = parseInt(orgId);

    // Authorization check
    const auth = await authenticateRequest(request, {
      requireOrgId: true,
      checkOrgMatch: orgIdNum
    });

    if (!auth.authorized || !auth.user) {
      return auth.error!;
    }

    await connection.beginTransaction();

    // Fetch all itineraries for this organization
    const [itineraries]: any = await connection.query(
      `SELECT id, adults, children, itinerary_data
       FROM customer_itineraries
       WHERE organization_id = ?`,
      [orgId]
    );

    console.log(`🔄 Recalculating prices for ${itineraries.length} itineraries...`);

    let updatedCount = 0;
    const errors: string[] = [];

    for (const itinerary of itineraries) {
      try {
        // Parse itinerary data
        const itineraryData = typeof itinerary.itinerary_data === 'string'
          ? JSON.parse(itinerary.itinerary_data)
          : itinerary.itinerary_data;

        // Recalculate pricing using the correct logic
        const pricing = calculatePricing(itineraryData, itinerary.adults, itinerary.children);

        // Update the database
        await connection.query(
          `UPDATE customer_itineraries
           SET total_price = ?,
               price_per_person = ?,
               updated_at = NOW()
           WHERE id = ?`,
          [pricing.total, pricing.per_person, itinerary.id]
        );

        updatedCount++;
        console.log(`✅ Updated itinerary ${itinerary.id}: €${pricing.per_person.toFixed(2)}/person`);

      } catch (error) {
        const errorMsg = `Failed to recalculate itinerary ${itinerary.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        errors.push(errorMsg);
      }
    }

    await connection.commit();

    console.log(`✅ Recalculation complete: ${updatedCount}/${itineraries.length} itineraries updated`);

    return NextResponse.json({
      success: true,
      message: `Recalculated ${updatedCount} itineraries`,
      updated: updatedCount,
      total: itineraries.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error recalculating prices:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate prices', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Same calculatePricing function from ai-generate route
function calculatePricing(itinerary: any, adults: number, children: number): any {
  const totalPeople = adults + children;

  let hotels_per_person = 0;
  let tours_per_person = 0;
  let vehicles_per_person = 0;
  let guides_per_person = 0;
  let entrance_fees_per_person = 0;
  let meals_per_person = 0;
  let extras_per_person = 0;

  if (itinerary.days) {
    itinerary.days.forEach((day: any) => {
      if (day.items) {
        day.items.forEach((item: any) => {
          const price = parseFloat(item.price_per_unit) || 0;
          const quantity = parseInt(item.quantity) || 1;

          let totalGroupCost = 0;
          let perPersonCost = 0;

          if (item.type === 'hotel') {
            // Hotels: price_per_unit is ALREADY per person per night, quantity is always 1
            const nights = parseInt(item.nights) || quantity || 1;
            perPersonCost = price * nights;  // e.g., €230 × 1 night = €230 per person
            totalGroupCost = perPersonCost * totalPeople;  // €230 × 30 = €6,900 group total
            hotels_per_person += perPersonCost;
          } else if (item.type === 'tour' || item.type === 'entrance_fee' || item.type === 'meal') {
            // Tours/entrance/meals: price is per person, quantity is number of people
            totalGroupCost = price * quantity;  // e.g., €150 × 30 = €4,500 group total
            perPersonCost = totalPeople > 0 ? totalGroupCost / totalPeople : 0;  // €4,500 ÷ 30 = €150 per person
            if (item.type === 'tour') tours_per_person += perPersonCost;
            else if (item.type === 'entrance_fee') entrance_fees_per_person += perPersonCost;
            else meals_per_person += perPersonCost;
          } else if (item.type === 'vehicle' || item.type === 'transfer' || item.type === 'guide') {
            // Vehicles/transfers/guides: fixed group price
            totalGroupCost = price * quantity;  // e.g., €250 × 1 = €250 group total
            perPersonCost = totalPeople > 0 ? totalGroupCost / totalPeople : 0;  // €250 ÷ 30 = €8.33 per person
            if (item.type === 'vehicle' || item.type === 'transfer') vehicles_per_person += perPersonCost;
            else guides_per_person += perPersonCost;
          } else if (item.type === 'extra') {
            totalGroupCost = price * quantity;
            perPersonCost = totalPeople > 0 ? totalGroupCost / totalPeople : 0;
            extras_per_person += perPersonCost;
          }
        });
      }
    });
  }

  const per_person_total = hotels_per_person + tours_per_person + vehicles_per_person +
                           guides_per_person + entrance_fees_per_person + meals_per_person + extras_per_person;
  const group_total = per_person_total * totalPeople;

  return {
    per_person: per_person_total,
    total: group_total,
    breakdown: {
      hotels: hotels_per_person,
      tours: tours_per_person,
      vehicles: vehicles_per_person,
      guides: guides_per_person,
      entrance_fees: entrance_fees_per_person,
      meals: meals_per_person,
      extras: extras_per_person
    }
  };
}
