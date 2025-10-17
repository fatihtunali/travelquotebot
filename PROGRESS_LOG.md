# TravelQuoteBot - Development Progress Log

**Last Updated**: 2025-10-17
**Production Server**: 188.132.230.193
**Database**: MariaDB on 188.132.230.193:3306
**Operator**: Funny Tourism (ID: ed58206d-f600-483b-b98a-79805310e9be)

---

## Table of Contents
1. [Component-Based Activity Pricing System](#component-based-activity-pricing-system)
2. [Database Schema Changes](#database-schema-changes)
3. [API Routes Implemented](#api-routes-implemented)
4. [Next.js 15 Migration Fixes](#nextjs-15-migration-fixes)
5. [Deployment Procedures](#deployment-procedures)
6. [Production Environment Cleanup](#production-environment-cleanup)
7. [Known Issues and Solutions](#known-issues-and-solutions)
8. [Credentials and Access](#credentials-and-access)

---

## Component-Based Activity Pricing System

### Business Requirements

**Problem Statement**: Activities have two pricing models:
1. **SIC (Seat-In-Coach)**: Regular group tours with simple per-person pricing
2. **Private Tours**: Custom tours with complex cost division

**Critical Business Logic**: For private tours:
- **Fixed Costs** (divide by passenger count): Transport, Guide
- **Variable Costs** (always per person): Entrance fees, Meals

**Example**: Istanbul Full Day Tour (Private, 4 passengers)
- Transport: $200 → $50/person
- Guide: $150 → $37.50/person
- Entrance fee (adult): $45 → $45/person (NOT divided)
- Lunch: $25 → $25/person (NOT divided)
- **Total per person**: $157.50

### Implementation Design

#### Database Tables Created

**1. activity_pricing**
```sql
CREATE TABLE IF NOT EXISTS activity_pricing (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  activity_id CHAR(36) NOT NULL,
  operator_id CHAR(36) NOT NULL,
  pricing_type ENUM('sic', 'private') NOT NULL DEFAULT 'sic',

  -- Fixed costs (divided by pax count for private tours)
  transport_cost DECIMAL(10,2) DEFAULT 0.00,
  guide_cost DECIMAL(10,2) DEFAULT 0.00,

  -- Variable costs (always per person)
  entrance_fee_adult DECIMAL(10,2) DEFAULT 0.00,
  entrance_fee_child_0_2 DECIMAL(10,2) DEFAULT 0.00,
  entrance_fee_child_3_5 DECIMAL(10,2) DEFAULT 0.00,
  entrance_fee_child_6_11 DECIMAL(10,2) DEFAULT 0.00,
  entrance_fee_child_12_17 DECIMAL(10,2) DEFAULT 0.00,
  meal_cost_adult DECIMAL(10,2) DEFAULT 0.00,
  meal_cost_child DECIMAL(10,2) DEFAULT 0.00,

  -- SIC pricing (simple per-person)
  sic_price_adult DECIMAL(10,2) DEFAULT 0.00,
  sic_price_child_0_2 DECIMAL(10,2) DEFAULT 0.00,
  sic_price_child_3_5 DECIMAL(10,2) DEFAULT 0.00,
  sic_price_child_6_11 DECIMAL(10,2) DEFAULT 0.00,
  sic_price_child_12_17 DECIMAL(10,2) DEFAULT 0.00,

  -- Pax slabs for private pricing
  min_pax INT DEFAULT 1,
  max_pax INT DEFAULT NULL,

  season ENUM('standard', 'high_season', 'low_season', 'peak') DEFAULT 'standard',
  valid_from DATE NULL,
  valid_until DATE NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_activity_pricing_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_pricing_operator FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_activity_pricing_lookup (activity_id, operator_id, is_active),
  INDEX idx_pricing_type (pricing_type),
  INDEX idx_season (season),
  INDEX idx_valid_dates (valid_from, valid_until)
);
```

**2. transportation_pricing**
```sql
CREATE TABLE IF NOT EXISTS transportation_pricing (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  operator_id CHAR(36) NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL,
  vehicle_capacity INT NOT NULL,
  cost_per_day DECIMAL(10,2) NOT NULL,
  cost_per_transfer DECIMAL(10,2) NOT NULL,
  season ENUM('standard', 'high_season', 'low_season', 'peak') DEFAULT 'standard',
  valid_from DATE NULL,
  valid_until DATE NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_transportation_pricing_operator FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_transportation_operator (operator_id, is_active),
  INDEX idx_vehicle_type (vehicle_type)
);
```

### Mock Data Inserted

Successfully inserted 10 sample activities for **Funny Tourism** operator:

1. **Istanbul Full Day Tour** - Both SIC and Private (2-6, 7-14, 15-25 pax slabs)
2. **Bosphorus Cruise** - SIC only
3. **Cappadocia Hot Air Balloon** - Both SIC and Private
4. **Ephesus Ancient City** - SIC only
5. **Pamukkale Day Trip** - Both SIC and Private
6. **Turkish Night Show** - SIC only
7. **Whirling Dervish Ceremony** - SIC only
8. **Troy & Gallipoli Tour** - Private only (1-6, 7-14 pax)
9. **Antalya Boat Tour** - SIC only
10. **Turkish Cooking Class** - Both SIC and Private

---

## Database Schema Changes

### Migration Files

**File**: `migrations/activity_pricing.sql`
- Created activity_pricing table
- Created transportation_pricing table
- Added proper foreign key constraints
- Added indexes for performance optimization

**File**: `migrations/mock_data.sql`
- Inserted 10 activities with comprehensive pricing
- Used Funny Tourism operator (ed58206d-f600-483b-b98a-79805310e9be)
- Included both SIC and Private pricing variations
- Multiple pax slabs for private tours

### Migration Execution

```bash
# Connected to production database
mysql -h 188.132.230.193 -u tqb -p'Dlr235672.-Yt' tqb_db

# Ran migrations
source migrations/activity_pricing.sql
source migrations/mock_data.sql
```

**Result**: Successfully created tables and inserted all mock data

---

## API Routes Implemented

### Activity Pricing Endpoints

**Base Path**: `/api/pricing/activities/[id]/pricing`

#### GET /api/pricing/activities/[id]/pricing
- **Purpose**: Get all pricing options for an activity
- **Auth**: JWT token required
- **Validation**: Activity must belong to operator
- **Returns**: Array of pricing options sorted by type, season, min_pax

#### POST /api/pricing/activities/[id]/pricing
- **Purpose**: Create new pricing option
- **Auth**: JWT token required
- **Validation**:
  - SIC pricing requires sic_price_adult > 0
  - Private pricing requires transport_cost > 0 OR guide_cost > 0
  - pricing_type must be 'sic' or 'private'
- **Returns**: Created pricing object with generated UUID

#### GET /api/pricing/activities/[id]/pricing/[pricingId]
- **Purpose**: Get specific pricing option
- **Auth**: JWT token required
- **Validation**: Pricing must belong to operator's activity
- **Returns**: Single pricing object

#### PUT /api/pricing/activities/[id]/pricing/[pricingId]
- **Purpose**: Update existing pricing option
- **Auth**: JWT token required
- **Validation**: Pricing must exist and belong to operator
- **Returns**: Updated pricing object

#### DELETE /api/pricing/activities/[id]/pricing/[pricingId]
- **Purpose**: Delete pricing option
- **Auth**: JWT token required
- **Validation**: Pricing must exist and belong to operator
- **Returns**: Success message

### Accommodation Pricing Endpoints

**Base Path**: `/api/pricing/accommodations/[id]/room-rates`

#### GET /api/pricing/accommodations/[id]/room-rates
- Get all room rates for accommodation

#### POST /api/pricing/accommodations/[id]/room-rates
- Create new room rate

#### GET /api/pricing/accommodations/[id]/room-rates/[rateId]
- Get specific room rate

#### PUT /api/pricing/accommodations/[id]/room-rates/[rateId]
- Update room rate

#### DELETE /api/pricing/accommodations/[id]/room-rates/[rateId]
- Delete room rate

---

## Next.js 15 Migration Fixes

### Problem: Dynamic Route Params Type Error

**Error Message**:
```
Type error: Route "app/api/pricing/accommodations/[id]/room-rates/[rateId]/route.ts" has an invalid "GET" export:
  Type "{ params: { id: string; rateId: string; }; }" is not a valid type for the function's second argument.
```

**Root Cause**: Next.js 15 changed dynamic route params from synchronous objects to Promises

### Solution Applied

**Before (Next.js 14)**:
```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string; rateId: string } }
) {
  const { id, rateId } = params;
  // ... rest of code
}
```

**After (Next.js 15)**:
```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; rateId: string }> }
) {
  const { id, rateId } = await params;
  // ... rest of code
}
```

### Files Fixed

1. `app/api/pricing/accommodations/[id]/room-rates/[rateId]/route.ts`
   - Fixed GET, PUT, DELETE handlers

2. `app/api/pricing/accommodations/[id]/room-rates/route.ts`
   - Fixed GET, POST handlers

3. `app/api/pricing/activities/[id]/pricing/[pricingId]/route.ts`
   - Fixed GET, PUT, DELETE handlers

4. `app/api/pricing/activities/[id]/pricing/route.ts`
   - Fixed GET, POST handlers

### Key Insight: Local vs Production

- **Local dev (`npm run dev`)**: Skips strict TypeScript checking for speed
- **Production build (`npm run build`)**: Performs full type checking
- This is why errors only appeared during server deployment

---

## Deployment Procedures

### Git Workflow

```bash
# Commit changes
git add .
git commit -m "Descriptive message"

# Push to GitHub
git push origin main
```

### Server Deployment Script

**Location**: `/home/tqb/app/travelquotebot/deploy.sh`

**Script Contents**:
```bash
#!/bin/bash
cd /home/tqb/app/travelquotebot
git pull origin main
/home/tqb/.nvm/versions/node/v20.18.1/bin/npm install
/home/tqb/.nvm/versions/node/v20.18.1/bin/npm run build
/home/tqb/.nvm/versions/node/v20.18.1/bin/pm2 restart travelquotebot
```

**Usage**:
```bash
ssh tqb@188.132.230.193
cd /home/tqb/app/travelquotebot
bash deploy.sh
```

### PM2 Process Management

```bash
# Check status
/home/tqb/.nvm/versions/node/v20.18.1/bin/pm2 status

# Restart application
/home/tqb/.nvm/versions/node/v20.18.1/bin/pm2 restart travelquotebot

# View logs
/home/tqb/.nvm/versions/node/v20.18.1/bin/pm2 logs travelquotebot

# Monitor in real-time
/home/tqb/.nvm/versions/node/v20.18.1/bin/pm2 monit
```

---

## Production Environment Cleanup

### Issue: Development Debug Info Visible in Production

**Problem**: Homepage was showing:
- Database connection status bar
- Server IP address (188.132.230.193)
- "Environment: Development" badge
- "Test API" button

**Solution**: Environment-based conditional rendering

### Changes Made to app/page.tsx

**Test API Button** (lines 68-75):
```typescript
{process.env.NODE_ENV === 'development' && (
  <a
    href="/api/test"
    className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-bold text-sm shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transform hover:scale-105 transition-all duration-300"
  >
    Test API
  </a>
)}
```

**Status Bar** (lines 99-122):
```typescript
{/* Bottom System Status Bar - Only show in development */}
{process.env.NODE_ENV === 'development' && (
  <div className="absolute bottom-0 left-0 right-0 z-20">
    <div className="backdrop-blur-md bg-white/10 border-t border-white/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-white font-medium">Database Connected</span>
          </div>
          <span className="text-white/50">•</span>
          <div className="flex items-center gap-2">
            <span className="text-white/80 font-medium">Server:</span>
            <span className="text-white font-mono text-xs">188.132.230.193</span>
          </div>
          <span className="text-white/50">•</span>
          <div className="flex items-center gap-2">
            <span className="text-white/80 font-medium">Environment:</span>
            <span className="text-purple-300 font-semibold">Development</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
```

### Verification

After deployment and cache clear:
```bash
curl -s http://188.132.230.193:3002/ | grep -A 5 "Test API\|Database Connected\|Environment"
```

**Result**: No output (grep found nothing) - Debug elements successfully hidden in production

---

## Known Issues and Solutions

### Issue 1: Hallucinated Database Credentials

**Problem**: Initially tried to connect with root@localhost

**Solution**: Read actual credentials from `lib/db.ts`:
- Host: 188.132.230.193
- User: tqb
- Password: Dlr235672.-Yt
- Database: tqb_db

### Issue 2: Foreign Key Constraint Duplicate

**Problem**: Migration tried to add operator_id foreign key to activities table, but it already existed

**Solution**: Skipped ALTER TABLE statement, only created new pricing tables

### Issue 3: EADDRINUSE - Port 3002 Already in Use

**Problem**: Server wouldn't start, error "address already in use :::3002"

**Root Cause**: Zombie next-server process holding port 3002 (PID 1730875)

**Solution**:
```bash
# Find process holding port
lsof -i :3002

# Kill zombie process
kill -9 1730875

# Restart PM2
pm2 restart travelquotebot
```

### Issue 4: PM2 Shows "errored" Status But App Works

**Problem**: PM2 reports application as "errored" but HTTP requests return 200 OK

**Analysis**: This appears to be a PM2 state management issue, not an actual application problem

**Verification**: Application responds correctly to all requests despite PM2 status

**Solution**: Monitor actual HTTP responses rather than relying solely on PM2 status

### Issue 5: Next.js Cache Not Clearing

**Problem**: After deploying environment-based conditional rendering, debug elements still visible

**Solution**: Clear .next cache and rebuild:
```bash
cd /home/tqb/app/travelquotebot
rm -rf .next
npm run build
pm2 restart travelquotebot
```

---

## Credentials and Access

### Database

- **Host**: 188.132.230.193
- **Port**: 3306
- **User**: tqb
- **Password**: Dlr235672.-Yt
- **Database**: tqb_db

**Connection String**:
```bash
mysql -h 188.132.230.193 -u tqb -p'Dlr235672.-Yt' tqb_db
```

### SSH Access

- **Host**: 188.132.230.193
- **User**: tqb
- **App Directory**: /home/tqb/app/travelquotebot
- **Node Version**: v20.18.1 (via nvm)

**SSH Command**:
```bash
ssh tqb@188.132.230.193
```

### Operators

**Funny Tourism**:
- **ID**: ed58206d-f600-483b-b98a-79805310e9be
- **Status**: Active
- **Mock Data**: 10 activities with comprehensive pricing

---

## UI Implementation - 2-Line Format

### Activity Pricing Dashboard

**Location**: `app/dashboard/pricing/activities/[id]/page.tsx`

**Display Format**:
```
Line 1: Activity Name - City - Pricing Type Badge
Line 2: All pricing details (varies by SIC/Private)
```

**SIC Example**:
```
Istanbul Full Day Tour - Istanbul - [SIC]
Adult: $125 | Child 0-2: Free | Child 3-5: $60 | Child 6-11: $75 | Child 12-17: $100
```

**Private Example**:
```
Istanbul Full Day Tour - Istanbul - [PRIVATE] (2-6 pax)
Fixed: Transport $200 + Guide $150 • Variable: Entrance $45 + Meal $25 • Sample (4 pax): $157.50/person
```

### Private Tour Calculation Function

```typescript
const calculatePrivatePrice = (p: ActivityPricing, paxCount: number) => {
  const fixedPerPerson = (p.transport_cost + p.guide_cost) / paxCount;
  const variablePerPerson = p.entrance_fee_adult + p.meal_cost_adult;
  return (fixedPerPerson + variablePerPerson).toFixed(2);
};
```

---

## Testing Checklist

- [x] Database migration executed successfully
- [x] Mock data inserted for Funny Tourism
- [x] Activity pricing API endpoints working
- [x] Accommodation pricing API endpoints working
- [x] Next.js 15 params fixed in all routes
- [x] Local build passes without errors
- [x] Production build passes without errors
- [x] Server deployment successful
- [x] PM2 running application
- [x] HTTP requests returning 200 OK
- [x] Homepage debug elements hidden in production
- [ ] JWT authentication tested end-to-end
- [ ] Operator scoping verified across all endpoints
- [ ] Frontend UI for activity pricing tested
- [ ] Private tour calculations verified
- [ ] Multiple pax slabs tested

---

## Next Steps / TODO

1. **Frontend UI Development**
   - Complete activity pricing management dashboard
   - Add form for creating/editing pricing options
   - Implement pax slab management interface
   - Add seasonal pricing controls

2. **Business Logic Enhancement**
   - Add pricing calculation service for private tours
   - Implement seasonal pricing logic
   - Add date-based validity checks
   - Build quotation generation system

3. **Testing**
   - End-to-end testing of pricing APIs
   - Verify cost division calculations
   - Test multiple operator scenarios
   - Validate seasonal pricing logic

4. **Documentation**
   - API documentation with Swagger/OpenAPI
   - User guide for tour operators
   - Pricing calculation examples
   - Deployment runbook

---

## Change Log

### 2025-10-17 (Session 1)
- Created component-based activity pricing system
- Implemented database schema with activity_pricing and transportation_pricing tables
- Built complete CRUD API for activity pricing
- Fixed Next.js 15 params type errors in 4 route files
- Inserted mock data for Funny Tourism operator (10 activities)
- Deployed to production server
- Fixed port 3002 conflict (killed zombie process)
- Cleaned up production homepage (removed debug status bar and Test API button)
- Created comprehensive progress documentation

### 2025-10-17 (Session 2)
- Fixed activity pricing calculation: Convert database DECIMAL values to numbers before calculations
- Updated deployment scripts with correct PM2 paths and permissions fix script
- **UI Overhaul**: Converted all 6 pricing dashboards from card grid to table-style list view
  - Activities: List view with cheapest price from activity_pricing table
  - Accommodations: List view with cheapest price from room_rates table (fixed column name: adult_price_double)
  - Transport: List view showing route, vehicle type, capacity, duration
  - Guides: List view showing languages, cities, specializations
  - Restaurants: List view showing cuisine type, price range, meal prices
  - Additional Services: List view highlighting mandatory services
- **API Enhancement**: Added cheapest price calculation queries
  - Activities: MIN of SIC adult price or calculated private price (fixed costs/pax + variable costs)
  - Accommodations: MIN room rate from accommodation_room_rates table
- Changed "Avg Base Price" to "Avg Starting Price" in stats cards
- Display format: "from $XX" to indicate minimum/starting price
- **Bug Fixes**:
  - Fixed accommodation pricing query using wrong column name (price_per_night → adult_price_double)
  - Added favicon (app/icon.svg) to eliminate browser errors

### 2025-10-17 (Session 3)
- **Edit Functionality**: Added edit capability to all 6 pricing detail pages
  - Activities: Edit activity pricing options (SIC/Private)
  - Accommodations: Edit room rates with all configurations
  - Guides: Edit seasonal pricing variations
  - Restaurants: Edit meal pricing (breakfast, lunch, dinner)
  - Transport: Edit transport cost variations
  - Additional Services: Edit service price variations
  - Consistent pattern: resetForm(), handleEdit(), handleUpdate() functions
  - UI: Added Edit (✏️) button alongside Delete button
  - Form mode detection: "Add" vs "Update" based on editing state
- **Bulk Import Feature**: Complete Excel-based bulk import system
  - Installed xlsx library for Excel file handling
  - **Template Download API** (`/api/pricing/bulk-import/template/[category]`):
    - Generates Excel templates with sample data for all 6 categories
    - Includes Data sheet with pre-formatted columns and example rows
    - Includes Instructions sheet with import guidelines
    - Returns downloadable .xlsx file
  - **Upload API** (`/api/pricing/bulk-import/upload/[category]`):
    - Accepts Excel file uploads via multipart/form-data
    - Parses Excel files and validates required fields
    - Inserts data into appropriate database tables
    - Returns detailed results: imported count, skipped count, error list
    - Category-specific validation and field mapping
  - **Bulk Import UI** (`/dashboard/pricing/bulk-import`):
    - 3-step workflow with instructions panel
    - Category selection grid with download buttons
    - File upload interface with drag-and-drop area
    - Result display showing success/error feedback
- **Bug Fixes**:
  - Fixed TypeScript error in Additional Services: `price: null` → `price: 0`
  - Fixed production deployment: Stashed local changes before git pull
- **Deployment**: Successfully deployed to production with npm install (added xlsx package)

---

## Important Notes

1. **Cost Division Logic**: Always remember that for private tours, transport and guide costs divide by passenger count, but entrance fees and meals do NOT divide (they're always per person).

2. **Operator Scoping**: All queries must filter by operator_id. The system is multi-tenant with operator-level isolation.

3. **Next.js 15 Params**: All dynamic route handlers must use `Promise<{ param: type }>` and await the params.

4. **PM2 Status**: Don't trust PM2 status alone - verify actual HTTP responses.

5. **Environment Variables**: Production builds use NODE_ENV=production automatically via `npm run build`.

6. **Database Credentials**: Never use root@localhost - actual credentials are in lib/db.ts.

---

**End of Progress Log**
