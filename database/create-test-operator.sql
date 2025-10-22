-- ============================================
-- CREATE TEST OPERATOR FOR CRUD TESTING
-- ============================================
-- This script creates a test organization and operator account
-- to test CRUD operations with proper organizationId

-- Insert Test Organization
INSERT INTO organizations (name, slug, email, phone, country, status)
VALUES ('Test Tour Operator', 'test-operator', 'test@example.com', '+1234567890', 'Turkey', 'active');

-- Get the organization ID (will be used in next statements)
SET @test_org_id = LAST_INSERT_ID();

-- Insert Test Operator User
-- Password: 'test123' (hashed with bcrypt)
INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, status)
VALUES (
  @test_org_id,
  'operator@test.com',
  '$2b$10$rX8kZZ5ZqZqZqZqZqZqZqeqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',  -- This will need to be generated
  'Test',
  'Operator',
  'org_admin',
  'active'
);

-- Set up subscription for test organization
INSERT INTO subscriptions (organization_id, plan_type, monthly_credits, price, status, current_period_start, current_period_end)
VALUES (
  @test_org_id,
  'professional',
  100,
  99.00,
  'active',
  CURRENT_TIMESTAMP,
  DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)
);

-- Set up credits for test organization
INSERT INTO organization_credits (organization_id, credits_total, credits_used, reset_date)
VALUES (
  @test_org_id,
  100,
  0,
  DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
);

-- Display created account info
SELECT
  'Test operator account created!' as message,
  u.email as operator_email,
  'test123' as password,
  u.role,
  o.name as organization_name,
  o.slug as organization_slug,
  o.id as organization_id
FROM users u
JOIN organizations o ON u.organization_id = o.id
WHERE u.email = 'operator@test.com';
