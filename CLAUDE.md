# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TravelQuoteBot is a B2B SaaS platform for tour operators to generate AI-powered Turkey travel itineraries using Claude 3.5 Sonnet. The platform features multi-tenant architecture with subdomain-based routing, prepaid credit billing system, and comprehensive pricing management for accommodations, activities, transport, guides, restaurants, and additional services.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Runtime:** React 19, TypeScript
- **Database:** MySQL (MariaDB 10.11.14) with mysql2/promise
- **AI:** Anthropic Claude 3.5 Sonnet via @anthropic-ai/sdk
- **Auth:** JWT-based with bcrypt, stored in httpOnly cookies
- **Styling:** Tailwind CSS v4
- **File Uploads:** Cloudinary (logo management)
- **Data Export:** xlsx library for bulk import/export

## Development Commands

```bash
# Start development server (automatically kills port 3000 first)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The dev server runs on http://localhost:3000.

## Architecture

### Multi-Tenant Subdomain Routing

The application uses Next.js middleware ([middleware.ts](middleware.ts)) to handle subdomain-based routing:
- Subdomains (e.g., `funnytourism-ykkq.travelquotebot.com`) are automatically routed to `/request/[subdomain]` pages
- Main domain routes to the standard operator dashboard and authentication flows
- Subdomain routing enables white-label customer-facing itinerary request forms

### Database Layer (lib/db.ts)

Connection pooling with mysql2/promise:
- `query<T>()` - Execute SELECT queries returning typed arrays
- `queryOne<T>()` - Return single row or null
- `execute()` - Run INSERT/UPDATE/DELETE statements
- Connection pool with 10 max connections, keep-alive enabled

### Authentication System (lib/auth.ts)

JWT-based authentication with dual token support:
- Tokens accepted via `Authorization: Bearer <token>` header OR `tqb_token` httpOnly cookie
- Cookie set with 7-day expiration, httpOnly, secure in production
- `authenticateRequest()` - Extract and verify token from request
- `verifyToken()` - Validate JWT and return payload
- `generateToken()` - Create new JWT (7-day expiry)
- Role-based access: operators have users with roles (owner, staff, admin)

### Credit System (lib/credits.ts)

Prepaid credit billing model (₺1 per itinerary):
- `getOrCreateCreditAccount()` - Ensure operator has credit account
- `checkAndDeductForItinerary()` - Verify balance and deduct cost atomically
- `addCredits()` - Add credits via invoice payment (deposit/bonus/refund/adjustment)
- `deductCredits()` - Remove credits for usage (throws on insufficient balance)
- `createInvoice()` - Generate invoice with auto-incrementing numbers (TQB-YYYY-NNNN format)
- `markInvoiceAsPaid()` - Process payment and add credits to account
- All transactions create audit trail in `credit_transactions` table

### Pricing Engine (lib/pricing.ts)

Date-based seasonal pricing with fallback to base prices:
- `getAccommodationPrice(id, date)` - Returns seasonal or base accommodation price
- `getActivityPrice(id, date)` - Returns seasonal or base activity price
- `getTransportPrice(id, date)` - Returns seasonal or base transport price
- `getServicesForOperatorWithPricing()` - Fetch all services with pricing for date range
- Seasonal pricing stored in `*_price_variations` tables with date ranges
- Response includes `source: 'seasonal' | 'base'` to indicate pricing tier used

### AI Integration (lib/ai.ts)

Simple wrapper for Anthropic SDK:
- `getAnthropicClient()` - Returns configured Anthropic client or null
- Used in [app/api/itinerary/generate/route.ts](app/api/itinerary/generate/route.ts)
- Model: `claude-3-5-sonnet-20241022` with 8000 max tokens
- Structured JSON prompt for day-by-day itinerary generation

## API Routes Structure

### Authentication
- `POST /api/auth/register` - Create operator account with subdomain
- `POST /api/auth/login` - Returns JWT token and sets httpOnly cookie
- `POST /api/auth/logout` - Clears authentication cookie

### Itinerary Generation
- `POST /api/itinerary/generate` - Generate AI itinerary (requires auth, deducts ₺1 credit)
  - Returns 402 Payment Required if insufficient credits
  - Stores itinerary in JSON format in database
  - Tracks API usage costs
- `GET /api/itinerary/[id]` - Fetch itinerary details

### Credit Management
- `GET /api/credits/balance` - Get current credit balance
- `POST /api/credits/purchase` - Create invoice for credit purchase
- `GET /api/credits/transactions` - Get transaction history
- `GET /api/credits/invoices` - Get invoice history

### Pricing Management
All pricing routes follow RESTful pattern under `/api/pricing/`:
- **Accommodations**: `/api/pricing/accommodations`, `/api/pricing/accommodations/[id]`
  - Room rates: `/api/pricing/accommodations/[id]/room-rates`
  - Seasonal prices: `/api/pricing/accommodations/[id]/prices`
- **Activities**: `/api/pricing/activities`, `/api/pricing/activities/[id]`
  - Seasonal pricing: `/api/pricing/activities/[id]/prices`
- **Transport**: `/api/pricing/transport`, `/api/pricing/transport/[id]`
  - Seasonal pricing: `/api/pricing/transport/[id]/prices`
- **Guides**: `/api/pricing/guides`, `/api/pricing/guides/[id]`
- **Restaurants**: `/api/pricing/restaurants`, `/api/pricing/restaurants/[id]`
- **Additional Services**: `/api/pricing/additional`, `/api/pricing/additional/[id]`
- **Bulk Operations**:
  - `GET /api/pricing/bulk-export/[category]` - Export data as Excel
  - `GET /api/pricing/bulk-import/template/[category]` - Download template
  - `POST /api/pricing/bulk-import/upload/[category]` - Upload Excel file

### Admin Routes
- `GET /api/admin/billing/pending` - List pending invoices
- `POST /api/admin/billing/mark-paid` - Mark invoice as paid and add credits

### Public Routes
- `GET /api/public/operator/[subdomain]` - Get operator info by subdomain
- `POST /api/public/itinerary/request` - Submit itinerary request (unauthenticated)

### Operator Management
- `GET /api/operator/settings` - Get operator settings
- `PATCH /api/operator/settings` - Update operator settings
- `GET /api/operator/requests` - List itinerary requests from customers

## Page Structure

### Authentication Pages
- [app/auth/login/page.tsx](app/auth/login/page.tsx) - Login form
- [app/auth/register/page.tsx](app/auth/register/page.tsx) - Registration form

### Dashboard Pages
- [app/dashboard/page.tsx](app/dashboard/page.tsx) - Main operator dashboard
- [app/dashboard/billing/page.tsx](app/dashboard/billing/page.tsx) - Credit balance, invoices, purchase form
- [app/dashboard/pricing/page.tsx](app/dashboard/pricing/page.tsx) - Pricing management hub
  - Accommodations, activities, transport, guides, restaurants, additional services
  - Each category has list, detail, and new pages
  - Bulk import/export pages for Excel uploads

### Itinerary Pages
- [app/itinerary/create/page.tsx](app/itinerary/create/page.tsx) - Create new itinerary
- [app/itinerary/[id]/page.tsx](app/itinerary/[id]/page.tsx) - View itinerary details

### Public Pages
- [app/request/[subdomain]/page.tsx](app/request/[subdomain]/page.tsx) - Customer itinerary request form
- [app/request/[subdomain]/thank-you/page.tsx](app/request/[subdomain]/thank-you/page.tsx) - Confirmation page

### Settings
- [app/settings/page.tsx](app/settings/page.tsx) - Operator settings and branding
- [app/requests/page.tsx](app/requests/page.tsx) - View customer requests

## Database Schema

### Core Tables
- `operators` - Tour operator companies with subdomain, subscription tier
- `users` - Operator staff members with roles
- `itineraries` - Generated travel plans with JSON data
- `credit_accounts` - Operator credit balances (balance, total_purchased, total_spent)
- `credit_transactions` - Audit trail for all credit operations
- `invoices` - Payment invoices with status tracking
- `invoice_sequence` - Auto-increment invoice numbers per year
- `pricing_config` - System-wide pricing (e.g., ₺1 per itinerary)

### Pricing Tables
- `accommodations` - Hotels with base_price_per_night
- `accommodation_price_variations` - Seasonal pricing by date range
- `accommodation_room_rates` - Room type pricing (single, double, suite, etc.)
- `activities` - Tours/experiences with base_price
- `activity_price_variations` - Seasonal activity pricing
- `operator_transport` - Transport services with base_price
- `transport_price_variations` - Seasonal transport pricing
- `operator_guides` - Tour guides with day rates
- `operator_restaurants` - Restaurant partnerships
- `operator_additional_services` - Miscellaneous services

### Tracking Tables
- `api_usage` - Anthropic API call tracking (cost, tokens, success)
- `itinerary_requests` - Customer form submissions from public pages

## Environment Variables

Required in `.env.local`:
```
DATABASE_HOST=188.132.230.193
DATABASE_PORT=3306
DATABASE_USER=tqb
DATABASE_PASSWORD=<password>
DATABASE_NAME=tqb_db
ANTHROPIC_API_KEY=<key>
JWT_SECRET=<secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

