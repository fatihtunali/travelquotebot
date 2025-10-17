import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from './db';

// ============================================
// TYPES
// ============================================

export interface CreditAccount {
  id: string;
  operator_id: string;
  balance: number;
  total_purchased: number;
  total_spent: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreditTransaction {
  id: string;
  credit_account_id: string;
  operator_id: string;
  type: 'deposit' | 'usage' | 'refund' | 'bonus' | 'adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  invoice_id?: string | null;
  itinerary_id?: string | null;
  created_by?: string | null;
  notes?: string | null;
  created_at: Date;
}

export interface Invoice {
  id: string;
  operator_id: string;
  invoice_number: string;
  type: 'deposit' | 'subscription';
  amount: number;
  currency: string;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  credits_to_add: number;
  status: 'pending' | 'paid' | 'canceled';
  payment_method?: string | null;
  payment_link?: string | null;
  payment_reference?: string | null;
  payment_notes?: string | null;
  invoice_date: Date;
  due_date: Date;
  paid_at?: Date | null;
  invoice_pdf_url?: string | null;
  marked_paid_by?: string | null;
  marked_paid_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface PricingConfig {
  id: string;
  item_type: string;
  price_per_unit: number;
  currency: string;
  valid_from: Date;
  valid_until?: Date | null;
  notes?: string | null;
}

// ============================================
// CREDIT ACCOUNT FUNCTIONS
// ============================================

export async function getCreditAccount(operatorId: string): Promise<CreditAccount | null> {
  const account = await queryOne<CreditAccount>(
    'SELECT * FROM credit_accounts WHERE operator_id = ?',
    [operatorId]
  );

  if (!account) return null;

  // Ensure numeric fields are numbers (MySQL may return strings)
  return {
    ...account,
    balance: Number(account.balance),
    total_purchased: Number(account.total_purchased),
    total_spent: Number(account.total_spent),
  };
}

export async function createCreditAccount(
  operatorId: string,
  initialBalance: number = 0
): Promise<CreditAccount> {
  const id = uuidv4();

  await execute(
    `INSERT INTO credit_accounts (id, operator_id, balance, total_purchased, total_spent)
     VALUES (?, ?, ?, ?, ?)`,
    [id, operatorId, initialBalance, initialBalance, 0]
  );

  const account = await getCreditAccount(operatorId);
  if (!account) {
    throw new Error('Failed to create credit account');
  }

  return account;
}

export async function getOrCreateCreditAccount(operatorId: string): Promise<CreditAccount> {
  let account = await getCreditAccount(operatorId);
  if (!account) {
    account = await createCreditAccount(operatorId);
  }
  return account;
}

// ============================================
// CREDIT TRANSACTION FUNCTIONS
// ============================================

export async function addCredits(
  operatorId: string,
  amount: number,
  description: string,
  type: 'deposit' | 'bonus' | 'refund' | 'adjustment' = 'deposit',
  options: {
    invoiceId?: string;
    createdBy?: string;
    notes?: string;
  } = {}
): Promise<CreditTransaction> {
  const account = await getOrCreateCreditAccount(operatorId);
  const balanceBefore = account.balance;
  const balanceAfter = balanceBefore + amount;

  // Create transaction record
  const transactionId = uuidv4();
  await execute(
    `INSERT INTO credit_transactions
     (id, credit_account_id, operator_id, type, amount, balance_before, balance_after,
      description, invoice_id, created_by, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transactionId,
      account.id,
      operatorId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      description,
      options.invoiceId || null,
      options.createdBy || null,
      options.notes || null,
    ]
  );

  // Update account balance
  await execute(
    `UPDATE credit_accounts
     SET balance = ?,
         total_purchased = total_purchased + ?,
         updated_at = NOW()
     WHERE operator_id = ?`,
    [balanceAfter, amount, operatorId]
  );

  const transaction = await queryOne<CreditTransaction>(
    'SELECT * FROM credit_transactions WHERE id = ?',
    [transactionId]
  );

  if (!transaction) {
    throw new Error('Failed to create credit transaction');
  }

  return transaction;
}

export async function deductCredits(
  operatorId: string,
  amount: number,
  description: string,
  options: {
    itineraryId?: string;
    createdBy?: string;
    notes?: string;
  } = {}
): Promise<CreditTransaction> {
  const account = await getOrCreateCreditAccount(operatorId);
  const balanceBefore = account.balance;

  if (balanceBefore < amount) {
    throw new Error('Insufficient credits');
  }

  const balanceAfter = balanceBefore - amount;

  // Create transaction record
  const transactionId = uuidv4();
  await execute(
    `INSERT INTO credit_transactions
     (id, credit_account_id, operator_id, type, amount, balance_before, balance_after,
      description, itinerary_id, created_by, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transactionId,
      account.id,
      operatorId,
      'usage',
      -amount, // Negative for deduction
      balanceBefore,
      balanceAfter,
      description,
      options.itineraryId || null,
      options.createdBy || null,
      options.notes || null,
    ]
  );

  // Update account balance
  await execute(
    `UPDATE credit_accounts
     SET balance = ?,
         total_spent = total_spent + ?,
         updated_at = NOW()
     WHERE operator_id = ?`,
    [balanceAfter, amount, operatorId]
  );

  const transaction = await queryOne<CreditTransaction>(
    'SELECT * FROM credit_transactions WHERE id = ?',
    [transactionId]
  );

  if (!transaction) {
    throw new Error('Failed to create credit transaction');
  }

  return transaction;
}

export async function getTransactionHistory(
  operatorId: string,
  limit: number = 50,
  offset: number = 0
): Promise<CreditTransaction[]> {
  return await query<CreditTransaction>(
    `SELECT * FROM credit_transactions
     WHERE operator_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [operatorId, limit, offset]
  );
}

// ============================================
// PRICING FUNCTIONS
// ============================================

export async function getCurrentPricing(itemType: string = 'itinerary_generation'): Promise<PricingConfig> {
  const pricing = await queryOne<PricingConfig>(
    `SELECT * FROM pricing_config
     WHERE item_type = ?
     AND valid_from <= NOW()
     AND (valid_until IS NULL OR valid_until > NOW())
     ORDER BY valid_from DESC
     LIMIT 1`,
    [itemType]
  );

  if (!pricing) {
    throw new Error(`No pricing configuration found for ${itemType}`);
  }

  // Ensure numeric fields are numbers (MySQL may return strings)
  return {
    ...pricing,
    price_per_unit: Number(pricing.price_per_unit),
  };
}

// ============================================
// INVOICE FUNCTIONS
// ============================================

// Helper function to convert invoice numeric fields
function convertInvoiceNumbers(invoice: Invoice): Invoice {
  return {
    ...invoice,
    amount: Number(invoice.amount),
    tax_rate: Number(invoice.tax_rate),
    tax_amount: Number(invoice.tax_amount),
    total_amount: Number(invoice.total_amount),
    credits_to_add: Number(invoice.credits_to_add),
  };
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Get next number for this year
  const result = await queryOne<{ next_number: number }>(
    'SELECT next_number FROM invoice_sequence WHERE year = ?',
    [year]
  );

  let nextNumber = 1;

  if (result) {
    nextNumber = result.next_number;
    // Increment for next invoice
    await execute(
      'UPDATE invoice_sequence SET next_number = next_number + 1 WHERE year = ?',
      [year]
    );
  } else {
    // First invoice of the year
    await execute(
      'INSERT INTO invoice_sequence (year, next_number) VALUES (?, ?)',
      [year, 2]
    );
  }

  // Format: TQB-2025-0001
  return `TQB-${year}-${String(nextNumber).padStart(4, '0')}`;
}

export async function createInvoice(
  operatorId: string,
  amount: number,
  options: {
    taxRate?: number;
    currency?: string;
    type?: 'deposit' | 'subscription';
    paymentLink?: string;
  } = {}
): Promise<Invoice> {
  const invoiceNumber = await generateInvoiceNumber();
  const taxRate = options.taxRate || 20.0; // Default KDV 20%
  const currency = options.currency || 'TRY';
  const type = options.type || 'deposit';

  const taxAmount = amount * (taxRate / 100);
  const totalAmount = amount + taxAmount;
  const creditsToAdd = amount; // 1:1 ratio (₺1 = 1 credit)

  const invoiceId = uuidv4();
  const now = new Date();
  const dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

  await execute(
    `INSERT INTO invoices
     (id, operator_id, invoice_number, type, amount, currency, tax_rate, tax_amount,
      total_amount, credits_to_add, status, invoice_date, due_date, payment_link)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      invoiceId,
      operatorId,
      invoiceNumber,
      type,
      amount,
      currency,
      taxRate,
      taxAmount,
      totalAmount,
      creditsToAdd,
      'pending',
      now,
      dueDate,
      options.paymentLink || null,
    ]
  );

