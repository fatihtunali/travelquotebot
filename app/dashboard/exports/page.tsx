'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileSpreadsheet, Calendar, Filter } from 'lucide-react';

interface Booking {
  id: number;
  booking_number: string;
  customer_name: string;
  destination: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface ExportData {
  bookings: any[];
  payments: any[];
  suppliers: any[];
  summary: {
    totalRevenue: number;
    totalPaid: number;
    totalCosts: number;
    grossProfit: number;
    bookingsCount: number;
  };
}

export default function ExportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [exportType, setExportType] = useState<'bookings' | 'payments' | 'suppliers' | 'summary'>('bookings');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setOrgId(user.organizationId);
  }, []);

  const fetchExportData = async (): Promise<ExportData> => {
    const token = localStorage.getItem('token');

    // Fetch bookings with date filter
    const bookingsRes = await fetch(
      `/api/bookings/${orgId}?startDate=${dateRange.start}&endDate=${dateRange.end}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const bookings = await bookingsRes.json();

    // Fetch all payments and suppliers for these bookings
    const allPayments: any[] = [];
    const allSuppliers: any[] = [];

    for (const booking of bookings) {
      // Fetch individual booking details
      const detailRes = await fetch(
        `/api/bookings/${orgId}/${booking.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const detail = await detailRes.json();

      if (detail.payments) {
        allPayments.push(...detail.payments.map((p: any) => ({
          ...p,
          booking_number: booking.booking_number,
          customer_name: booking.customer_name
        })));
      }
      if (detail.suppliers) {
        allSuppliers.push(...detail.suppliers.map((s: any) => ({
          ...s,
          booking_number: booking.booking_number,
          customer_name: booking.customer_name
        })));
      }
    }

    // Calculate summary
    const totalRevenue = bookings.reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0);
    const totalPaid = allPayments.reduce((sum: number, p: any) => {
      if (p.payment_type === 'refund') return sum - Number(p.amount);
      return sum + Number(p.amount);
    }, 0);
    const totalCosts = allSuppliers.reduce((sum: number, s: any) => sum + Number(s.cost || 0), 0);

    return {
      bookings,
      payments: allPayments,
      suppliers: allSuppliers,
      summary: {
        totalRevenue,
        totalPaid,
        totalCosts,
        grossProfit: totalRevenue - totalCosts,
        bookingsCount: bookings.length
      }
    };
  };

  const convertToCSV = (data: any[], headers: string[]): string => {
    const headerRow = headers.join(',');
    const rows = data.map(item =>
      headers.map(header => {
        const value = item[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );
    return [headerRow, ...rows].join('\n');
  };

  const handleExport = async () => {
    if (!orgId) return;
    setLoading(true);

    try {
      const data = await fetchExportData();
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportType === 'bookings') {
        const exportData = data.bookings.map(b => ({
          booking_number: b.booking_number,
          customer_name: b.customer_name,
          customer_email: b.customer_email || '',
          destination: b.destination,
          start_date: b.start_date,
          end_date: b.end_date,
          total_amount: b.total_amount,
          status: b.status,
          created_at: b.created_at
        }));

        if (exportFormat === 'csv') {
          content = convertToCSV(exportData, [
            'booking_number', 'customer_name', 'customer_email', 'destination',
            'start_date', 'end_date', 'total_amount', 'status', 'created_at'
          ]);
          filename = `bookings-${dateRange.start}-to-${dateRange.end}.csv`;
          mimeType = 'text/csv';
        } else {
          content = JSON.stringify(exportData, null, 2);
          filename = `bookings-${dateRange.start}-to-${dateRange.end}.json`;
          mimeType = 'application/json';
        }
      } else if (exportType === 'payments') {
        const exportData = data.payments.map(p => ({
          booking_number: p.booking_number,
          customer_name: p.customer_name,
          payment_date: p.payment_date,
          payment_type: p.payment_type,
          amount: p.amount,
          payment_method: p.payment_method || '',
          reference_number: p.reference_number || ''
        }));

        if (exportFormat === 'csv') {
          content = convertToCSV(exportData, [
            'booking_number', 'customer_name', 'payment_date', 'payment_type',
            'amount', 'payment_method', 'reference_number'
          ]);
          filename = `payments-${dateRange.start}-to-${dateRange.end}.csv`;
          mimeType = 'text/csv';
        } else {
          content = JSON.stringify(exportData, null, 2);
          filename = `payments-${dateRange.start}-to-${dateRange.end}.json`;
          mimeType = 'application/json';
        }
      } else if (exportType === 'suppliers') {
        const exportData = data.suppliers.map(s => ({
          booking_number: s.booking_number,
          customer_name: s.customer_name,
          supplier_name: s.name,
          type: s.type,
          service_date: s.service_date,
          cost: s.cost,
          currency: s.currency,
          confirmation_number: s.confirmation_number || ''
        }));

        if (exportFormat === 'csv') {
          content = convertToCSV(exportData, [
            'booking_number', 'customer_name', 'supplier_name', 'type',
            'service_date', 'cost', 'currency', 'confirmation_number'
          ]);
          filename = `suppliers-${dateRange.start}-to-${dateRange.end}.csv`;
          mimeType = 'text/csv';
        } else {
          content = JSON.stringify(exportData, null, 2);
          filename = `suppliers-${dateRange.start}-to-${dateRange.end}.json`;
          mimeType = 'application/json';
        }
      } else {
        // Summary export
        const summaryData = {
          period: {
            start: dateRange.start,
            end: dateRange.end
          },
          ...data.summary,
          profitMargin: data.summary.totalRevenue > 0
            ? ((data.summary.grossProfit / data.summary.totalRevenue) * 100).toFixed(2) + '%'
            : '0%',
          outstandingBalance: data.summary.totalRevenue - data.summary.totalPaid
        };

        if (exportFormat === 'csv') {
          content = Object.entries(summaryData)
            .map(([key, value]) => {
              if (typeof value === 'object') {
                return Object.entries(value).map(([k, v]) => `${key}_${k},${v}`).join('\n');
              }
              return `${key},${value}`;
            })
            .join('\n');
          filename = `financial-summary-${dateRange.start}-to-${dateRange.end}.csv`;
          mimeType = 'text/csv';
        } else {
          content = JSON.stringify(summaryData, null, 2);
          filename = `financial-summary-${dateRange.start}-to-${dateRange.end}.json`;
          mimeType = 'application/json';
        }
      }

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
        <p className="text-gray-600 mt-1">Export financial data for accounting and reporting</p>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Export Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Export Type
            </label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="bookings">Bookings</option>
              <option value="payments">Payments</option>
              <option value="suppliers">Supplier Costs</option>
              <option value="summary">Financial Summary</option>
            </select>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileSpreadsheet className="w-4 h-4 inline mr-1" />
              Format
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  className="text-teal-600"
                />
                <span className="text-sm">CSV (Excel/Sheets)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                  className="text-teal-600"
                />
                <span className="text-sm">JSON</span>
              </label>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Types Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <h3 className="font-medium text-gray-900">Bookings</h3>
          <p className="text-sm text-gray-500 mt-1">
            Export all booking records with customer info, dates, and amounts
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <h3 className="font-medium text-gray-900">Payments</h3>
          <p className="text-sm text-gray-500 mt-1">
            Export payment transactions with methods and reference numbers
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <h3 className="font-medium text-gray-900">Supplier Costs</h3>
          <p className="text-sm text-gray-500 mt-1">
            Export supplier costs for expense tracking and reconciliation
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <h3 className="font-medium text-gray-900">Financial Summary</h3>
          <p className="text-sm text-gray-500 mt-1">
            Get revenue, costs, and profit summary for the period
          </p>
        </div>
      </div>

      {/* Quick Exports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Exports</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              setDateRange({
                start: firstDay.toISOString().split('T')[0],
                end: today.toISOString().split('T')[0]
              });
              setExportType('summary');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            This Month Summary
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
              const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
              setDateRange({
                start: firstDay.toISOString().split('T')[0],
                end: lastDay.toISOString().split('T')[0]
              });
              setExportType('summary');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            Last Month Summary
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), 0, 1);
              setDateRange({
                start: firstDay.toISOString().split('T')[0],
                end: today.toISOString().split('T')[0]
              });
              setExportType('bookings');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            YTD Bookings
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), 0, 1);
              setDateRange({
                start: firstDay.toISOString().split('T')[0],
                end: today.toISOString().split('T')[0]
              });
              setExportType('payments');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            YTD Payments
          </button>
        </div>
      </div>
    </div>
  );
}
