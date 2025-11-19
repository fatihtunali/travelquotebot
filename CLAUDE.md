# Claude Code Session Notes - Travel Quote AI

## Critical Information

### Server & Port Management ⚠️

#### Local Development (Windows)
- **✅ ONLY port 3003** for TQA app (safe to kill)
- **❌ NEVER kill other Node.js processes** - they belong to other projects
- **✅ Always verify port** before killing any process
- **✅ Use `npm run dev`** to start on port 3003

#### Production Server (134.209.137.11)
- **✅ TQA app:** Port 3003 (user: `tqa`, PM2 name: `tqa-app`)
- **❌ DO NOT TOUCH:** Ports 3000, 3001, 3002 (other users' services)
- **✅ App location:** `/home/tqa/aipricing`
- **✅ PM2 restart:** `sudo -u tqa pm2 restart tqa-app --update-env`
- **✅ Rebuild:** `sudo -u tqa npm run build`

### Deployment Process
```bash
ssh root@134.209.137.11
cd /home/tqa/aipricing
git pull origin master
sudo -u tqa npm run build
sudo -u tqa pm2 restart tqa-app --update-env
```

---

## Database Schema Notes

### Airport Transfers
- **❌ NOT in `vehicle_pricing`** - Migrated to `intercity_transfers` table
- Query from `intercity_transfers` WHERE `from_city LIKE '%Airport' OR to_city LIKE '%Airport'`

### Tour Pricing
- Tours have BOTH SIC and PRIVATE pricing in `tour_pricing` table
- Don't filter by `tour_type` column - select appropriate price column instead
- Use: `tour_type === 'SIC' ? 'tp.sic_price_2_pax' : 'tp.pvt_price_2_pax'`

### Vehicles Table Differences
- **vehicles table:** No `created_by`, no `updated_at`, status: `'active'|'inactive'`
- **vehicle_pricing table:** Has `created_by`, no `updated_at`, status: `'active'|'inactive'|'archived'`
- Other pricing tables: Most have `updated_at` columns

### Next.js 16 Breaking Change
- `params` is now a Promise - must await: `const { orgId } = await params`

---

## Recent Sessions Summary

### November 19, 2025 - Dark Mode Removal

**Issue:** Pages were displaying in dark mode, user requested complete removal of all dark mode functionality.

**Changes Made:**
1. **Logo Component** (`components/Logo.tsx`)
   - Removed `'dark'` from variant type definition (Line 4)
   - Removed dark color from `textColors` object (Lines 15-19)
   - Simplified conditional logic - removed dark mode checks (Line 82)

2. **Updated All Logo Usages:**
   - `app/plan-trip/page.tsx` (Line 246): Changed `variant="dark"` to `variant="gradient"`
   - `app/itinerary-preview/page.tsx` (Line 97): Changed `variant="dark"` to `variant="gradient"`
   - `app/features/page.tsx` (Lines 12, 270): Changed `variant="dark"` to `variant="gradient"`

**Verification:**
- ✅ Searched for `dark:` Tailwind classes - none found
- ✅ Build passed successfully (TypeScript + Next.js)
- ✅ Production deployment successful

**Files Modified:** 5 files
- `components/Logo.tsx`
- `app/plan-trip/page.tsx`
- `app/itinerary-preview/page.tsx`
- `app/features/page.tsx`
- `app/globals.css` (removed dark mode media query)

**Additional Fix - globals.css:**
After initial deployment, user reported dashboard pages still showing dark mode. Root cause: `app/globals.css` contained `@media (prefers-color-scheme: dark)` query (lines 15-20) that activated dark mode when user's OS/browser had dark mode enabled. Removed this media query completely.

**Result:** All dark mode references removed, pages now display only in light mode with gradient logo variant regardless of system preferences.

**Commits:**
- `c4accfc` - "Remove all dark mode references from the project"
- `293fa40` - "Remove dark mode media query from globals.css"

---

### October 26, 2025 - Airport Transfer Migration & Tour Pricing Fix

**Critical Fixes:**
1. **Airport transfers** - Updated queries to use `intercity_transfers` table
   - Fixed: `app/api/itinerary/preview/route.ts`, `app/api/itinerary/generate/route.ts`, `app/api/pricing/items/[orgId]/route.ts`

2. **PRIVATE tour availability** - Changed from filtering by tour_type to checking price columns
   - Before: PRIVATE bookings showed 0 tours
   - After: Shows all 13 available tours

3. **Hotel/tour images** - Fixed ID extraction in `app/api/itinerary/[id]/route.ts`
   - Changed `item.id` to `item.hotel_id` and `item.tour_id`

4. **AI airport transfers** - Updated `app/api/quotes/[orgId]/ai-generate/route.ts`
   - Made airport transfers MANDATORY in AI prompt
   - Fixed transfer item format

**Commits:** `40c8847`, `1b1ea41`

---

### October 25, 2025 - Excel Import/Export & OpenStreetMap

**Features:**
1. **Excel import/export** - Vehicles with proper date formatting (handles Excel serial numbers)
2. **Dynamic filters** - Generated from database, not hardcoded
3. **Intercity transfers & flights** - New tables, API routes, UI at `/dashboard/pricing/transfers`
4. **Hotel search** - Added debounce (500ms), searches hotel_name AND city
5. **OpenStreetMap** - Replaced Google Maps with free Leaflet.js
   - Files: `app/components/ItineraryMap.tsx`, `app/components/ItineraryMapClient.tsx`
   - Dependencies: `leaflet react-leaflet @types/leaflet`
6. **AI meal checking** - Reads tour inclusions to add L/D to meals field

**Database:**
- Tables: `intercity_transfers`, `flight_pricing`
- Migrated 85 airport transfers from `vehicle_pricing`

**Architecture Fixes:**
- Input validation on pagination (prevents DoS)
- Race condition fix with AbortController
- TypeScript type safety (removed all `any` types)
- Database indexes for search optimization

---

### October 25, 2025 - Google API Cost Management

**Critical:** All Google APIs DISABLED to prevent overcharges

**Changes:**
- `.env.local`: API keys set to empty strings
- `lib/googlePlaces.ts`: All functions return empty/null (code preserved in comments)
- `app/components/ItineraryMap.tsx`: Now uses OpenStreetMap instead
- `app/admin/dashboard/google-places/page.tsx`: Warning banner added

**What's Blocked:**
- ❌ Google Places API (Text Search, Place Details, Photos)
- ❌ Google Maps API (JavaScript API, Map tiles, Geocoding)
- ✅ Uses cached database data only

**Re-enabling:** Uncomment API keys and code blocks when needed

---

### October 22, 2025 - CRUD Operations & Testing

**Fixes:**
- `app/api/pricing/vehicles/route.ts` - Removed `created_by`, `updated_at` column references
- `tests/test-crud-operations.ts` - Added authentication (operator login required)
- Fixed soft delete status values: "inactive" for vehicles, "archived" for pricing

**Test Infrastructure:**
- 28 tests across 7 categories (Hotels, Tours, Vehicles, Guides, Entrance Fees, Meals, Extras)
- Test operator: `operator@test.com` / `test123` (Org ID: 2)
- Run from: `/admin/dashboard/system-tests` (removed from operator dashboard)

**Scripts:**
- `scripts/create-test-operator.js` - Creates test account
- `database/create-test-operator.sql` - SQL alternative

---

## Technical Patterns

### Excel Date Handling
```typescript
// Export: Date objects with cell type 'd', format 'dd/mm/yyyy'
// Import: Handle Excel serial numbers (days since 1900-01-01)
if (typeof dateValue === 'number') {
  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
}
```

### Debounce Pattern
```typescript
useEffect(() => {
  const timer = setTimeout(() => setDebouncedValue(value), 500);
  return () => clearTimeout(timer);
}, [value]);
```

### Dynamic Filters
```typescript
const uniqueValues = ['All', ...Array.from(new Set(data.map(i => i.field))).sort()];
```

---

## Important Files

### API Routes
- `app/api/itinerary/preview/route.ts` - Uses intercity_transfers
- `app/api/itinerary/generate/route.ts` - Uses intercity_transfers
- `app/api/itinerary/[id]/route.ts` - Fixed hotel/tour ID extraction
- `app/api/pricing/items/[orgId]/route.ts` - Migrated to intercity_transfers
- `app/api/quotes/[orgId]/ai-generate/route.ts` - AI prompt improvements
- `app/api/pricing/vehicles/route.ts` - CRUD fixes
- `app/api/pricing/hotels/route.ts` - Search optimization, validation
- `app/api/pricing/intercity-transfers/route.ts` - Transfers CRUD
- `app/api/pricing/flights/route.ts` - Flights CRUD

### Frontend
- `app/dashboard/pricing/vehicles/page.tsx` - Excel import/export, dynamic filters
- `app/dashboard/pricing/hotels/page.tsx` - Debounce, TypeScript types, race condition fix
- `app/dashboard/pricing/transfers/page.tsx` - 3-tab UI (Airport, Intercity, Flights)
- `app/components/ItineraryMap.tsx` - OpenStreetMap wrapper
- `app/components/ItineraryMapClient.tsx` - Leaflet map component

### Database
- `database/transfers-schema.sql` - Intercity transfers & flights tables
- `database/migrations/add-hotels-search-indexes.sql` - Search performance indexes
- `scripts/migrate-airport-transfers.sql` - Airport transfer migration

---

## Security & Best Practices

### Security Rules
1. **🔐 NEVER include actual API keys/passwords in CLAUDE.md** - Use placeholders
2. **🔐 NEVER commit .env files**
3. **🔐 If secrets exposed in git:**
   - Remove from file
   - `git commit --amend --no-edit`
   - `git push --force origin master`
   - Rotate secrets immediately

### Development Rules
1. **Always test as operator**, not super_admin (for CRUD with organizationId)
2. **Check database schema** before assuming columns exist
3. **Excel date handling** - Always support serial numbers on import
4. **Dynamic filters** - Never hardcode, generate from data
5. **Next.js 16** - Await params in dynamic routes
6. **Google APIs** - DISABLED, use cached data only

---

## Commands Reference

```bash
# Development
npm run dev                                    # Start local server (port 3003)
npm run build                                  # Build production

# Testing
node scripts/create-test-operator.js           # Create test operator account
# Then in browser console: runAllCRUDTests("operator@test.com", "test123")

# Production deployment
ssh root@134.209.137.11
cd /home/tqa/aipricing
git pull origin master
sudo -u tqa npm run build
sudo -u tqa pm2 restart tqa-app --update-env
```

---

## Known Issues & Limitations

1. **Excel import** - Deletes all data before import, sequential API calls (could be batched)
2. **Test data cleanup** - Tests create real data, may need periodic cleanup
3. **Google APIs** - Disabled, won't re-enable without user confirmation

---

## Next Steps (Planned)

### Quote Customization System
- Allow operators to manually select/change hotels and tours
- Lock selections so AI doesn't override when regenerating
- Add `quote_preferences` JSON field for locked selections
- Build UI for hotel/tour selection in quote edit page

---

**Last Updated:** October 26, 2025
**Status:** All systems operational, Google APIs disabled by design
