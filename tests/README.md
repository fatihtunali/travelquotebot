# CRUD Operations Test Suite

Comprehensive test suite for verifying all pricing category CRUD operations work correctly.

## Overview

This test suite validates Create, Read, Update, and Delete operations across all 7 pricing categories:
- 🏨 Hotels
- 🚌 Tours
- 🚗 Vehicles
- 👤 Guides
- 🎫 Entrance Fees
- 🍽️ Meals
- 💰 Extra Expenses

## Prerequisites

### 1. Test Operator Account

The tests require an **operator account** (not super_admin) because:
- Super admins don't have an `organizationId` in their JWT token
- CRUD operations require `organizationId` for multi-tenant data isolation
- Tests simulate real operator usage scenarios

A test operator account has been created:
```
Email: operator@test.com
Password: test123
Organization: Test Tour Operator (ID: 2)
Role: org_admin
```

### 2. Running Environment

- Development server must be running on `http://localhost:3003`
- Database must be accessible
- All API endpoints must be deployed

## Running the Tests

### Option 1: From Browser Console

1. Navigate to admin dashboard: `http://localhost:3003/admin/dashboard/system-tests`
2. Click on **"CRUD Operations Tests"** bubble
3. Open browser console (F12)
4. Run the test suite:

```javascript
// Option A: Will prompt for credentials
runAllCRUDTests();

// Option B: Provide credentials directly
runAllCRUDTests("operator@test.com", "test123");
```

### Option 2: From Test Page

1. Navigate to: `http://localhost:3003/dashboard/test-crud`
2. Click the **"Run All CRUD Tests"** button
3. Enter operator credentials when prompted
4. View results in the console and on-page summary

## Test Structure

Each category runs 4 tests:

1. **CREATE** - Creates a new record with pricing data
2. **READ** - Verifies the created record exists and is retrievable
3. **UPDATE** - Modifies the record and pricing
4. **DELETE** - Soft deletes (archives) the record

Total: **28 tests** (7 categories × 4 operations)

## Expected Results

### All Tests Passing
```
═══════════════════════════════════════════════════════════════
📊 TEST SUMMARY
═══════════════════════════════════════════════════════════════

Total Tests: 28
✅ Passed: 28
❌ Failed: 0
Success Rate: 100.0%
Total Duration: ~15000ms (15s)

📋 Results by Category:

✅ Hotels: 4/4 tests passed
✅ Tours: 4/4 tests passed
✅ Vehicles: 4/4 tests passed
✅ Guides: 4/4 tests passed
✅ Entrance Fees: 4/4 tests passed
✅ Meals: 4/4 tests passed
✅ Extras: 4/4 tests passed
```

## Common Issues

### Issue: "Column 'organization_id' cannot be null"

**Cause**: Logged in as super_admin instead of operator

**Solution**: Use operator credentials (`operator@test.com` / `test123`)

### Issue: "Authentication failed"

**Cause**: Invalid credentials or test operator not created

**Solution**: Run the setup script to create test operator:
```bash
node scripts/create-test-operator.js
```

### Issue: "Unauthorized" errors

**Cause**: Token expired or invalid

**Solution**: Re-run tests with fresh login credentials

## Maintenance

### Recreating Test Operator

If the test operator needs to be recreated:

```bash
# Delete existing test operator from database
mysql -u tqa -p -h 134.209.137.11 tqa_db << EOF
DELETE FROM users WHERE email = 'operator@test.com';
DELETE FROM organizations WHERE slug = 'test-operator';
EOF

# Create new test operator
node scripts/create-test-operator.js
```

### Adding New Tests

To add tests for new pricing categories:

1. Create test function following the pattern:
   ```typescript
   async function testNewCategoryCRUD() {
     // CREATE test
     // READ test
     // UPDATE test
     // DELETE test
   }
   ```

2. Add to test runner:
   ```typescript
   export async function runAllCRUDTests() {
     // ... existing tests
     await testNewCategoryCRUD();
   }
   ```

3. Update category list in summary section

## Technical Details

### Authentication Flow

1. Test script calls `loginAsOperator(email, password)`
2. Sends POST request to `/api/auth/login`
3. Receives JWT token with `organizationId`
4. Uses token for all subsequent API calls

### API Endpoints Tested

- `POST /api/pricing/{category}` - Create
- `GET /api/pricing/{category}` - Read
- `PUT /api/pricing/{category}` - Update
- `DELETE /api/pricing/{category}?id={id}` - Delete (soft delete)

### Data Isolation

- All test data is scoped to organization ID 2 (Test Tour Operator)
- Test data is marked with "Test" prefix for easy identification
- DELETE operations use soft delete (status = 'deleted')

## Files

- `tests/test-crud-operations.ts` - Main test script
- `scripts/create-test-operator.js` - Setup script for test account
- `database/create-test-operator.sql` - SQL version of setup
- `tests/README.md` - This documentation

## Support

For issues or questions about the CRUD test suite, check:
1. Browser console for detailed error messages
2. Server logs for API errors
3. Database logs for SQL errors
