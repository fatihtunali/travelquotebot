# Finance Management System - Technical Documentation

## Overview

This document outlines a complete finance management system for tracking accounts receivable (customer/agent payments), accounts payable (supplier payments), commissions, and profit analysis per booking.

---

## 1. System Architecture

### Money Flow
```
CUSTOMER/AGENT → [RECEIVABLES] → YOUR BUSINESS → [PAYABLES] → SUPPLIERS
```

### Key Components
1. **Accounts Receivable (AR)** - Money coming in from customers/agents
2. **Accounts Payable (AP)** - Money going out to suppliers
3. **Commission Management** - Agent commission calculations
4. **Profit Analysis** - Revenue minus costs per booking

---

## 2. Accounts Receivable (AR)

### Invoice System
Invoices are generated from bookings and sent to customers or agents.

### Invoice Status Flow
```
draft → sent → partially_paid → paid → overdue
```

| Status | Description |
|--------|-------------|
| `draft` | Invoice created but not sent |
| `sent` | Invoice sent to customer/agent |
| `partially_paid` | Some payment received |
| `paid` | Fully paid |
| `overdue` | Past due date, unpaid |

### Database Table - invoices
```sql
CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  booking_id INT NOT NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,

  -- Who to bill
  bill_to_type ENUM('customer', 'agent') NOT NULL,
  bill_to_id INT NULL, -- client_id or agent_id
  bill_to_name VARCHAR(255) NOT NULL,
  bill_to_email VARCHAR(255),
  bill_to_address TEXT,

  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2) NOT NULL,

  -- Currency
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Dates
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE NULL,

  -- Status
  status ENUM('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',

  -- Notes
  notes TEXT,
  terms TEXT,

  -- Timestamps
  sent_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),

  INDEX idx_org_status (organization_id, status),
  INDEX idx_invoice_number (invoice_number),
  INDEX idx_due_date (due_date)
);
```

### Invoice Number Format
```
INV-2025-0001, INV-2025-0002, etc.
```

### Database Table - invoice_items
```sql
CREATE TABLE invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  description VARCHAR(500) NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,

  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
```

### Database Table - ar_payments (extends existing payments table)
```sql
-- We already have a payments table for bookings
-- Add invoice_id to link payments to invoices
ALTER TABLE payments ADD COLUMN invoice_id INT NULL;
ALTER TABLE payments ADD FOREIGN KEY (invoice_id) REFERENCES invoices(id);
```

---

## 3. Agent Balance Management

Agents may have credit balances or owe money. Track running balance per agent.

### Database Table - agent_transactions
```sql
CREATE TABLE agent_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  agent_id INT NOT NULL,

  -- Transaction details
  transaction_type ENUM('booking', 'payment', 'commission', 'adjustment', 'refund') NOT NULL,
  reference_type VARCHAR(50), -- 'booking', 'invoice', 'manual'
  reference_id INT NULL, -- booking_id or invoice_id

  -- Amounts (positive = agent owes you, negative = you owe agent)
  amount DECIMAL(10,2) NOT NULL,
  running_balance DECIMAL(10,2) NOT NULL,

  -- Details
  description VARCHAR(500),
  currency VARCHAR(3) DEFAULT 'EUR',
  transaction_date DATE NOT NULL,

  -- Timestamps
  created_by_user_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id),

  INDEX idx_agent (agent_id),
  INDEX idx_date (transaction_date)
);
```

### Agent Commission Tracking
```sql
-- Add commission fields to agents table
ALTER TABLE agents ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE agents ADD COLUMN commission_type ENUM('percentage', 'fixed') DEFAULT 'percentage';
```

---

## 4. Accounts Payable (AP)

### Supplier Management
Track what you owe to each supplier (hotels, tour companies, transfer providers, etc.)

### Database Table - suppliers
```sql
CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,

  -- Basic info
  supplier_name VARCHAR(255) NOT NULL,
  supplier_type ENUM('hotel', 'tour', 'transfer', 'guide', 'airline', 'other') NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,

  -- Payment terms
  payment_terms INT DEFAULT 30, -- days
  currency VARCHAR(3) DEFAULT 'EUR',
  bank_details TEXT,

  -- Status
  status ENUM('active', 'inactive') DEFAULT 'active',
  notes TEXT,

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),

  INDEX idx_org_type (organization_id, supplier_type)
);
```