Optional:
```
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
```

## Important Patterns

### API Route Authentication
```typescript
const token = getTokenFromRequest(request);
const userData = verifyToken(token);
if (!userData || !userData.operatorId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
// Use userData.operatorId for queries
```

### Credit Checking Before Operations
```typescript
try {
  const result = await checkAndDeductForItinerary(operatorId, itineraryId);
  // Proceed with operation
} catch (error) {
  // Handle insufficient credits - return 402 Payment Required
}
```

### Seasonal Pricing Queries
Always use lib/pricing.ts functions instead of direct queries:
```typescript
const price = await getAccommodationPrice(accommodationId, '2025-07-15');
// Returns { price, currency, source: 'seasonal' | 'base', seasonName?, minStayNights? }
```

### JSON Storage
Complex data structures (itinerary data, preferences, amenities) are stored as JSON strings:
```typescript
itinerary_data: JSON.stringify(data)
// Parse when retrieving:
const parsed = JSON.parse(row.itinerary_data);
```

## File Locations

- **Utilities:** [lib/](lib/) directory
- **API Routes:** [app/api/](app/api/) directory
- **Pages:** [app/](app/) directory with Next.js App Router structure
- **Migrations:** [database_migrations/](database_migrations/) and [migrations/](migrations/)
- **Helper Scripts:** [scripts/](scripts/) directory, [kill-port.js](kill-port.js)

