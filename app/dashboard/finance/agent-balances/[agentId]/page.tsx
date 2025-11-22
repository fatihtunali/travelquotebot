'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Calendar,
  FileText,
  CreditCard,
  RefreshCw,
  Minus
} from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  email: string;
  commission_rate: number;
  commission_type: string;
}

interface Transaction {
  id: number;
  transaction_type: string;
  reference_type: string;
  reference_id: number;
  reference_number: string;
  amount: number;
  running_balance: number;
  description: string;
  currency: string;
  transaction_date: string;
  created_at: string;
  created_by_name: string;
}

interface Balance {
  current: number;
  total_bookings: number;
  total_payments: number;
  total_commissions: number;
  total_adjustments: number;
  total_refunds: number;
}

interface BookingStats {
  total_bookings: number;
  total_booking_value: number;
  paid_bookings: number;
}

const transactionTypeColors: { [key: string]: string } = {
  booking: 'bg-teal-100 text-teal-700',
  payment: 'bg-green-100 text-green-700',
  commission: 'bg-purple-100 text-purple-700',
  adjustment: 'bg-yellow-100 text-yellow-700',
  refund: 'bg-red-100 text-red-700'
};

const transactionTypeIcons: { [key: string]: any } = {
  booking: FileText,
  payment: DollarSign,
  commission: TrendingUp,
  adjustment: RefreshCw,
  refund: Minus
};

export default function AgentTransactionsPage({ params }: { params: Promise<{ agentId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    transaction_type: 'payment',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setOrgId(user.organizationId);
    setUserId(user.id);
    fetchAgentData(user.organizationId);
  }, []);

  const fetchAgentData = async (organizationId: number) => {
    try {
      const token = localStorage.getItem('token');

      // Fetch balance and agent info
      const balanceRes = await fetch(`/api/agents/${organizationId}/${resolvedParams.agentId}/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!balanceRes.ok) throw new Error('Failed to fetch agent data');
      const balanceData = await balanceRes.json();

      setAgent(balanceData.agent);
      setBalance(balanceData.balance);
      setBookingStats(balanceData.bookingStats);

      // Fetch all transactions
      const transRes = await fetch(`/api/agents/${organizationId}/${resolvedParams.agentId}/transactions?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!transRes.ok) throw new Error('Failed to fetch transactions');
      const transData = await transRes.json();
      setTransactions(transData.transactions);
    } catch (error) {
      console.error('Error fetching agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionForm.amount) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/agents/${orgId}/${resolvedParams.agentId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          transaction_type: transactionForm.transaction_type,
          amount: parseFloat(transactionForm.amount),
          description: transactionForm.description,
          transaction_date: transactionForm.transaction_date,
          created_by_user_id: userId
        })
      });

      if (!response.ok) throw new Error('Failed to create transaction');

      setShowTransactionModal(false);
      setTransactionForm({
        transaction_type: 'payment',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: ''
      });
      fetchAgentData(orgId!);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent data...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Agent not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/finance/agent-balances"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
            <p className="text-gray-600">
              {agent.email} - {agent.commission_rate}% {agent.commission_type} commission
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowTransactionModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Balance Summary */}
      {balance && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Current Balance</p>
            <p className={`text-2xl font-bold ${
              balance.current > 0 ? 'text-yellow-600' : balance.current < 0 ? 'text-green-600' : 'text-gray-900'
            }`}>
              {formatCurrency(balance.current)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-teal-600">{formatCurrency(balance.total_bookings)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Total Payments</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(balance.total_payments)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Commissions</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(balance.total_commissions)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Adjustments</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance.total_adjustments)}</p>
          </div>
        </div>
      )}

      {/* Booking Stats */}
      {bookingStats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{bookingStats.total_bookings}</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(bookingStats.total_booking_value || 0)}</p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{bookingStats.paid_bookings}</p>
              <p className="text-sm text-gray-600">Paid Bookings</p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Transaction History</h3>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
            <p className="text-gray-500 mt-1">Transactions will appear here when bookings are made or payments received.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const TypeIcon = transactionTypeIcons[transaction.transaction_type] || FileText;
                  const isDebit = transaction.transaction_type === 'payment' || transaction.transaction_type === 'refund';
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${transactionTypeColors[transaction.transaction_type]}`}>
                          <TypeIcon className="w-3 h-3" />
                          {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {transaction.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {transaction.reference_number ? (
                          <span className="text-teal-600">{transaction.reference_number}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                        isDebit ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {isDebit ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                        transaction.running_balance > 0 ? 'text-yellow-600' : transaction.running_balance < 0 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {formatCurrency(transaction.running_balance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add Transaction</h2>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={transactionForm.transaction_type}
                  onChange={(e) => setTransactionForm({ ...transactionForm, transaction_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="payment">Payment Received</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="refund">Refund</option>
                  <option value="booking">Booking Charge</option>
                  <option value="commission">Commission</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={transactionForm.transaction_date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows={2}
                  placeholder="Description of this transaction"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !transactionForm.amount}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