### Database Table - supplier_invoices
```sql
CREATE TABLE supplier_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  supplier_id INT NOT NULL,
  booking_id INT NULL, -- optional link to booking

  -- Invoice details
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,

  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2) NOT NULL,

  -- Currency
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Status
  status ENUM('pending', 'partially_paid', 'paid', 'overdue', 'disputed') DEFAULT 'pending',

  -- Details
  description TEXT,
  notes TEXT,

  -- Timestamps
  paid_date DATE NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),

  INDEX idx_org_status (organization_id, status),
  INDEX idx_supplier (supplier_id),
  INDEX idx_due_date (due_date)
);
```

### Database Table - ap_payments
```sql
CREATE TABLE ap_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  supplier_id INT NOT NULL,
  supplier_invoice_id INT NULL,

  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  payment_method ENUM('bank_transfer', 'credit_card', 'cash', 'check', 'other') DEFAULT 'bank_transfer',
  reference_number VARCHAR(100),

  -- Dates
  payment_date DATE NOT NULL,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_by_user_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (supplier_invoice_id) REFERENCES supplier_invoices(id),

  INDEX idx_supplier (supplier_id),
  INDEX idx_date (payment_date)
);
```

---

## 5. Booking Cost Tracking

Track actual costs per booking for profit analysis.

### Database Table - booking_costs
```sql
CREATE TABLE booking_costs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  booking_id INT NOT NULL,
  supplier_id INT NULL,
  supplier_invoice_id INT NULL,

  -- Cost details
  cost_type ENUM('hotel', 'tour', 'transfer', 'guide', 'entrance_fee', 'meal', 'flight', 'other') NOT NULL,
  description VARCHAR(500) NOT NULL,

  -- Amounts
  quantity INT DEFAULT 1,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Status
  is_paid BOOLEAN DEFAULT FALSE,
  paid_date DATE NULL,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (supplier_invoice_id) REFERENCES supplier_invoices(id),

  INDEX idx_booking (booking_id)
);
```

---

## 6. API Endpoints

### Invoices
```
GET    /api/finance/[orgId]/invoices              - List all invoices
GET    /api/finance/[orgId]/invoices/[id]         - Get invoice details
POST   /api/finance/[orgId]/invoices              - Create invoice from booking
PUT    /api/finance/[orgId]/invoices/[id]         - Update invoice
DELETE /api/finance/[orgId]/invoices/[id]         - Cancel invoice
POST   /api/finance/[orgId]/invoices/[id]/send    - Send invoice email
```

### Agent Transactions
```
GET    /api/finance/[orgId]/agents/[agentId]/transactions  - Agent transaction history
GET    /api/finance/[orgId]/agents/[agentId]/balance       - Agent current balance
POST   /api/finance/[orgId]/agents/[agentId]/payment       - Record agent payment
```

### Suppliers
```
GET    /api/finance/[orgId]/suppliers             - List all suppliers
GET    /api/finance/[orgId]/suppliers/[id]        - Get supplier details
POST   /api/finance/[orgId]/suppliers             - Create supplier
PUT    /api/finance/[orgId]/suppliers/[id]        - Update supplier
DELETE /api/finance/[orgId]/suppliers/[id]        - Delete supplier
```

### Supplier Invoices & Payments
```
GET    /api/finance/[orgId]/supplier-invoices                    - List all AP invoices
POST   /api/finance/[orgId]/supplier-invoices                    - Create AP invoice
PUT    /api/finance/[orgId]/supplier-invoices/[id]               - Update AP invoice
POST   /api/finance/[orgId]/supplier-invoices/[id]/payment       - Record payment to supplier
```

### Booking Costs
```
GET    /api/finance/[orgId]/bookings/[bookingId]/costs   - Get booking costs
POST   /api/finance/[orgId]/bookings/[bookingId]/costs   - Add cost to booking
PUT    /api/finance/[orgId]/bookings/[bookingId]/costs/[id] - Update cost
DELETE /api/finance/[orgId]/bookings/[bookingId]/costs/[id] - Delete cost
```

### Reports
```
GET    /api/finance/[orgId]/reports/profit-loss          - Profit/Loss report
GET    /api/finance/[orgId]/reports/cash-flow            - Cash flow summary
GET    /api/finance/[orgId]/reports/ar-aging             - AR aging report
GET    /api/finance/[orgId]/reports/ap-aging             - AP aging report
GET    /api/finance/[orgId]/reports/agent-commissions    - Agent commission report
```

---

## 7. UI Components

### 7.1 Finance Dashboard (`/dashboard/finance`)
**Summary Cards:**
- Total Receivables (Outstanding)
- Total Payables (Outstanding)
- Cash Flow This Month
- Profit This Month

**Quick Actions:**
- Create Invoice
- Record Payment Received
- Record Payment Made
- Add Supplier Invoice

