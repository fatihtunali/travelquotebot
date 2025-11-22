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
  AlertCircle,
  FileText,
  Download,
  Truck,
  Receipt
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

interface Supplier {
  id: number;
  name: string;
  type: string;
  service_date: string;
  service_details: string;
  cost: number;
  currency: string;
  confirmation_number: string;
  notes: string;
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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [balanceRemaining, setBalanceRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'suppliers' | 'vouchers'>('details');
  const [orgId, setOrgId] = useState<number | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    payment_type: 'deposit',
    amount: '',
    payment_method: 'bank_transfer',
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    type: 'hotel',
    service_date: '',
    service_details: '',
    cost: '',
    currency: 'EUR',
    confirmation_number: '',
    notes: ''
  });

  const [invoiceForm, setInvoiceForm] = useState({
    bill_to_name: '',
    bill_to_email: '',
    bill_to_address: '',
    due_date: '',
    tax_rate: 0,
    notes: '',
    terms: 'Payment due within 14 days of invoice date.'
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
      setSuppliers(data.suppliers || []);
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

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${orgId}/${id}/suppliers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...supplierForm,
          cost: parseFloat(supplierForm.cost)
        })
      });

      if (!response.ok) throw new Error('Failed to add supplier');

      setShowSupplierModal(false);
      setSupplierForm({
        name: '',
        type: 'hotel',
        service_date: '',
        service_details: '',
        cost: '',
        currency: 'EUR',
        confirmation_number: '',
        notes: ''
      });
      fetchBooking(orgId);
    } catch (error) {
      alert('Failed to add supplier');
    }
  };

  const handleDeleteSupplier = async (supplierId: number) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    if (!orgId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${orgId}/${id}/suppliers?id=${supplierId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete supplier');
      fetchBooking(orgId);
    } catch (error) {
      alert('Failed to delete supplier');
    }
  };

  const handleOpenInvoiceModal = () => {
    // Pre-fill form with booking data
    setInvoiceForm({
      bill_to_name: booking?.customer_name || '',
      bill_to_email: booking?.customer_email || '',
      bill_to_address: '',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tax_rate: 0,
      notes: `Invoice for booking ${booking?.booking_number} - ${booking?.destination}`,
      terms: 'Payment due within 14 days of invoice date.'
    });
    setShowInvoiceModal(true);
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !booking) return;
    setGeneratingInvoice(true);

    try {
      const token = localStorage.getItem('token');

      // Create invoice items from the booking
      const items = [
        {
          description: `${booking.destination} - Travel Package`,
          quantity: 1,
          unit_price: booking.total_amount
        }
      ];

      const response = await fetch(`/api/finance/${orgId}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          booking_id: booking.id,
          bill_to_type: 'customer',
          bill_to_name: invoiceForm.bill_to_name,
          bill_to_email: invoiceForm.bill_to_email,
          bill_to_address: invoiceForm.bill_to_address,
          items,
          tax_rate: invoiceForm.tax_rate,
          discount_amount: 0,
          due_date: invoiceForm.due_date,
          notes: invoiceForm.notes,
          terms: invoiceForm.terms
        })
      });

      if (!response.ok) throw new Error('Failed to generate invoice');

      const data = await response.json();
      setShowInvoiceModal(false);

      // Redirect to the new invoice
      router.push(`/dashboard/finance/invoices/${data.invoiceId}`);
    } catch (error) {
      alert('Failed to generate invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const generateVoucher = (supplier: Supplier) => {
    if (!booking) return;

    const voucherContent = `
================================================================================
                              SUPPLIER VOUCHER
================================================================================

Voucher Number: VCH-${booking.id}-${supplier.id}-${Date.now().toString(36).toUpperCase()}
Generated: ${new Date().toLocaleDateString()}

--------------------------------------------------------------------------------
BOOKING INFORMATION
--------------------------------------------------------------------------------
Booking Reference: ${booking.booking_number}
Quote Number: ${booking.quote_number || 'N/A'}

--------------------------------------------------------------------------------
GUEST INFORMATION
--------------------------------------------------------------------------------
Guest Name: ${booking.customer_name}
Email: ${booking.customer_email || 'N/A'}
Phone: ${booking.customer_phone || 'N/A'}

--------------------------------------------------------------------------------
SERVICE DETAILS
--------------------------------------------------------------------------------
Supplier: ${supplier.name}
Service Type: ${supplier.type.charAt(0).toUpperCase() + supplier.type.slice(1)}
Service Date: ${formatDate(supplier.service_date)}
${supplier.confirmation_number ? `Confirmation #: ${supplier.confirmation_number}` : ''}

Details:
${supplier.service_details}

${supplier.notes ? `Notes: ${supplier.notes}` : ''}

--------------------------------------------------------------------------------
TRIP INFORMATION
--------------------------------------------------------------------------------
Destination: ${booking.destination}
Start Date: ${formatDate(booking.start_date)}
End Date: ${formatDate(booking.end_date)}

================================================================================
                    This voucher confirms the reservation.
          Please present this voucher upon arrival at the service location.
================================================================================
    `.trim();

    // Create and download the voucher
    const blob = new Blob([voucherContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Voucher-${supplier.name.replace(/\s+/g, '-')}-${booking.booking_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateAllVouchers = () => {
    suppliers.forEach(supplier => {
      setTimeout(() => generateVoucher(supplier), 100);
    });
  };

  const exportBookingData = () => {
    if (!booking) return;

    const totalCosts = suppliers.reduce((sum, s) => sum + s.cost, 0);

    const exportData = {
      booking: {
        booking_number: booking.booking_number,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        destination: booking.destination,
        start_date: booking.start_date,
        end_date: booking.end_date,
        total_amount: booking.total_amount,
        status: booking.status
      },
      financial_summary: {
        total_revenue: booking.total_amount,
        total_paid: totalPaid,
        balance_due: balanceRemaining,
        total_costs: totalCosts,
        gross_profit: booking.total_amount - totalCosts,
        profit_margin: booking.total_amount > 0 ? ((booking.total_amount - totalCosts) / booking.total_amount * 100).toFixed(2) + '%' : '0%'
      },
      payments: payments.map(p => ({
        date: p.payment_date,
        type: p.payment_type,
        amount: p.amount,
        method: p.payment_method
      })),
      suppliers: suppliers.map(s => ({
        name: s.name,
        type: s.type,
        service_date: s.service_date,
        cost: s.cost,
        currency: s.currency
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Booking-${booking.booking_number}-Export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            onClick={handleOpenInvoiceModal}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1"
          >
            <Receipt className="w-4 h-4" />
            Generate Invoice
          </button>
          <button
            onClick={exportBookingData}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowStatusModal(true)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[booking.status]}`}
          >
            {statusLabels[booking.status]}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'details' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Details & Payments
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'suppliers' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Suppliers
        </button>
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'vouchers' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Vouchers
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <>
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
            </>
          )}

          {/* Suppliers Tab */}
          {activeTab === 'suppliers' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Suppliers & Services</h2>
                <button
                  onClick={() => setShowSupplierModal(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Supplier
                </button>
              </div>

              {suppliers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No suppliers added yet</p>
              ) : (
                <div className="space-y-4">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Truck className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{supplier.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{supplier.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{supplier.currency} {supplier.cost.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(supplier.service_date)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mt-3 text-gray-600">{supplier.service_details}</p>
                      {supplier.confirmation_number && (
                        <p className="text-sm text-gray-500 mt-1">
                          Confirmation: {supplier.confirmation_number}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <button
                          onClick={() => generateVoucher(supplier)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          Generate Voucher
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Costs Summary */}
              {suppliers.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Total Supplier Costs</span>
                    <span className="font-bold text-lg">
                      EUR {suppliers.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vouchers Tab */}
          {activeTab === 'vouchers' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Voucher Generation</h2>
                {suppliers.length > 0 && (
                  <button
                    onClick={generateAllVouchers}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download All
                  </button>
                )}
              </div>

              {suppliers.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Add suppliers to generate vouchers</p>
                  <button
                    onClick={() => setActiveTab('suppliers')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Go to Suppliers tab
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{supplier.name}</h3>
                          <p className="text-sm text-gray-500">
                            {supplier.type} - {formatDate(supplier.service_date)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => generateVoucher(supplier)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Supplier</h2>
              <button onClick={() => setShowSupplierModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g. Hilton Hotel, Airport Transfer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                <select
                  value={supplierForm.type}
                  onChange={(e) => setSupplierForm({ ...supplierForm, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="hotel">Hotel</option>
                  <option value="transfer">Transfer</option>
                  <option value="activity">Activity</option>
                  <option value="flight">Flight</option>
                  <option value="insurance">Insurance</option>
                  <option value="guide">Guide</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Date *</label>
                <input
                  type="date"
                  required
                  value={supplierForm.service_date}
                  onChange={(e) => setSupplierForm({ ...supplierForm, service_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Details *</label>
                <textarea
                  required
                  value={supplierForm.service_details}
                  onChange={(e) => setSupplierForm({ ...supplierForm, service_details: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Room type, transfer details, activity description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={supplierForm.cost}
                    onChange={(e) => setSupplierForm({ ...supplierForm, cost: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={supplierForm.currency}
                    onChange={(e) => setSupplierForm({ ...supplierForm, currency: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="TRY">TRY</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Number</label>
                <input
                  type="text"
                  value={supplierForm.confirmation_number}
                  onChange={(e) => setSupplierForm({ ...supplierForm, confirmation_number: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Booking confirmation from supplier"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={supplierForm.notes}
                  onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Add Supplier
                </button>
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
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

      {/* Generate Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Generate Invoice</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerateInvoice} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Booking: <span className="font-medium">{booking.booking_number}</span></p>
                <p className="text-sm text-gray-600">Amount: <span className="font-medium">{formatCurrency(booking.total_amount)}</span></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill To Name *</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.bill_to_name}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, bill_to_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={invoiceForm.bill_to_email}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, bill_to_email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={invoiceForm.bill_to_address}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, bill_to_address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.due_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={invoiceForm.tax_rate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, tax_rate: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <textarea
                  value={invoiceForm.terms}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, terms: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={generatingInvoice}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingInvoice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      Generate Invoice
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