## Key Business Logic

### Itinerary Generation Flow
1. User submits form → `POST /api/itinerary/generate`
2. Authenticate request and verify operator
3. Check credit balance via `checkAndDeductForItinerary()` (₺1 cost)
4. If insufficient, return 402 with pricing info
5. Fetch relevant accommodations and activities from database
6. Build structured prompt for Claude API
7. Call Claude 3.5 Sonnet with 8000 token limit
8. Parse JSON response (handle markdown code blocks)
9. Store itinerary in database with UUID
10. Track API usage and costs
11. Return itinerary data with new credit balance

### Invoice Payment Flow
1. Operator requests credit purchase → `POST /api/credits/purchase`
2. Create invoice with auto-incremented number (TQB-YYYY-NNNN)
3. Invoice includes 20% KDV (VAT), credits at 1:1 ratio (₺1 = 1 credit)
4. Admin marks invoice as paid → `POST /api/admin/billing/mark-paid`
5. Credits automatically added to account via `addCredits()`
6. Transaction recorded in `credit_transactions` table

### Multi-Tenant Routing
1. Request arrives at subdomain (e.g., `funnytourism-ykkq.travelquotebot.com`)
2. Middleware extracts subdomain from hostname
3. Rewrite URL to `/request/[subdomain]` path
4. Page loads operator branding via `GET /api/public/operator/[subdomain]`
5. Customer submits form → `POST /api/public/itinerary/request` (no auth required)
6. Request stored in `itinerary_requests` table for operator review

## Future Enhancements

### Caching Layer with Redis

**Current State (As of 2025):**
- AI service (tqb-ai) uses in-memory caching for operator services (accommodations, activities, restaurants)
- Cache is stored in Python process memory at 31.141.246.227:8001
- Cache format: `op_{operator_id}_acc_{city}`, `op_{operator_id}_act_{city}`, `op_{operator_id}_rest_{city}`
- Cache is lost when AI service restarts
- Each service instance has its own isolated cache

**Current Limitations:**
- Cache doesn't persist across service restarts/deployments
- Cannot share cache between multiple AI server instances
- Transport, guides, and additional services are not cached yet (should be added to tqb-ai service)
- No cache invalidation mechanism when operators update services

**Recommended Future Implementation (When Scaling):**

**When to Implement:**
- When operator count exceeds 50+ active operators
- When deploying multiple AI server instances for load balancing
- When service restart time becomes a business concern
- When cache miss rate significantly impacts performance

**Redis Integration Plan:**

1. **Setup Redis Server:**
   - Install Redis on separate server or use managed service (AWS ElastiCache, DigitalOcean Redis)
   - Configure persistence (RDB snapshots + AOF logging)
   - Set memory limits and eviction policy (LRU recommended)

2. **Update tqb-ai Service:**
   - Add `redis-py` dependency
   - Replace in-memory dict with Redis client
   - Implement cache keys: `tqb:op:{operator_id}:acc:{city}`, etc.
   - Add TTL (Time To Live) of 30 minutes per cache entry
   - Add cache for transport, guides, and additional services

3. **Add Cache Invalidation:**
   - Option A: Time-based expiration (30 min TTL) - simple, automatic
   - Option B: Event-based invalidation - clear cache when operator updates services via API
   - Option C: Hybrid - TTL + manual "Clear My Cache" button in operator dashboard

4. **Cache Warming Strategy:**
   - Pre-load cache on AI service startup for top 10 most active operators
   - Background job to refresh cache before TTL expiration
   - Cache miss triggers async cache population for future requests

5. **Monitoring & Metrics:**
   - Track cache hit/miss ratio per operator
   - Monitor Redis memory usage and evictions
   - Alert on cache server downtime (fallback to direct DB queries)

**Benefits:**
- ✅ Cache survives service restarts and deployments
- ✅ Multiple AI servers can share the same cache
- ✅ Faster cold start times after deployment
- ✅ Reduced database load for frequently accessed data
- ✅ Centralized cache management and invalidation

**Estimated Implementation Time:** 8-12 hours
**Estimated Monthly Cost:** $10-20 for managed Redis (1GB instance)

**Alternative Approach (No Redis):**
- Keep current in-memory caching
- Accept slow first request after service restart
- Add cache warming script that runs post-deployment
- Document cache rebuild time in deployment runbook
- Cost: $0, works fine for single-server setup