### 7.2 Invoices Page (`/dashboard/finance/invoices`)
**Features:**
- Invoice list with status badges
- Filter by status, date range, customer/agent
- Quick actions: View, Send, Record Payment
- Invoice preview/print

### 7.3 Agent Balances Page (`/dashboard/finance/agent-balances`)
**Features:**
- Agent list with current balances
- Transaction history per agent
- Record payment from agent
- Agent commission summary

### 7.4 Suppliers Page (`/dashboard/finance/suppliers`)
**Features:**
- Supplier directory
- Add/Edit suppliers
- View supplier invoices
- Payment history

### 7.5 Payables Page (`/dashboard/finance/payables`)
**Features:**
- List of supplier invoices
- Due date highlighting
- Record payments
- Bulk payment processing

### 7.6 Booking Profitability (`/dashboard/finance/profitability`)
**Features:**
- Revenue vs Costs per booking
- Profit margin calculation
- Cost breakdown by type
- Supplier cost tracking

### 7.7 Reports Page (`/dashboard/finance/reports`)
**Available Reports:**
- Profit & Loss Statement
- Cash Flow Report
- AR Aging Report
- AP Aging Report
- Agent Commission Report
- Supplier Payment Summary

---

## 8. Sidebar Navigation Update

```javascript
const navigation = [
    // ... existing items
    { name: 'Finance', href: '/dashboard/finance', icon: DollarSign },
    // Sub-items when expanded:
    // - Invoices
    // - Agent Balances
    // - Suppliers
    // - Payables
    // - Reports
];
```

---

## 9. Implementation Phases

### Phase 1: Accounts Receivable - Invoicing
1. Create invoices table and invoice_items table
2. Build Invoice API endpoints (CRUD)
3. Create Invoices list page
4. Create Invoice detail/edit page
5. Add "Generate Invoice" from booking
6. Link payments to invoices
7. Invoice status auto-update based on payments

### Phase 2: Agent Balance Management
1. Add commission fields to agents table
2. Create agent_transactions table
3. Build Agent transactions API
4. Create Agent balances page
5. Agent transaction history view
6. Record payment from agent flow
7. Commission calculation on bookings

### Phase 3: Suppliers & Accounts Payable
1. Create suppliers table
2. Create supplier_invoices table
3. Create ap_payments table
4. Build Suppliers API (CRUD)
5. Build Supplier invoices API
6. Create Suppliers list page
7. Create Payables list page
8. Record payment to supplier flow

### Phase 4: Booking Cost Tracking
1. Create booking_costs table
2. Build Booking costs API
3. Add costs section to booking detail page
4. Link costs to supplier invoices
5. Auto-populate costs from itinerary items
6. Cost vs Revenue comparison view

### Phase 5: Reports & Dashboard
1. Create Finance dashboard page
2. Build reporting APIs
3. Profit & Loss report
4. Cash Flow report
5. AR/AP Aging reports
6. Agent commission report
7. Export to CSV/PDF

### Phase 6: Advanced Features
1. Automated payment reminders (email)
2. Recurring invoices
3. Multi-currency conversion
4. Bank reconciliation
5. Integration with accounting software (export)

---

## 10. Database Migration Script

