# API & Data Integrity Test Suite

## Overview

Comprehensive test suite to verify:
- ✅ All pricing APIs return correct data
- ✅ Database schema matches API expectations
- ✅ Data consistency across related tables
- ✅ Authentication and authorization
- ✅ Frontend-backend data format alignment

## Prerequisites

1. **Development server running** on `http://localhost:3003`
2. **Database access** to `134.209.137.11` (for schema/consistency tests)
3. **Node.js dependencies** installed

## Running Tests

### Quick Test (API only, no DB connection needed)
```bash
npm run test:api
```

### Full Test Suite (includes database checks)
```bash
# Set DB password if needed
export DB_PASSWORD='your_db_password'

# Run all tests
node scripts/test-api-data-integrity.js
```

## What Gets Tested

### 1. Authentication Tests
- ✅ Valid JWT tokens are accepted
- ✅ Invalid JWT tokens are rejected (401)
- ✅ Requests without tokens are rejected (401)

### 2. Pricing API Tests
- ✅ All categories return data (hotels, tours, vehicles, guides, entrance_fees, meals, extras)
- ✅ Each item has required fields (`id`, `name`)
- ✅ Price fields are present and correctly named:
  - Hotels: `price_per_night`
  - Tours: `price_per_person`
  - Vehicles: `price_per_day`
  - Guides: `price_per_day`
  - Entrance Fees: `price_per_person`
  - Meals: `price_per_person`
  - Extras: `price_per_unit`
- ✅ Total items count matches sum of all categories

### 3. Database Schema Tests
- ✅ All main tables exist with required columns:
  - `id`, `organization_id`, `status`, `created_at`
- ✅ All pricing tables exist with required columns:
  - `id`, `season_name`, `status`, `created_at`
- ⚠️  Warns if optional columns are missing (`updated_at`, `created_by`)

### 4. Data Consistency Tests
- ✅ Active items have matching active pricing records
- ✅ No duplicate pricing records for same item/season
- ✅ Season names are consistent across all pricing tables
- ⚠️  Warns if active items are missing pricing for current season

### 5. Quotes API Tests
- ✅ Quotes API returns data for organization
- ✅ Quote records have all required fields:
  - `id`, `quote_number`, `customer_name`, `customer_email`, `destination`, `status`

## Test Output

The script outputs:
- Real-time progress with timestamps
- ✅ Green checkmarks for passed tests
- ❌ Red X marks for failed tests
- ⚠️  Yellow warnings for non-critical issues
- Final summary with counts and duration

Example output:
```
=============================================================
  🧪 TQA API & Data Integrity Test Suite
=============================================================

[09:15:23] 🔍 === Testing Authentication ===
[09:15:23] ✅ Valid JWT token accepted
[09:15:23] ✅ Invalid JWT token rejected correctly
[09:15:23] ✅ Request without token rejected correctly

[09:15:24] 🔍 === Testing Pricing Items API ===
[09:15:24] ✅ All pricing categories present
[09:15:24] ✅ hotels: 69 items
[09:15:24] ✅ tours: 31 items
[09:15:24] ✅ vehicles: 19 items
[09:15:24] ✅ guides: 24 items
[09:15:24] ✅ entrance_fees: 37 items
[09:15:24] ✅ meals: 20 items
[09:15:24] ✅ extras: 24 items
[09:15:24] ✅ Total items count matches: 224

...

=============================================================
  📊 Test Summary
=============================================================
  ✅ Passed:   28
  ❌ Failed:   0
  ⚠️  Warnings: 2
  ⏱️  Duration: 3.45s
=============================================================

  🎉 All tests passed!
```

## Troubleshooting

### Issue: "Database connection failed"
**Solution:** Check DB password or run API-only tests without DB connection

### Issue: "Request without token not rejected"
**Solution:** API routes missing authentication middleware - check route.ts files

### Issue: "Missing categories"
**Solution:** Check API route `/api/pricing/items/[orgId]/route.ts` - ensure all categories are queried

### Issue: "Season name mismatch"
**Solution:** Verify season parameter format matches database:
- ✅ Correct: `"Winter 2025-26"` (capital W, hyphens)
- ❌ Wrong: `"winter_2025_26"` (lowercase, underscores)

### Issue: "Active items have no pricing"
**Solution:** Run pricing import scripts or manually add pricing records for current season

## Adding New Tests

To add a new test function:

```javascript
async function testMyNewFeature() {
  log('🔍', '=== Testing My New Feature ===');

  try {
    // Your test logic here

    if (testPassed) {
      pass('My feature works correctly');
    } else {
      fail('My feature is broken');
    }
  } catch (error) {
    fail(`My feature error: ${error.message}`);
  }
}

// Add to runAllTests()
async function runAllTests() {
  // ... existing tests
  await testMyNewFeature();
  // ... rest of tests
}
```

## Integration with CI/CD

To run tests in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run API tests
  run: npm run test:api
  env:
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

## Test Schedule

Recommended testing frequency:
- **Before every deployment** - Full test suite
- **After API changes** - Relevant API tests
- **After DB schema changes** - Schema + consistency tests
- **Daily (automated)** - Full test suite

## Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

Use in scripts:
```bash
node scripts/test-api-data-integrity.js && echo "Tests passed!" || echo "Tests failed!"
```

## Related Files

- `/tests/test-crud-operations.ts` - CRUD operation tests (browser-based)
- `/tests/README.md` - CRUD testing documentation
- `/database/schema.sql` - Database schema reference

## Support

For issues or questions:
1. Check server logs: `npm run dev` output
2. Check database: `mysql tqa_db -e "DESCRIBE table_name"`
3. Review API routes: `/app/api/` directory