  const invoice = await queryOne<Invoice>(
    'SELECT * FROM invoices WHERE id = ?',
    [invoiceId]
  );

  if (!invoice) {
    throw new Error('Failed to create invoice');
  }

  return convertInvoiceNumbers(invoice);
}

export async function markInvoiceAsPaid(
  invoiceId: string,
  paymentDetails: {
    paymentMethod?: 'card' | 'bank_transfer' | 'other';
    paymentReference?: string;
    paymentNotes?: string;
    markedBy?: string;
  } = {}
): Promise<Invoice> {
  let invoice = await queryOne<Invoice>(
    'SELECT * FROM invoices WHERE id = ?',
    [invoiceId]
  );

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Convert numeric fields
  invoice = convertInvoiceNumbers(invoice);

  if (invoice.status === 'paid') {
    throw new Error('Invoice already paid');
  }

  // Update invoice status
  await execute(
    `UPDATE invoices
     SET status = 'paid',
         paid_at = NOW(),
         payment_method = ?,
         payment_reference = ?,
         payment_notes = ?,
         marked_paid_by = ?,
         marked_paid_at = NOW(),
         updated_at = NOW()
     WHERE id = ?`,
    [
      paymentDetails.paymentMethod || null,
      paymentDetails.paymentReference || null,
      paymentDetails.paymentNotes || null,
      paymentDetails.markedBy || null,
      invoiceId,
    ]
  );

  // Add credits to account
  await addCredits(
    invoice.operator_id,
    invoice.credits_to_add,
    `Credit purchase - Invoice ${invoice.invoice_number}`,
    'deposit',
    {
      invoiceId: invoice.id,
      createdBy: paymentDetails.markedBy,
      notes: paymentDetails.paymentNotes,
    }
  );

  const updatedInvoice = await queryOne<Invoice>(
    'SELECT * FROM invoices WHERE id = ?',
    [invoiceId]
  );

  if (!updatedInvoice) {
    throw new Error('Failed to update invoice');
  }

  return convertInvoiceNumbers(updatedInvoice);
}

export async function getOperatorInvoices(
  operatorId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Invoice[]> {
  const invoices = await query<Invoice>(
    `SELECT * FROM invoices
     WHERE operator_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [operatorId, limit, offset]
  );

  return invoices.map(convertInvoiceNumbers);
}

export async function getPendingInvoices(limit: number = 100): Promise<Invoice[]> {
  const invoices = await query<Invoice>(
    `SELECT i.*, o.company_name as operator_name
     FROM invoices i
     JOIN operators o ON i.operator_id = o.id
     WHERE i.status = 'pending'
     ORDER BY i.due_date ASC
     LIMIT ?`,
    [limit]
  );

  return invoices.map(convertInvoiceNumbers);
}

// ============================================
// CHECK FUNCTIONS
// ============================================

export async function checkSufficientCredits(
  operatorId: string,
  requiredAmount: number
): Promise<{ sufficient: boolean; balance: number; required: number }> {
  const account = await getOrCreateCreditAccount(operatorId);

  return {
    sufficient: account.balance >= requiredAmount,
    balance: account.balance,
    required: requiredAmount,
  };
}

export async function checkAndDeductForItinerary(
  operatorId: string,
  itineraryId?: string
): Promise<{ success: boolean; newBalance: number; cost: number }> {
  // Get current pricing
  const pricing = await getCurrentPricing('itinerary_generation');
  const cost = pricing.price_per_unit;

  // Check if sufficient credits
  const check = await checkSufficientCredits(operatorId, cost);

  if (!check.sufficient) {
    throw new Error(
      `Insufficient credits. Balance: ₺${check.balance.toFixed(2)}, Required: ₺${cost.toFixed(2)}`
    );
  }

  // Deduct credits
  await deductCredits(
    operatorId,
    cost,
    'Itinerary generation',
    { itineraryId }
  );

  return {
    success: true,
    newBalance: check.balance - cost,
    cost,
  };
}
