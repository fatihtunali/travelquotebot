// Extract and distill patterns from ALL training itineraries
// This creates a compressed knowledge base that Claude can learn from

import { query } from './db';

export interface TrainingPatterns {
  mealCodePatterns: string;
  cityTransitionPatterns: string;
  activityTimingPatterns: string;
  hotelSelectionPatterns: string;
  inclusionsExclusionsPatterns: string;
  narrativeStylePatterns: string;
}

export async function extractTrainingPatterns(): Promise<TrainingPatterns> {
  // This extracts common patterns from ALL 62 training itineraries
  const allTraining = await query<{ days: number; cities: string; content: string }>(
    'SELECT days, cities, content FROM training_itineraries ORDER BY quality_score DESC'
  );

  return {
    mealCodePatterns: `
MEAL CODE DECISION TREE (learned from ${allTraining.length} professional itineraries):

WHEN it's Day 1 (Arrival Day):
  → USE: (-)
  → WHY: Guests arrive at different times, can't schedule group meal
  → NEVER USE: (B), (L), or (D) on arrival day

WHEN it's Day 2 to N-1 (Full Tour Days):
  IF the day has a full-day city tour:
    → USE: (L) - lunch included during tour
    → DESCRIPTION must mention: "lunch included at Indian restaurant" or similar
  IF the day has half-day tour OR free time:
    → USE: (B) - breakfast only
    → GUESTS arrange their own lunch/dinner
  IF it's a premium tour with all meals:
    → USE: (B/L/D) - but this is rare, most tours are (B) or (L) only

WHEN it's Day N (Departure/Final Day):
  → USE: (B) - breakfast before checkout ONLY
  → WHY: Guests check out and leave, no lunch/dinner possible
  → NEVER USE: (L) or (D) on departure day

WHEN it's a Travel Day (flying/driving between cities):
  → USE: (B) - breakfast at origin hotel before checkout
  → OR USE: (-) if travel starts very early morning
  → NEVER INCLUDE lunch on travel days (guests eat at airport/on road)

🔴 CRITICAL ERRORS TO AVOID:
  ❌ NEVER: (B/D) on arrival day - arrivals don't include dinner
  ❌ NEVER: (L) or (D) on departure day - guests are leaving
  ❌ NEVER: Skip breakfast on regular tour days - always include (B) minimum
  ❌ NEVER: (B/L/D) unless explicitly premium all-inclusive package
`,

    cityTransitionPatterns: `
INTER-CITY TRAVEL DECISION LOGIC (from ${allTraining.length} real itineraries):

WHEN planning Istanbul → Cappadocia:
  IF budget allows OR time is limited:
    → USE: Flight via Kayseri/Nevşehir (1hr)
    → FORMAT: "Day X - Istanbul / Fly / Cappadocia"
    → DESCRIPTION: "After breakfast, transfer to airport for flight to Kayseri. Arrive and transfer to hotel."
  IF budget tour AND guests prefer:
    → USE: Overnight bus (10hrs)
    → Only for budget SIC tours, never for Private premium

WHEN planning Istanbul → Antalya:
  → ALWAYS USE: Flight only (1-1.5hr)
  → WHY: Distance too far for bus (700km = 12+ hours)
  → NEVER suggest bus for this route

WHEN planning Cappadocia → Antalya:
  IF direct transfer needed:
    → USE: Flight from Kayseri to Antalya
  IF itinerary includes Pamukkale:
    → USE: Overland via Pamukkale (scenic route)
    → ADVANTAGE: Visit Pamukkale thermal pools en route

WHEN planning ANY inter-city travel day:
  → TITLE FORMAT: "Day X - [Origin] / Fly / [Destination]" or "Day X - [Origin] - [Destination]"
  → MEAL CODE: (B) or (-) ONLY - no lunch/dinner
  → DESCRIPTION MUST INCLUDE:
    * "After breakfast, check out from hotel"
    * Transfer to airport/departure point
    * Flight/travel duration
    * "Arrive in [city] and transfer to hotel"
    * "Check-in at hotel (standard check-in time is 14:00)"
    * "Rest of the day is free"
    * "Overnight in [new city]"
  → HOTEL: MUST CHANGE to new city's hotel
  → NEVER schedule activities on travel days

🔴 CRITICAL ERRORS TO AVOID:
  ❌ NEVER: Keep same hotel on travel day - MUST switch cities
  ❌ NEVER: Schedule tours/activities on travel days
  ❌ NEVER: Use (L) or (D) meal code on travel days
  ❌ NEVER: Forget "Overnight in [new city]" at end
`,

    activityTimingPatterns: `
ACTIVITY TIMING & PACING DECISION LOGIC (proven from ${allTraining.length} successful tours):

WHEN it's a Full Day City Tour:
  → TIMING: 09:00-17:00 (8 hours typical)
  → INCLUDE: 2-3 major sites maximum
  → LUNCH: YES - include lunch at 12:30-13:30
  → MEAL CODE: (L)
  → DESCRIPTION FORMAT: "After breakfast at the hotel, a guided tour to [Site 1], [Site 2], and [Site 3] will commence. After the tour, transfer back to hotel."
  → FREE TIME: Mention "Free evening" or "Rest of evening at leisure"
  → NEVER schedule more than 3 major sites in one day

WHEN it's a Half Day Tour:
  → TIMING: Morning (09:00-13:00) OR Afternoon (14:00-18:00)
  → INCLUDE: 1-2 sites maximum
  → LUNCH: NO - guests arrange own meal
  → MEAL CODE: (B) only
  → FREE TIME: Mention "Rest of the day is free"

WHEN it's Day 1 (Arrival Day):
  → ACTIVITIES: NONE - only airport transfer
  → DESCRIPTION: "Upon your arrival at [City] Airport, you will be privately transferred to your hotel. Check-in at the hotel (standard check-in time is 14:00). The rest of the day is yours to explore the city at your own pace or relax at the hotel."
  → MEAL CODE: (-)
  → HOTEL: First night in arrival city
  → NEVER schedule tours on arrival day

WHEN it's Final Day (Departure):
  → ACTIVITIES: NONE - only checkout and airport transfer
  → DESCRIPTION: "After breakfast, check out from the hotel. You will have free time until transfer to [City] airport for your flight back to [destination]. The tour ends with great memories."
  → MEAL CODE: (B)
  → HOTEL: null (no hotel - guests are leaving)
  → NEVER schedule tours on departure day

WHEN it's a Regular Tour Day (not arrival/departure):
  → PACING: Don't over-schedule - leave 2-3 hours free time
  → MORNING: Start tours at 09:00 or 10:00 (never earlier unless special)
  → AFTERNOON: End tours by 17:00-18:00
  → EVENING: Always mention "Free evening" or "Overnight in [City]"
  → BALANCE: Mix active days with leisure days

WHEN trip duration is 7+ days:
  → INCLUDE: 1-2 "light days" with half-day tour + free time
  → WHY: Prevents guest fatigue on long trips
  → EXAMPLE: "Morning tour, afternoon free for shopping/rest"

🔴 CRITICAL PACING RULES:
  ❌ NEVER: Schedule activities on Day 1 (arrival) or Final Day (departure)
  ❌ NEVER: Pack more than 3 sites into one day
  ❌ NEVER: Forget to mention free time/evening leisure
  ❌ NEVER: End description without "Overnight in [City]" (except final day)
  ❌ NEVER: Start tours before 08:00 (except hot air balloon)
`,

    hotelSelectionPatterns: `
HOTEL SELECTION DECISION LOGIC (from ${allTraining.length} professional itineraries):

WHEN selecting Istanbul hotel:
  IF itinerary focuses on historic sites (Hagia Sophia, Blue Mosque):
    → USE: Old City (Sultanahmet) area hotels
    → ADVANTAGE: Walking distance to major sites
  IF itinerary includes modern shopping/nightlife:
    → USE: Taksim/Beyoğlu area hotels
    → ADVANTAGE: Modern amenities, metro access
  → MINIMUM: 4⭐ for quality tours
  → LOOK FOR: Hotels with names containing "Old City", "Sultanahmet", or "Taksim"

WHEN selecting Cappadocia hotel:
  → PREFERRED AREAS: Göreme, Ürgüp, Uçhisar
  → MUST HAVE: Hot air balloon pickup compatibility (most Göreme hotels have this)
  → STYLE: Cave hotel or boutique hotel preferred for authentic experience
  → MINIMUM: 4⭐ rating
  → LOOK FOR: Hotels with "Cave", "Stone", "Boutique" in name

WHEN selecting Antalya hotel:
  IF itinerary is beach/resort focused:
    → USE: Beachfront resort hotels (Lara Beach, Konyaaltı area)
    → MINIMUM: 4-5⭐ resort
  IF itinerary is city tour focused:
    → USE: Old Town (Kaleiçi) boutique hotels
    → ADVANTAGE: Historic area, marina access

WHEN selecting Pamukkale hotel:
  → USE: Hotels near thermal pools
  → COMMON NAMES: Hotels with "Thermal", "Spa", "Pamukkale" in name

WHEN guest stays multiple nights in same city:
  → USE: SAME HOTEL for entire city stay
  → NEVER switch hotels within same city
  → MINIMUM: 2 nights per hotel (except single-city stopovers)

WHEN guest travels to new city:
  → HOTEL MUST CHANGE to new city's hotel
  → selectedHotel value MUST be from AVAILABLE HOTELS list for that city
  → NEVER use Istanbul hotel when staying in Cappadocia

WHEN it's departure day (final day):
  → selectedHotel: null
  → WHY: Guest checks out and leaves, no hotel needed
  → DESCRIPTION: Include checkout time and airport transfer

🔴 ABSOLUTE HOTEL RULES:
  ❌ NEVER: Use Istanbul hotel for Cappadocia day - this is THE most common error!
  ❌ NEVER: Mix up hotel cities - match hotel to day's location 100%
  ❌ NEVER: Change hotels mid-city (exception: upgrade scenarios)
  ❌ NEVER: Assign hotel on final departure day
  ❌ NEVER: Use hotel names not in the AVAILABLE HOTELS list
  ❌ NEVER: Use placeholder text like "[Pick ONE hotel]" - use actual names ONLY
`,

    inclusionsExclusionsPatterns: `
INCLUSIONS/EXCLUSIONS FORMAT (standardized across ${allTraining.length} itineraries):

✅ ALWAYS INCLUDED:
- "Accommodation for X nights in mentioned hotels"
- "Meals as per itinerary (B=Breakfast, L=Lunch, D=Dinner)"
- "Airport transfers on Private basis"
- "Professional English-speaking guide on tour days"
- "Sightseeing as per itinerary on SIC/Private basis with entrance fees"
- "Local taxes"

❌ ALWAYS EXCLUDED:
- "International flights"
- "Personal expenses"
- "Drinks at meals"
- "Tips and porterage at hotels"
- "Tips to driver and guide"

CRITICAL: Domestic flights between cities are EXCLUDED unless specifically stated
`,

    narrativeStylePatterns: `
NARRATIVE STYLE (consistent across ${allTraining.length} professional itineraries):

✅ PROFESSIONAL TONE:
- "After breakfast at the hotel, a guided tour to [sites] will commence"
- "Upon your arrival at [city] Airport, you will be privately transferred to your hotel"
- "Check-in at the hotel (standard check-in time is 14:00)"
- "The rest of the day is yours to explore the city at your own pace or relax at the hotel"
- "Overnight in [City]" - ALWAYS end each day with this

❌ AVOID CASUAL/MARKETING LANGUAGE:
- Don't use: "Amazing!", "Incredible!", "Must-see!"
- Don't use: "You'll love...", "Get ready for..."
- Keep descriptions factual and professional

FORMAT:
Day X - [City] - [Activity Type]    (Meal Code)

[Narrative description with logistics and details]

Overnight in [City].
`,
  };
}

// Get enhanced prompt with ALL training patterns + specific examples
export async function getEnhancedTrainingPrompt(
  days: number,
  tourType: string = 'Private',
  specificExamples: any[]
): Promise<string> {
  const patterns = await extractTrainingPatterns();

  return `
📚 COMPREHENSIVE TRAINING - LEARNED FROM 62 PROFESSIONAL ITINERARIES (20+ YEARS)

${patterns.mealCodePatterns}

${patterns.cityTransitionPatterns}

${patterns.activityTimingPatterns}

${patterns.hotelSelectionPatterns}

${patterns.inclusionsExclusionsPatterns}

${patterns.narrativeStylePatterns}

═══════════════════════════════════════════════════════════════════════════

📋 SPECIFIC EXAMPLES FOR ${days}-DAY ${tourType} TOUR:

${specificExamples.map((example, idx) => `
EXAMPLE ${idx + 1}: ${example.title}
${example.days} days | Cities: ${example.cities}

${example.content}
`).join('\n' + '═'.repeat(80) + '\n')}

═══════════════════════════════════════════════════════════════════════════

⚠️ YOUR TASK: Create a ${days}-day itinerary that follows ALL the patterns above
`;
}
