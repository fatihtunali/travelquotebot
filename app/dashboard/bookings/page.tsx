'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  Search,
  Eye,
  DollarSign,
  Calendar,
  Users,
  Building2,
  LayoutGrid,
  List,
  CalendarDays,
  GripVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Booking {
  id: number;
  booking_number: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  agent_id: number | null;
  agent_name: string | null;
  client_name: string | null;
  destination: string;
  status: string;
  total_amount: number;
  total_paid: number;
  start_date: string;
  end_date: string;
  created_at: string;
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

// Pipeline columns for Kanban view
const pipelineColumns = [
  { id: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
  { id: 'deposit_received', label: 'Deposit Received', color: 'bg-yellow-500' },
  { id: 'fully_paid', label: 'Fully Paid', color: 'bg-green-500' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-purple-500' },
  { id: 'completed', label: 'Completed', color: 'bg-gray-500' }
];

type ViewMode = 'table' | 'pipeline' | 'calendar';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orgId, setOrgId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setOrgId(user.organizationId);
    fetchBookings(user.organizationId);
  }, [statusFilter, searchTerm]);

  const fetchBookings = async (organizationId: number) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/bookings/${organizationId}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data.bookings);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
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

  // Update booking status (for drag-and-drop)
  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${orgId}/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setBookings(bookings.map(b =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        ));
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedBooking && draggedBooking.status !== newStatus) {
      updateBookingStatus(draggedBooking.id, newStatus);
    }
    setDraggedBooking(null);
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => {
      const start = b.start_date?.split('T')[0];
      const end = b.end_date?.split('T')[0];
      return start === dateStr || end === dateStr || (start && end && dateStr > start && dateStr < end);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage confirmed bookings and payments</p>
        </div>
        {/* View Switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4" />
            Table
          </button>
          <button
            onClick={() => setViewMode('pipeline')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'pipeline'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Pipeline
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendar
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Awaiting Deposit</p>
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Fully Paid</p>
            <p className="text-2xl font-bold text-green-600">{stats.fully_paid}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.active_revenue || 0)}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="deposit_received">Deposit Received</option>
          <option value="fully_paid">Fully Paid</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
              <p className="text-gray-500 mt-1">Bookings will appear here when quotes are accepted.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Booking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{booking.booking_number}</div>
                          <div className="text-sm text-gray-500">{booking.destination}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{booking.customer_name}</div>
                          {booking.agent_name ? (
                            <div className="text-gray-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {booking.agent_name}
                            </div>
                          ) : booking.client_name ? (
                            <div className="text-gray-500">{booking.client_name}</div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(booking.start_date)}
                        </div>
                        <div className="text-xs text-gray-400">
                          to {formatDate(booking.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(booking.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${
                          Number(booking.total_paid) >= Number(booking.total_amount)
                            ? 'text-green-600'
                            : Number(booking.total_paid) > 0
                            ? 'text-yellow-600'
                            : 'text-gray-400'
                        }`}>
                          {formatCurrency(booking.total_paid || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/dashboard/bookings/${booking.id}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pipeline/Kanban View */}
      {viewMode === 'pipeline' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineColumns.map((column) => {
            const columnBookings = bookings.filter(b => b.status === column.id);
            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-72 bg-gray-50 rounded-xl"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                      <span className="font-medium text-gray-900">{column.label}</span>
                    </div>
                    <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
                      {columnBookings.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="p-2 space-y-2 min-h-[400px]">
                  {columnBookings.map((booking) => (
                    <div
                      key={booking.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, booking)}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1 text-gray-400">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <Link
                          href={`/dashboard/bookings/${booking.id}`}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                      <div className="font-medium text-gray-900 text-sm">{booking.booking_number}</div>
                      <div className="text-sm text-gray-600 mt-1">{booking.customer_name}</div>
                      <div className="text-xs text-gray-500 mt-1">{booking.destination}</div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          {formatDate(booking.start_date)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.total_amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {columnBookings.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCalendarDate(new Date())}
                className="px-3 py-1 text-sm hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-600">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {Array.from({ length: 42 }).map((_, index) => {
              const dayNumber = index - getFirstDayOfMonth(calendarDate) + 1;
              const isCurrentMonth = dayNumber > 0 && dayNumber <= getDaysInMonth(calendarDate);
              const currentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), dayNumber);
              const dayBookings = isCurrentMonth ? getBookingsForDate(currentDate) : [];
              const isToday = isCurrentMonth &&
                currentDate.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`bg-white min-h-[100px] p-1 ${
                    !isCurrentMonth ? 'bg-gray-50' : ''
                  }`}
                >
                  {isCurrentMonth && (
                    <>
                      <div className={`text-sm p-1 ${
                        isToday
                          ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                          : 'text-gray-900'
                      }`}>
                        {dayNumber}
                      </div>
                      <div className="space-y-1 mt-1">
                        {dayBookings.slice(0, 3).map((booking) => (
                          <Link
                            key={booking.id}
                            href={`/dashboard/bookings/${booking.id}`}
                            className={`block text-xs p-1 rounded truncate ${statusColors[booking.status]}`}
                          >
                            {booking.customer_name}
                          </Link>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-xs text-gray-500 pl-1">
                            +{dayBookings.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
