'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Plus,
  Trash2,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Payment {
  id: number;
  payment_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  reference_number: string;
  payment_date: string;
  notes: string;
  created_by_name: string;
}

const statusColors: { [key: string]: string } = {
  confirmed: 'bg-blue-100 text-blue-700',
  deposit_received: 'bg-yellow-100 text-yellow-700',
  fully_paid: 'bg-green-100 text-green-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700'
};

const statusLabels: { [key: string]: string } = {
  confirmed: 'Confirmed',
  deposit_received: 'Deposit Received',
  fully_paid: 'Fully Paid',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [balanceRemaining, setBalanceRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orgId, setOrgId] = useState<number | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    payment_type: 'deposit',
    amount: '',
    payment_method: 'bank_transfer',
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setOrgId(user.organizationId);
    fetchBooking(user.organizationId);
  }, [id]);

  const fetchBooking = async (organizationId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${organizationId}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch booking');
      const data = await response.json();
      setBooking(data.booking);
      setPayments(data.payments);
      setTotalPaid(data.totalPaid);
      setBalanceRemaining(data.balanceRemaining);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`/api/bookings/${orgId}/${id}/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...paymentForm,
          amount: parseFloat(paymentForm.amount),
          created_by_user_id: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to add payment');

      setShowPaymentModal(false);
      setPaymentForm({
        payment_type: 'deposit',
        amount: '',
        payment_method: 'bank_transfer',
        reference_number: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchBooking(orgId);
    } catch (error) {
      alert('Failed to add payment');
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    if (!orgId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${orgId}/${id}/payments?id=${paymentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete payment');
      fetchBooking(orgId);
    } catch (error) {
      alert('Failed to delete payment');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!orgId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${orgId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: booking.id, status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      setShowStatusModal(false);
      fetchBooking(orgId);
    } catch (error) {
      alert('Failed to update status');
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
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Booking not found</h2>
        <Link href="/dashboard/bookings" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/bookings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{booking.booking_number}</h1>
            <p className="text-gray-600">{booking.destination}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStatusModal(true)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[booking.status]}`}
          >
            {statusLabels[booking.status]}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{booking.customer_name}</p>
                </div>
              </div>
              {booking.customer_email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{booking.customer_email}</p>
                  </div>
                </div>
              )}
              {booking.customer_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{booking.customer_phone}</p>
                  </div>
                </div>
              )}
              {booking.agent_name && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Agent</p>
                    <p className="font-medium">{booking.agent_name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(booking.start_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{formatDate(booking.end_date)}</p>
                </div>
              </div>
            </div>
            {booking.quote_number && (
              <div className="mt-4 pt-4 border-t">
                <Link
                  href={`/dashboard/quotes/${booking.quote_id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Quote: {booking.quote_number}
                </Link>
              </div>
            )}
          </div>

          {/* Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Payment
              </button>
            </div>

            {payments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No payments recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Method</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-sm">{formatDate(payment.payment_date)}</td>
                        <td className="px-4 py-3 text-sm capitalize">{payment.payment_type}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {payment.payment_type === 'refund' ? '-' : ''}
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm capitalize">{payment.payment_method.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Financial Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-lg">{formatCurrency(booking.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Deposit Required</span>
                <span className="font-medium">{formatCurrency(booking.deposit_amount || 0)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Balance Due</span>
                <span className={`font-bold text-lg ${balanceRemaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(balanceRemaining)}
                </span>
              </div>

              {/* Payment status indicators */}
              <div className="pt-4 border-t space-y-2">
                {booking.deposit_due_date && (
                  <div className="flex items-center gap-2 text-sm">
                    {booking.deposit_paid_date ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span>Deposit due: {formatDate(booking.deposit_due_date)}</span>
                  </div>
                )}
                {booking.balance_due_date && (
                  <div className="flex items-center gap-2 text-sm">
                    {booking.balance_paid_date ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span>Balance due: {formatDate(booking.balance_due_date)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.internal_notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Internal Notes</h2>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{booking.internal_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type *</label>
                <select
                  value={paymentForm.payment_type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="deposit">Deposit</option>
                  <option value="balance">Balance</option>
                  <option value="additional">Additional</option>
                  <option value="refund">Refund</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (EUR) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input
                  type="text"
                  value={paymentForm.reference_number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Add Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold mb-4">Update Status</h2>
            <div className="space-y-2">
              {Object.entries(statusLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleUpdateStatus(key)}
                  className={`w-full px-4 py-2 rounded-lg text-left font-medium ${
                    booking.status === key ? statusColors[key] : 'hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
