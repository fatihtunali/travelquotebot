'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PendingInvoice {
  id: string;
  invoice_number: string;
  operator_id: string;
  operator_name?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  credits_to_add: number;
  status: string;
  due_date: string;
  invoice_date: string;
}

export default function AdminBillingPage() {
  const router = useRouter();
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<PendingInvoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'other'>('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }

    fetchPendingInvoices();
  }, [router]);

  const fetchPendingInvoices = async () => {
    try {
      const response = await fetch('/api/admin/billing/pending', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPendingInvoices(data.invoices);
      } else if (response.status === 403) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching pending invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedInvoice) return;

    setMarking(true);

    try {
      const response = await fetch('/api/admin/billing/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          paymentMethod,
          paymentReference,
          paymentNotes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        setSelectedInvoice(null);
        setPaymentReference('');
        setPaymentNotes('');
        fetchPendingInvoices(); // Refresh list
      } else {
        alert(`❌ ${data.error || 'Failed to mark invoice as paid'}`);
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('❌ Failed to mark invoice as paid. Please try again.');
    } finally {
      setMarking(false);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'text-red-600 bg-red-100';
    if (daysUntilDue === 0) return 'text-orange-600 bg-orange-100';
    if (daysUntilDue <= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Billing Panel
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              {pendingInvoices.length} pending invoices
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bubble-card p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 gradient-orange rounded-full flex items-center justify-center text-2xl">
                ⏳
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Invoices</p>
                <p className="text-3xl font-bold text-orange-600">
                  {pendingInvoices.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bubble-card p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 gradient-green rounded-full flex items-center justify-center text-2xl">
                💰
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pending Amount</p>
                <p className="text-3xl font-bold text-green-600">
                  ₺{pendingInvoices.reduce((sum, inv) => sum + inv.total_amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bubble-card p-6 bg-gradient-to-br from-red-50 to-pink-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 gradient-orange rounded-full flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <div>
                <p className="text-sm text-gray-600">Overdue Invoices</p>
                <p className="text-3xl font-bold text-red-600">
                  {pendingInvoices.filter(inv => getDaysUntilDue(inv.due_date) < 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Invoices Table */}
        <div className="bubble-card p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Pending Invoices</h2>

          {pendingInvoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-xl text-gray-600">No pending invoices!</p>
              <p className="text-sm text-gray-500 mt-2">All payments are up to date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInvoices.map((invoice) => {
                const daysUntilDue = getDaysUntilDue(invoice.due_date);
                const statusColor = getStatusColor(daysUntilDue);

                return (
                  <div
                    key={invoice.id}
                    className="border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-r from-white to-gray-50 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {invoice.invoice_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Operator: {invoice.operator_name || invoice.operator_id}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColor}`}>
                        {daysUntilDue < 0
                          ? `Overdue ${Math.abs(daysUntilDue)}d`
                          : daysUntilDue === 0
                          ? 'Due Today'
                          : `Due in ${daysUntilDue}d`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="text-lg font-semibold text-gray-800">
                          ₺{invoice.amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tax (KDV)</p>
                        <p className="text-lg font-semibold text-gray-800">
                          ₺{invoice.tax_amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-lg font-semibold text-indigo-600">
                          ₺{invoice.total_amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Credits</p>
                        <p className="text-lg font-semibold text-green-600">
                          ₺{invoice.credits_to_add.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        ✅ Mark as Paid
                      </button>
                      <button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-semibold hover:bg-gray-300 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Mark as Paid Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bubble-card p-8 max-w-lg w-full bg-white">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Mark Invoice as Paid
            </h3>

            <div className="bg-indigo-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
              <p className="text-xl font-bold text-indigo-600">
                {selectedInvoice.invoice_number}
              </p>
              <p className="text-sm text-gray-600 mt-3 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-800">
                ₺{selectedInvoice.total_amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Credits to add: ₺{selectedInvoice.credits_to_add.toFixed(2)}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                >
                  <option value="bank_transfer">Bank Transfer (Havale/EFT)</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                  placeholder="Transaction ID, reference number, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                  rows={3}
                  placeholder="Any additional notes about this payment..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedInvoice(null);
                  setPaymentReference('');
                  setPaymentNotes('');
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-semibold hover:bg-gray-300 transition-colors"
                disabled={marking}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsPaid}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={marking}
              >
                {marking ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
