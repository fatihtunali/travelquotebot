'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Send,
  Printer,
  Download,
  DollarSign,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Mail,
  MapPin
} from 'lucide-react';

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  booking_id: number;
  booking_number: string;
  destination: string;
  booking_customer: string;
  start_date: string;
  end_date: string;
  bill_to_name: string;
  bill_to_email: string;
  bill_to_address: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: string;
  invoice_date: string;
  due_date: string;
  notes: string;
  terms: string;
  created_at: string;
}

interface Payment {
  id: number;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number: string;
  notes: string;
}

const statusColors: { [key: string]: string } = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-teal-100 text-teal-700',
  partially_paid: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500'
};

const statusLabels: { [key: string]: string } = {
  draft: 'Draft',
  sent: 'Sent',
  partially_paid: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled'
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [billToName, setBillToName] = useState('');
  const [billToEmail, setBillToEmail] = useState('');
  const [billToAddress, setBillToAddress] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setOrgId(user.organizationId);
    fetchInvoice(user.organizationId);
  }, [invoiceId]);

  const fetchInvoice = async (organizationId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/finance/${organizationId}/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch invoice');
      const data = await response.json();

      setInvoice(data.invoice);
      setItems(data.items || []);
      setPayments(data.payments || []);

      // Set editable fields
      setBillToName(data.invoice.bill_to_name || '');
      setBillToEmail(data.invoice.bill_to_email || '');
      setBillToAddress(data.invoice.bill_to_address || '');
      setDueDate(data.invoice.due_date?.split('T')[0] || '');
      setNotes(data.invoice.notes || '');
      setTerms(data.invoice.terms || '');
      setTaxRate(data.invoice.tax_rate || 0);
      setDiscountAmount(data.invoice.discount_amount || 0);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discountAmount;
    return { subtotal, taxAmount, total };
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      total: field === 'quantity' || field === 'unit_price'
        ? (field === 'quantity' ? value : newItems[index].quantity) *
          (field === 'unit_price' ? value : newItems[index].unit_price)
        : newItems[index].total
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const { subtotal, taxAmount, total } = calculateTotals();

      const response = await fetch(`/api/finance/${orgId}/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bill_to_name: billToName,
          bill_to_email: billToEmail,
          bill_to_address: billToAddress,
          due_date: dueDate,
          notes,
          terms,
          tax_rate: taxRate,
          discount_amount: discountAmount,
          items
        })
      });

      if (response.ok) {
        setIsEditing(false);
        fetchInvoice(orgId);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!orgId) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/finance/${orgId}/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'sent' })
      });
      fetchInvoice(orgId);
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  const handleCancelInvoice = async () => {
    if (!orgId || !confirm('Are you sure you want to cancel this invoice?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/finance/${orgId}/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/dashboard/finance/invoices');
    } catch (error) {
      console.error('Error cancelling invoice:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Invoice not found</h3>
        <Link href="/dashboard/finance/invoices" className="text-teal-600 hover:text-teal-700 mt-2 inline-block">
          Back to invoices
        </Link>
      </div>
    );
  }

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/finance/invoices"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                {statusLabels[invoice.status]}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              Created {formatDate(invoice.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === 'draft' && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button
                onClick={handleSendInvoice}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </>
          )}
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
          {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
            <button
              onClick={handleCancelInvoice}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              Cancel Invoice
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bill To Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill To</h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={billToName}
                    onChange={(e) => setBillToName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={billToEmail}
                    onChange={(e) => setBillToEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={billToAddress}
                    onChange={(e) => setBillToAddress(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{invoice.bill_to_name}</p>
                {invoice.bill_to_email && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {invoice.bill_to_email}
                  </p>
                )}
                {invoice.bill_to_address && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {invoice.bill_to_address}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Invoice Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              {isEditing && (
                <button
                  onClick={addItem}
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Description</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600 w-20">Qty</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600 w-32">Price</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600 w-32">Total</th>
                    {isEditing && <th className="w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          item.description
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                        ) : (
                          formatCurrency(item.unit_price)
                        )}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </td>
                      {isEditing && (
                        <td className="py-3">
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600">Tax</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={taxRate}
                          onChange={(e) => setTaxRate(Number(e.target.value))}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                        />
                        <span>%</span>
                      </div>
                    ) : (
                      <span className="font-medium">{formatCurrency(taxAmount)} ({taxRate}%)</span>
                    )}
                  </div>
                  {(discountAmount > 0 || isEditing) && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600">Discount</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
                        />
                      ) : (
                        <span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Paid</span>
                    <span>{formatCurrency(invoice.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-teal-600">
                    <span>Balance Due</span>
                    <span>{formatCurrency(total - invoice.amount_paid)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                {isEditing ? (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Add notes to the invoice..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-sm text-gray-600">{invoice.notes || 'No notes'}</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions</h3>
                {isEditing ? (
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    rows={4}
                    placeholder="Add terms and conditions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                ) : (
                  <p className="text-sm text-gray-600">{invoice.terms || 'No terms specified'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Invoice Date</span>
                <span className="font-medium">{formatDate(invoice.invoice_date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Due Date</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                ) : (
                  <span className="font-medium">{formatDate(invoice.due_date)}</span>
                )}
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Booking</p>
                <Link
                  href={`/dashboard/bookings/${invoice.booking_id}`}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  {invoice.booking_number}
                </Link>
                {invoice.destination && (
                  <p className="text-sm text-gray-500">{invoice.destination}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No payments recorded</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-gray-500">{payment.payment_method}</p>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(payment.payment_date)}</p>
                    </div>
                    {payment.reference_number && (
                      <p className="text-xs text-gray-500 mt-1">Ref: {payment.reference_number}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
