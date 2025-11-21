# Booking Management System - Technical Documentation

## Overview

This document outlines the complete booking management system that tracks quotes from creation through to completed bookings, including payment tracking and follow-up reminders.

---

## 1. Quote Lifecycle

### Status Flow
```
draft → sent → viewed → accepted/rejected/expired
```

| Status | Description | Trigger |
|--------|-------------|---------|
| `draft` | Quote created but not sent | Default on creation |
| `sent` | Quote sent to client | User clicks "Send Quote" |
| `viewed` | Client opened the quote link | Client visits quote URL |
| `accepted` | Client accepted the quote | Client clicks "Accept" |
| `rejected` | Client rejected | Client clicks "Reject" or user marks rejected |
| `expired` | Quote validity expired | Auto after X days |

### Database Changes - quotes table
```sql
ALTER TABLE quotes ADD COLUMN sent_at DATETIME NULL;
ALTER TABLE quotes ADD COLUMN viewed_at DATETIME NULL;
ALTER TABLE quotes ADD COLUMN accepted_at DATETIME NULL;
ALTER TABLE quotes ADD COLUMN rejected_at DATETIME NULL;
ALTER TABLE quotes ADD COLUMN expires_at DATETIME NULL;
ALTER TABLE quotes ADD COLUMN follow_up_date DATE NULL;
ALTER TABLE quotes ADD COLUMN follow_up_notes TEXT NULL;
ALTER TABLE quotes ADD COLUMN validity_days INT DEFAULT 14;
```

---

## 2. Booking System

### When Quote is Accepted → Create Booking

A booking is created when a quote is accepted. The booking tracks the operational side.

### Booking Status Flow
```
confirmed → deposit_received → fully_paid → in_progress → completed → cancelled
```

| Status | Description |
|--------|-------------|
| `confirmed` | Booking confirmed, awaiting deposit |
| `deposit_received` | Deposit payment received |
| `fully_paid` | Full payment received |
| `in_progress` | Trip is currently happening |
| `completed` | Trip completed successfully |
| `cancelled` | Booking was cancelled |

### New Database Table - bookings
```sql
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  quote_id INT NOT NULL,
  booking_number VARCHAR(50) NOT NULL UNIQUE,

  -- Copied from quote for reference
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  agent_id INT NULL,
  client_id INT NULL,

  -- Booking details
  status ENUM('confirmed', 'deposit_received', 'fully_paid', 'in_progress', 'completed', 'cancelled') DEFAULT 'confirmed',

  -- Financial
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  deposit_due_date DATE NULL,
  deposit_paid_date DATE NULL,
  balance_amount DECIMAL(10,2) DEFAULT 0,
  balance_due_date DATE NULL,
  balance_paid_date DATE NULL,

  -- Trip dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Notes and tracking
  internal_notes TEXT,
  supplier_notes TEXT,

  -- Timestamps
  confirmed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  cancelled_at DATETIME NULL,
  cancellation_reason TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (quote_id) REFERENCES quotes(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (client_id) REFERENCES clients(id),

  INDEX idx_org_status (organization_id, status),
  INDEX idx_booking_number (booking_number),
  INDEX idx_start_date (start_date)
);
```

### Booking Number Format
```
BK-2025-0001, BK-2025-0002, etc.
```

---

## 3. Payment Tracking

### New Database Table - payments
```sql
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  booking_id INT NOT NULL,

  payment_type ENUM('deposit', 'balance', 'additional', 'refund') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',

  payment_method ENUM('bank_transfer', 'credit_card', 'cash', 'other') DEFAULT 'bank_transfer',
  reference_number VARCHAR(100),

  payment_date DATE NOT NULL,
  notes TEXT,

  created_by_user_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),

  INDEX idx_booking (booking_id)
);
```

---

## 4. API Endpoints

### Quote Status Updates
```
PUT /api/quotes/[orgId]/[quoteId]/status
Body: { status: 'sent', follow_up_date: '2025-01-25' }
```

