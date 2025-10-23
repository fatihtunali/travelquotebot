'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CustomerRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, [filter]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const fetchQuotes = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    try {
      const response = await fetch(
        `/api/requests/${parsedUser.organizationId}?status=${filter}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUpNotes.trim()) {
      alert('Please enter follow-up notes');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const parsedUser = JSON.parse(userData!);

    try {
      const response = await fetch(`/api/requests/${parsedUser.organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quoteId: selectedQuote.id,
          action: 'follow_up',
          notes: followUpNotes
        })
      });

      if (response.ok) {
        setShowFollowUpModal(false);
        setFollowUpNotes('');
        setSelectedQuote(null);
        fetchQuotes();
      }
    } catch (error) {
      console.error('Error saving follow-up:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (quote: any) => {
    if (quote.status === 'accepted') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Accepted</span>;
    } else if (quote.status === 'rejected') {
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Rejected</span>;
    } else if (quote.status === 'sent' && quote.viewed_at) {
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Viewed</span>;
    } else if (quote.status === 'sent') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">Sent</span>;
    } else if (quote.status === 'draft') {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Draft</span>;
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{quote.status}</span>;
  };

  const getPriorityIndicator = (quote: any) => {
    if (quote.status === 'sent' && quote.viewed_at && !quote.last_follow_up_at) {
      return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Viewed - Needs Follow-up"></div>;
    } else if (quote.status === 'sent' && quote.days_since_last_contact > 3) {
      return <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Overdue Follow-up"></div>;
    }
    return null;
  };

  const handleStatusChange = async (quoteId: number, action: string) => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const parsedUser = JSON.parse(userData!);

    try {
      const response = await fetch(`/api/requests/${parsedUser.organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quoteId, action })
      });

      if (response.ok) {
        fetchQuotes(); // Refresh the list
      } else {
        alert('Failed to update quote status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update quote status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading customer requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Customer Requests
              </h1>
              <p className="text-gray-600 mt-1">Track and follow up with your quote requests</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4">
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4">
              <p className="text-sm text-gray-600 font-medium">Sent</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.sent}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4">
              <p className="text-sm text-gray-600 font-medium">Viewed</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.viewed}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4">
              <p className="text-sm text-gray-600 font-medium">Needs Follow-up</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.needsFollowUp}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4">
              <p className="text-sm text-gray-600 font-medium">Accepted</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.accepted}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4">
              <p className="text-sm text-gray-600 font-medium">Draft</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">{stats.draft}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'draft', 'sent', 'accepted', 'rejected'].map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === status
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Quotes Table */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">!</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quote #</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Destination</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dates</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Value</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Contact</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      No customer requests found
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-2 py-3">
                        {getPriorityIndicator(quote)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{quote.quote_number}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{quote.customer_name}</div>
                          <div className="text-xs text-gray-500">{quote.customer_email}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {quote.customer_phone ? (
                          <a
                            href={`https://wa.me/${quote.customer_phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-xs font-medium"
                            title={quote.customer_phone}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">No phone</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm text-gray-900">{quote.destination}</span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          {quote.start_date ? new Date(quote.start_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          to {quote.end_date ? new Date(quote.end_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          €{Number(quote.total_price || 0).toFixed(0)}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {getStatusBadge(quote)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          {quote.last_follow_up_at
                            ? new Date(quote.last_follow_up_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})
                            : quote.sent_at
                            ? new Date(quote.sent_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})
                            : 'Never'}
                        </div>
                        {quote.days_since_last_contact !== null && (
                          <div className="text-xs text-gray-500">
                            {quote.days_since_last_contact}d ago
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === quote.id ? null : quote.id);
                            }}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span className="text-xs font-medium">Actions</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {openDropdown === quote.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdown(null);
                                  router.push(`/dashboard/quotes/${quote.id}`);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Details
                              </button>

                              {quote.status !== 'accepted' && quote.status !== 'rejected' && quote.status !== 'expired' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    setSelectedQuote(quote);
                                    setShowFollowUpModal(true);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                  </svg>
                                  Follow Up
                                </button>
                              )}

                              {quote.status === 'draft' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    if (confirm('Send this quote to the customer?')) {
                                      handleStatusChange(quote.id, 'mark_sent');
                                    }
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 border-t border-gray-100"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                  Send Quote
                                </button>
                              )}

                              {quote.status === 'sent' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdown(null);
                                      if (confirm('Mark this quote as accepted and create booking?')) {
                                        handleStatusChange(quote.id, 'mark_accepted');
                                      }
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 border-t border-gray-100"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Accept Quote
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdown(null);
                                      if (confirm('Mark this quote as rejected?')) {
                                        handleStatusChange(quote.id, 'mark_rejected');
                                      }
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject Quote
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Follow-up Modal */}
      {showFollowUpModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Follow-up: {selectedQuote.customer_name}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowFollowUpModal(false);
                    setFollowUpNotes('');
                    setSelectedQuote(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Quote Number</p>
                  <p className="text-sm font-medium text-gray-900">{selectedQuote.quote_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Destination</p>
                  <p className="text-sm font-medium text-gray-900">{selectedQuote.destination}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedQuote.customer_email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  {selectedQuote.customer_phone ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{selectedQuote.customer_phone}</p>
                      <a
                        href={`https://wa.me/${selectedQuote.customer_phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded text-xs font-medium"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">N/A</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Value</p>
                  <p className="text-sm font-medium text-gray-900">€{Number(selectedQuote.total_price || 0).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Contact</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedQuote.days_since_last_contact} days ago
                  </p>
                </div>
              </div>

              {selectedQuote.follow_up_notes && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Notes:</label>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedQuote.follow_up_notes}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Add Follow-up Note:</label>
                <textarea
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
                  placeholder="E.g., Called customer, they're interested but need to confirm dates. Will follow up next week..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowFollowUpModal(false);
                  setFollowUpNotes('');
                  setSelectedQuote(null);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFollowUp}
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save Follow-up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