```sql
-- Run on tqa_multi database

-- 1. Suppliers table
CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  supplier_type ENUM('hotel', 'tour', 'transfer', 'guide', 'airline', 'other') NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  payment_terms INT DEFAULT 30,
  currency VARCHAR(3) DEFAULT 'EUR',
  bank_details TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_org_type (organization_id, supplier_type)
);

-- 2. Invoices table
CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  booking_id INT NOT NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  bill_to_type ENUM('customer', 'agent') NOT NULL,
  bill_to_id INT NULL,
  bill_to_name VARCHAR(255) NOT NULL,
  bill_to_email VARCHAR(255),
  bill_to_address TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE NULL,
  status ENUM('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
  notes TEXT,
  terms TEXT,
  sent_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_org_status (organization_id, status),
  INDEX idx_invoice_number (invoice_number),
  INDEX idx_due_date (due_date)
);

-- 3. Invoice items table
CREATE TABLE invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  description VARCHAR(500) NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- 4. Agent transactions table
CREATE TABLE agent_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  agent_id INT NOT NULL,
  transaction_type ENUM('booking', 'payment', 'commission', 'adjustment', 'refund') NOT NULL,
  reference_type VARCHAR(50),
  reference_id INT NULL,
  amount DECIMAL(10,2) NOT NULL,
  running_balance DECIMAL(10,2) NOT NULL,
  description VARCHAR(500),
  currency VARCHAR(3) DEFAULT 'EUR',
  transaction_date DATE NOT NULL,
  created_by_user_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_agent (agent_id),
  INDEX idx_date (transaction_date)
);

-- 5. Supplier invoices table
CREATE TABLE supplier_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  supplier_id INT NOT NULL,
  booking_id INT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status ENUM('pending', 'partially_paid', 'paid', 'overdue', 'disputed') DEFAULT 'pending',
  description TEXT,
  notes TEXT,
  paid_date DATE NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_org_status (organization_id, status),
  INDEX idx_supplier (supplier_id),
  INDEX idx_due_date (due_date)
);

-- 6. AP payments table
CREATE TABLE ap_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  supplier_id INT NOT NULL,
  supplier_invoice_id INT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  payment_method ENUM('bank_transfer', 'credit_card', 'cash', 'check', 'other') DEFAULT 'bank_transfer',
  reference_number VARCHAR(100),
  payment_date DATE NOT NULL,
  notes TEXT,
  created_by_user_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_supplier (supplier_id),
  INDEX idx_date (payment_date)
);

-- 7. Booking costs table
CREATE TABLE booking_costs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  booking_id INT NOT NULL,
  supplier_id INT NULL,
  supplier_invoice_id INT NULL,
  cost_type ENUM('hotel', 'tour', 'transfer', 'guide', 'entrance_fee', 'meal', 'flight', 'other') NOT NULL,
  description VARCHAR(500) NOT NULL,
  quantity INT DEFAULT 1,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  is_paid BOOLEAN DEFAULT FALSE,
  paid_date DATE NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_booking (booking_id)
);

-- 8. Add commission fields to agents
ALTER TABLE agents ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE agents ADD COLUMN commission_type ENUM('percentage', 'fixed') DEFAULT 'percentage';

-- 9. Link payments to invoices
ALTER TABLE payments ADD COLUMN invoice_id INT NULL;
```

---

## 11. File Structure

```
app/
  api/
    finance/
      [orgId]/
        invoices/
          route.ts                    # GET list, POST create
          [id]/
            route.ts                  # GET, PUT, DELETE
            send/
              route.ts                # POST send email
        agents/
          [agentId]/
            transactions/
              route.ts                # GET transactions
            balance/
              route.ts                # GET balance
            payment/
              route.ts                # POST payment
        suppliers/
          route.ts                    # GET list, POST create
          [id]/
            route.ts                  # GET, PUT, DELETE
        supplier-invoices/
          route.ts                    # GET list, POST create
          [id]/
            route.ts                  # GET, PUT
            payment/
              route.ts                # POST payment
        bookings/
          [bookingId]/
            costs/
              route.ts                # GET, POST costs
              [id]/
                route.ts              # PUT, DELETE cost
        reports/
          profit-loss/
            route.ts                  # GET report
          cash-flow/
            route.ts                  # GET report
          ar-aging/
            route.ts                  # GET report
          ap-aging/
            route.ts                  # GET report
  dashboard/
    finance/
      page.tsx                        # Finance dashboard
      invoices/
        page.tsx                      # Invoices list
        [id]/
          page.tsx                    # Invoice detail
      agent-balances/
        page.tsx                      # Agent balances
      suppliers/
        page.tsx                      # Suppliers list
      payables/
        page.tsx                      # AP list
      reports/
        page.tsx                      # Reports
```

---

## 12. Success Metrics

After implementation, track:
- Days Sales Outstanding (DSO)
- Days Payables Outstanding (DPO)
- Invoice collection rate
- On-time supplier payment rate
- Average profit margin per booking
- Agent commission accuracy

---

## 13. Estimated Timeline

| Phase | Description | Estimated Time |
|-------|-------------|----------------|
| Phase 1 | AR - Invoicing | 3-4 hours |
| Phase 2 | Agent Balances | 2-3 hours |
| Phase 3 | Suppliers & AP | 3-4 hours |
| Phase 4 | Booking Costs | 2-3 hours |
| Phase 5 | Reports & Dashboard | 3-4 hours |
| Phase 6 | Advanced Features | 4-5 hours |

**Total: 17-23 hours**

---

## Ready to Implement

This documentation provides a complete roadmap for the finance management system. We'll implement phase by phase, marking each as complete when done.

**Remaining Booking System Phases:**
- Phase 3: Client-Side & Notifications (not done)
- Phase 4: Advanced Features (not done)

**Recommendation:** Complete Finance Phases 1-3 first (core functionality), then decide whether to continue with Finance Phase 4-6 or switch to Booking Phase 3-4.