### Bookings CRUD
```
GET    /api/bookings/[orgId]                    - List all bookings
GET    /api/bookings/[orgId]/[bookingId]        - Get booking details
POST   /api/bookings/[orgId]                    - Create booking from quote
PUT    /api/bookings/[orgId]/[bookingId]        - Update booking
DELETE /api/bookings/[orgId]/[bookingId]        - Cancel booking
```

### Payments
```
GET    /api/bookings/[orgId]/[bookingId]/payments    - List payments
POST   /api/bookings/[orgId]/[bookingId]/payments    - Add payment
DELETE /api/bookings/[orgId]/[bookingId]/payments/[id] - Delete payment
```

### Dashboard Stats
```
GET /api/bookings/[orgId]/stats
Returns: { pending_quotes, upcoming_bookings, revenue_this_month, etc. }
```

---

## 5. UI Components

### 5.1 Quotes List Page Enhancement
- Add status badges with colors
- Add "Days until expiry" indicator
- Add "Last viewed" timestamp
- Quick actions: Send, Follow-up, Convert to Booking

### 5.2 Quote Detail Page Enhancement
- Timeline showing status history
- "Send to Client" button (updates status to sent)
- "Mark as Viewed" indicator (auto when client opens)
- "Convert to Booking" button (when accepted)
- Follow-up date picker and notes

### 5.3 New Bookings Page (`/dashboard/bookings`)
**Stats Row:**
- Total Bookings
- Confirmed (awaiting deposit)
- In Progress
- Revenue This Month

**Filters:**
- Status filter
- Date range
- Agent filter

**Table Columns:**
- Booking # | Customer | Agent | Dates | Total | Paid | Status | Actions

### 5.4 Booking Detail Page (`/dashboard/bookings/[id]`)
**Sections:**
1. Header with booking number and status
2. Customer/Agent info
3. Trip details (dates, itinerary link)
4. Payment section
   - Deposit: Amount, Due Date, Paid Date
   - Balance: Amount, Due Date, Paid Date
   - Payment history table
5. Notes (internal + supplier)
6. Action buttons (Update Status, Add Payment, Cancel)

### 5.5 Pipeline/Kanban View (Optional - Phase 2)
Visual board showing quotes/bookings in columns by status

---

## 6. Sidebar Navigation Update

```javascript
const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Quotes', href: '/dashboard/quotes', icon: FileText },
    { name: 'Manual Quote', href: '/dashboard/quotes/create', icon: PenLine },
    { name: 'AI Quote', href: '/dashboard/quotes/ai-generate', icon: Sparkles },
    { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck }, // NEW
    { name: 'Requests', href: '/dashboard/customer-requests', icon: MessageSquare },
    { name: 'Agents', href: '/dashboard/agents', icon: Building2 },
    { name: 'Clients', href: '/dashboard/clients', icon: UserCircle },
    // ... rest
];
```

---

## 7. Client-Facing Quote Page Updates

### Current: `/quotes/view/[quote_number]`

**Add:**
1. Track when page is viewed (update quote status to 'viewed')
2. "Accept Quote" button
3. "Request Changes" button
4. "Reject" option

**On Accept:**
1. Update quote status to 'accepted'
2. Show confirmation message
3. Optionally collect additional info (passport details, etc.)

---

## 8. Notifications & Reminders

### Email Triggers
1. **Quote Sent** - Email to client with quote link
2. **Quote Expiring** - Reminder 3 days before expiry
3. **Quote Accepted** - Confirmation to client + notification to operator
4. **Deposit Due** - Reminder to client
5. **Balance Due** - Reminder to client
6. **Booking Confirmed** - Final confirmation with details

### Dashboard Alerts
- Quotes expiring soon (next 3 days)
- Quotes with overdue follow-ups
- Deposits due this week
- Balances due this week
- Upcoming trips (next 7 days)

---

## 9. Implementation Phases

