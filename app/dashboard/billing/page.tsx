'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreditBalance {
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  pricing: {
    pricePerItinerary: number;
    currency: string;
  };
  itinerariesRemaining: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  invoice_date: string;
  due_date: string;
  paid_at: string | null;
}

export default function BillingPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch balance
      const balanceRes = await fetch('/api/credits/balance', {
        credentials: 'include',
      });
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }

      // Fetch recent transactions
      const transactionsRes = await fetch('/api/credits/transactions?limit=10', {
        credentials: 'include',
      });
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions);
      }

      // Fetch invoices
      const invoicesRes = await fetch('/api/credits/invoices?limit=10', {
        credentials: 'include',
      });
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.invoices);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCredits = async () => {
    const amount = parseFloat(purchaseAmount);

    if (!amount || amount < 100) {
      alert('Minimum purchase amount is ₺100');
      return;
    }

    if (amount > 10000) {
      alert('Maximum purchase amount is ₺10,000');
      return;
    }

    setPurchasing(true);

    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Invoice ${data.invoice.invoiceNumber} created! Check your email for payment instructions.`);
        setShowPurchaseModal(false);
        setPurchaseAmount('');
        fetchData(); // Refresh data
      } else {
        alert(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2500];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Loading billing information...</div>
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
                Billing & Credits
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Credit Balance Card */}
        <div className="bubble-card p-8 mb-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 gradient-purple rounded-full flex items-center justify-center text-3xl shadow-lg">
                💰
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Your Credit Balance</h2>
                <p className="text-gray-600">Pay-as-you-go credits</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-sm text-gray-600 mb-2">Current Balance</p>
              <p className="text-4xl font-bold text-indigo-600">
                ₺{balance?.balance ? Number(balance.balance).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                = {balance?.itinerariesRemaining || 0} itineraries
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-sm text-gray-600 mb-2">Total Purchased</p>
              <p className="text-3xl font-bold text-green-600">
                ₺{balance?.totalPurchased ? Number(balance.totalPurchased).toFixed(2) : '0.00'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-sm text-gray-600 mb-2">Total Used</p>
              <p className="text-3xl font-bold text-purple-600">
                ₺{balance?.totalSpent ? Number(balance.totalSpent).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white p-4 rounded-2xl">
            <div>
              <p className="text-sm text-gray-600">Cost per itinerary</p>
              <p className="text-xl font-bold text-gray-800">
                ₺{balance?.pricing.pricePerItinerary ? Number(balance.pricing.pricePerItinerary).toFixed(2) : '1.00'} each
              </p>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Add Credits
            </button>
          </div>
        </div>

        {/* Quick Add Credits */}
        <div className="bubble-card p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Quick Add Credits</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setPurchaseAmount(amount.toString());
                  setShowPurchaseModal(true);
                }}
                className="bubble-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 text-center group hover:shadow-xl transition-all"
              >
                <p className="text-2xl font-bold text-indigo-600">₺{amount}</p>
                <p className="text-xs text-gray-600 mt-1">{amount} itineraries</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bubble-card p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      tx.type === 'deposit' || tx.type === 'bonus' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'bonus' ? '✅' : '⬇️'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{tx.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      Number(tx.amount) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Number(tx.amount) >= 0 ? '+' : ''}₺{Math.abs(Number(tx.amount)).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Balance: ₺{Number(tx.balance_after).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="bubble-card p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Invoices</h3>
          {invoices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{invoice.invoice_number}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(invoice.invoice_date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">
                      ₺{Number(invoice.total_amount).toFixed(2)}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status === 'paid' ? '✅ Paid' : invoice.status === 'pending' ? '⏳ Pending' : invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bubble-card p-8 max-w-md w-full bg-white">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Add Credits</h3>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount (₺)
              </label>
              <input
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                min="100"
                max="10000"
                step="50"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none text-lg font-semibold"
                placeholder="100"
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum: ₺100 • Maximum: ₺10,000
              </p>
            </div>

            {purchaseAmount && parseFloat(purchaseAmount) >= 100 && (
              <div className="bg-indigo-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Credits:</span>
                  <span className="font-semibold">₺{parseFloat(purchaseAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">KDV (20%):</span>
                  <span className="font-semibold">₺{(parseFloat(purchaseAmount) * 0.2).toFixed(2)}</span>
                </div>
                <div className="border-t border-indigo-200 my-2"></div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-indigo-600">₺{(parseFloat(purchaseAmount) * 1.2).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  = {parseFloat(purchaseAmount)} itineraries
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPurchaseModal(false);
                  setPurchaseAmount('');
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-semibold hover:bg-gray-300 transition-colors"
                disabled={purchasing}
              >
                Cancel
              </button>
              <button
                onClick={handlePurchaseCredits}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={purchasing || !purchaseAmount || parseFloat(purchaseAmount) < 100}
              >
                {purchasing ? 'Creating...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