### Phase 1: Core Booking System (Priority) - COMPLETED
1. [x] Add quote status fields to database
2. [x] Create bookings table
3. [x] Create payments table
4. [x] Build Bookings API endpoints
5. [x] Update Quotes list page with status badges
6. [x] Build Bookings list page
7. [x] Build Booking detail page with payment tracking
8. [x] Add "Convert to Booking" flow
9. [x] Update sidebar navigation
10. [x] Quote status update API

**Note:** Payment tracking (originally Phase 2) was included in Phase 1 implementation.

### Phase 2: Payment Tracking - COMPLETED (Merged into Phase 1)
1. [x] Add payment recording UI
2. [x] Payment history display
3. [x] Deposit/Balance due date tracking
4. [x] Auto-update booking status based on payments

### Phase 3: Client-Side & Notifications
1. Update client-facing quote page
2. Add Accept/Reject functionality
3. Track quote views
4. Set up email notifications
5. Dashboard alerts for due dates

### Phase 4: Advanced Features
1. Pipeline/Kanban view
2. Calendar view of bookings
3. Supplier voucher generation
4. Export to accounting

---

## 10. Database Migration Script

```sql
-- Run on tqa_multi database

-- 1. Update quotes table
ALTER TABLE quotes
  ADD COLUMN sent_at DATETIME NULL,
  ADD COLUMN viewed_at DATETIME NULL,
  ADD COLUMN accepted_at DATETIME NULL,
  ADD COLUMN rejected_at DATETIME NULL,
  ADD COLUMN expires_at DATETIME NULL,
  ADD COLUMN follow_up_date DATE NULL,
  ADD COLUMN follow_up_notes TEXT NULL,
  ADD COLUMN validity_days INT DEFAULT 14;

-- 2. Create bookings table
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  quote_id INT NOT NULL,
  booking_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  agent_id INT NULL,
  client_id INT NULL,
  status ENUM('confirmed', 'deposit_received', 'fully_paid', 'in_progress', 'completed', 'cancelled') DEFAULT 'confirmed',
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  deposit_due_date DATE NULL,
  deposit_paid_date DATE NULL,
  balance_amount DECIMAL(10,2) DEFAULT 0,
  balance_due_date DATE NULL,
  balance_paid_date DATE NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  internal_notes TEXT,
  supplier_notes TEXT,
  confirmed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  cancelled_at DATETIME NULL,
  cancellation_reason TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_org_status (organization_id, status),
  INDEX idx_booking_number (booking_number),
  INDEX idx_start_date (start_date)
);

-- 3. Create payments table
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  booking_id INT NOT NULL,
  payment_type ENUM('deposit', 'balance', 'additional', 'refund') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  payment_method ENUM('bank_transfer', 'credit_card', 'cash', 'other') DEFAULT 'bank_transfer',
  reference_number VARCHAR(100),
  payment_date DATE NOT NULL,
  notes TEXT,
  created_by_user_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_booking (booking_id)
);
```

---

## 11. File Structure

```
app/
  api/
    bookings/
      [orgId]/
        route.ts                    # GET list, POST create
        [bookingId]/
          route.ts                  # GET, PUT, DELETE
          payments/
            route.ts                # GET, POST payments
    quotes/
      [orgId]/
        [quoteId]/
          status/
            route.ts                # PUT status update
  dashboard/
    bookings/
      page.tsx                      # Bookings list
      [id]/
        page.tsx                    # Booking detail
```

---

## 12. Success Metrics

After implementation, track:
- Quote → Booking conversion rate
- Average time from quote to booking
- Payment collection rate
- Revenue by status
- Follow-up effectiveness

---

## Ready to Implement

This documentation provides a complete roadmap. We'll start with **Phase 1** which includes:
1. Database migrations
2. Bookings API
3. Bookings list page
4. Booking detail page
5. Quote status updates
6. Convert quote to booking flow

Estimated time: 2-3 hours for Phase 1 core functionality.
