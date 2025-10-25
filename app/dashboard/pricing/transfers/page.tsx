'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

interface Transfer {
  id: number;
  vehicle_type: string;
  max_capacity: number;
  from_city: string;
  to_city: string;
  season_name: string;
  start_date: string;
  end_date: string;
  price_oneway: number;
  price_roundtrip: number;
  estimated_duration_hours: number;
  notes?: string;
}

interface Flight {
  id: number;
  from_airport: string;
  to_airport: string;
  from_city: string;
  to_city: string;
  season_name: string;
  start_date: string;
  end_date: string;
  price_oneway: number;
  price_roundtrip: number;
  airline?: string;
  notes?: string;
}

type TabType = 'airport' | 'intercity' | 'flights';

export default function TransfersPricing() {
  const router = useRouter();
  const airportFileInputRef = useRef<HTMLInputElement>(null);
  const intercityFileInputRef = useRef<HTMLInputElement>(null);
  const flightsFileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('airport');
  const [loading, setLoading] = useState(true);

  // Airport Transfers State
  const [airportTransfers, setAirportTransfers] = useState<Transfer[]>([]);
  const [selectedAirportVehicle, setSelectedAirportVehicle] = useState('All');
  const [selectedAirportRoute, setSelectedAirportRoute] = useState('All');

  // Intercity Transfers State
  const [intercityTransfers, setIntercityTransfers] = useState<Transfer[]>([]);
  const [selectedIntercityVehicle, setSelectedIntercityVehicle] = useState('All');
  const [selectedIntercityRoute, setSelectedIntercityRoute] = useState('All');

  // Flights State
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlightRoute, setSelectedFlightRoute] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [modalType, setModalType] = useState<TabType>('airport');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Transfer Form Data
  const [transferFormData, setTransferFormData] = useState({
    vehicle_type: '',
    max_capacity: 0,
    from_city: '',
    to_city: '',
    season_name: '',
    start_date: '',
    end_date: '',
    price_oneway: 0,
    price_roundtrip: 0,
    estimated_duration_hours: 0,
    notes: ''
  });

  // Flight Form Data
  const [flightFormData, setFlightFormData] = useState({
    from_airport: '',
    to_airport: '',
    from_city: '',
    to_city: '',
    season_name: '',
    start_date: '',
    end_date: '',
    price_oneway: 0,
    price_roundtrip: 0,
    airline: '',
    notes: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTransfers(),
      fetchFlights()
    ]);
    setLoading(false);
  };

  const fetchTransfers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pricing/intercity-transfers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();

        // Split into airport and intercity transfers
        const airport = data.filter((t: Transfer) =>
          t.from_city?.toLowerCase().includes('airport') ||
          t.to_city?.toLowerCase().includes('airport')
        );
        const intercity = data.filter((t: Transfer) =>
          !t.from_city?.toLowerCase().includes('airport') &&
          !t.to_city?.toLowerCase().includes('airport')
        );

        setAirportTransfers(airport);
        setIntercityTransfers(intercity);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  const fetchFlights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pricing/flights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFlights(data);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  };

  // Helper function to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return '';

    let date: Date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      if (dateInput.includes('T')) {
        date = new Date(dateInput);
      } else {
        date = new Date(dateInput + 'T00:00:00');
      }
    } else {
      return '';
    }

    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Modal handlers for Transfers
  const openAddTransferModal = (type: 'airport' | 'intercity') => {
    setModalMode('add');
    setModalType(type);
    setSelectedItem(null);
    setTransferFormData({
      vehicle_type: '',
      max_capacity: 0,
      from_city: '',
      to_city: '',
      season_name: '',
      start_date: '',
      end_date: '',
      price_oneway: 0,
      price_roundtrip: 0,
      estimated_duration_hours: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const openEditTransferModal = (transfer: Transfer, type: 'airport' | 'intercity') => {
    setModalMode('edit');
    setModalType(type);
    setSelectedItem(transfer);
    setTransferFormData({
      vehicle_type: transfer.vehicle_type,
      max_capacity: transfer.max_capacity,
      from_city: transfer.from_city,
      to_city: transfer.to_city,
      season_name: transfer.season_name,
      start_date: formatDateForInput(transfer.start_date),
      end_date: formatDateForInput(transfer.end_date),
      price_oneway: transfer.price_oneway,
      price_roundtrip: transfer.price_roundtrip,
      estimated_duration_hours: transfer.estimated_duration_hours,
      notes: transfer.notes || ''
    });
    setShowModal(true);
  };

  const openDuplicateTransferModal = (transfer: Transfer, type: 'airport' | 'intercity') => {
    setModalMode('duplicate');
    setModalType(type);
    setSelectedItem(null);
    setTransferFormData({
      vehicle_type: transfer.vehicle_type,
      max_capacity: transfer.max_capacity,
      from_city: transfer.from_city,
      to_city: transfer.to_city,
      season_name: transfer.season_name + ' (Copy)',
      start_date: formatDateForInput(transfer.start_date),
      end_date: formatDateForInput(transfer.end_date),
      price_oneway: transfer.price_oneway,
      price_roundtrip: transfer.price_roundtrip,
      estimated_duration_hours: transfer.estimated_duration_hours,
      notes: transfer.notes || ''
    });
    setShowModal(true);
  };

  // Modal handlers for Flights
  const openAddFlightModal = () => {
    setModalMode('add');
    setModalType('flights');
    setSelectedItem(null);
    setFlightFormData({
      from_airport: '',
      to_airport: '',
      from_city: '',
      to_city: '',
      season_name: '',
      start_date: '',
      end_date: '',
      price_oneway: 0,
      price_roundtrip: 0,
      airline: '',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditFlightModal = (flight: Flight) => {
    setModalMode('edit');
    setModalType('flights');
    setSelectedItem(flight);
    setFlightFormData({
      from_airport: flight.from_airport,
      to_airport: flight.to_airport,
      from_city: flight.from_city,
      to_city: flight.to_city,
      season_name: flight.season_name,
      start_date: formatDateForInput(flight.start_date),
      end_date: formatDateForInput(flight.end_date),
      price_oneway: flight.price_oneway,
      price_roundtrip: flight.price_roundtrip,
      airline: flight.airline || '',
      notes: flight.notes || ''
    });
    setShowModal(true);
  };

  const openDuplicateFlightModal = (flight: Flight) => {
    setModalMode('duplicate');
    setModalType('flights');
    setSelectedItem(null);
    setFlightFormData({
      from_airport: flight.from_airport,
      to_airport: flight.to_airport,
      from_city: flight.from_city,
      to_city: flight.to_city,
      season_name: flight.season_name + ' (Copy)',
      start_date: formatDateForInput(flight.start_date),
      end_date: formatDateForInput(flight.end_date),
      price_oneway: flight.price_oneway,
      price_roundtrip: flight.price_roundtrip,
      airline: flight.airline || '',
      notes: flight.notes || ''
    });
    setShowModal(true);
  };

  // Submit handlers
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedItem) {
        const response = await fetch('/api/pricing/intercity-transfers', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedItem.id,
            ...transferFormData
          })
        });

        if (response.ok) {
          alert('Transfer updated successfully!');
          setShowModal(false);
          fetchTransfers();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update transfer'}`);
        }
      } else {
        const response = await fetch('/api/pricing/intercity-transfers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(transferFormData)
        });

        if (response.ok) {
          alert('Transfer created successfully!');
          setShowModal(false);
          fetchTransfers();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create transfer'}`);
        }
      }
    } catch (error) {
      console.error('Error saving transfer:', error);
      alert('An error occurred while saving the transfer');
    }
  };

  const handleFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (modalMode === 'edit' && selectedItem) {
        const response = await fetch('/api/pricing/flights', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: selectedItem.id,
            ...flightFormData
          })
        });

        if (response.ok) {
          alert('Flight updated successfully!');
          setShowModal(false);
          fetchFlights();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to update flight'}`);
        }
      } else {
        const response = await fetch('/api/pricing/flights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(flightFormData)
        });

        if (response.ok) {
          alert('Flight created successfully!');
          setShowModal(false);
          fetchFlights();
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || 'Failed to create flight'}`);
        }
      }
    } catch (error) {
      console.error('Error saving flight:', error);
      alert('An error occurred while saving the flight');
    }
  };

  // Delete handlers
  const handleDeleteTransfer = async (transfer: Transfer) => {
    if (!confirm(`Are you sure you want to archive this transfer from ${transfer.from_city} to ${transfer.to_city}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/intercity-transfers?id=${transfer.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Transfer archived successfully!');
        fetchTransfers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to archive transfer'}`);
      }
    } catch (error) {
      console.error('Error deleting transfer:', error);
      alert('An error occurred while archiving the transfer');
    }
  };

  const handleDeleteFlight = async (flight: Flight) => {
    if (!confirm(`Are you sure you want to archive this flight from ${flight.from_airport} to ${flight.to_airport}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pricing/flights?id=${flight.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Flight archived successfully!');
        fetchFlights();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to archive flight'}`);
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert('An error occurred while archiving the flight');
    }
  };

  // Excel Export/Import - Airport Transfers
  const handleExportAirportExcel = () => {
    try {
      const parseExcelDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : date;
      };

      const exportData = airportTransfers.map(t => ({
        'Vehicle Type': t.vehicle_type,
        'Max Capacity': t.max_capacity,
        'From': t.from_city,
        'To': t.to_city,
        'Season Name': t.season_name || '',
        'Start Date': parseExcelDate(t.start_date),
        'End Date': parseExcelDate(t.end_date),
        'One Way Price': t.price_oneway || 0,
        'Round Trip Price': t.price_roundtrip || 0,
        'Duration (hours)': t.estimated_duration_hours || 0,
        'Notes': t.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Airport Transfers');

      worksheet['!cols'] = [
        { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 30 }
      ];

      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let row = 1; row <= range.e.r; row++) {
        const startDateCell = `F${row + 1}`;
        if (worksheet[startDateCell] && worksheet[startDateCell].v) {
          worksheet[startDateCell].t = 'd';
          worksheet[startDateCell].z = 'dd/mm/yyyy';
        }
        const endDateCell = `G${row + 1}`;
        if (worksheet[endDateCell] && worksheet[endDateCell].v) {
          worksheet[endDateCell].t = 'd';
          worksheet[endDateCell].z = 'dd/mm/yyyy';
        }
      }

      const fileName = `airport-transfers-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      alert(`Excel file exported successfully as ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  const handleImportAirportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmed = confirm(
      `WARNING: This will DELETE ALL existing airport transfer data and replace it with the data from the Excel file.\n\n` +
      `Current records: ${airportTransfers.length}\n\n` +
      'Are you sure you want to continue?'
    );

    if (!confirmed) {
      if (airportFileInputRef.current) {
        airportFileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          alert('Excel file is empty!');
          return;
        }

        const token = localStorage.getItem('token');

        // Delete all existing airport transfers
        console.log('Clearing existing airport transfers...');
        let deleteCount = 0;
        for (const transfer of airportTransfers) {
          try {
            const response = await fetch(`/api/pricing/intercity-transfers?id=${transfer.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) deleteCount++;
          } catch (error) {
            console.error('Error deleting transfer:', error);
          }
        }
        console.log(`Deleted ${deleteCount} existing records`);

        // Import new data
        console.log('Importing new data from Excel...');
        let successCount = 0;
        let errorCount = 0;

        const parseDate = (dateValue: any) => {
          if (!dateValue) return '';
          if (typeof dateValue === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
          if (dateValue instanceof Date) {
            const year = dateValue.getFullYear();
            const month = String(dateValue.getMonth() + 1).padStart(2, '0');
            const day = String(dateValue.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
          const dateStr = String(dateValue);
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }
          return '';
        };

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          try {
            const transferData = {
              vehicle_type: String(row['Vehicle Type']).trim(),
              max_capacity: parseInt(row['Max Capacity']) || 0,
              from_city: String(row['From']).trim(),
              to_city: String(row['To']).trim(),
              season_name: String(row['Season Name'] || '').trim(),
              start_date: parseDate(row['Start Date']),
              end_date: parseDate(row['End Date']),
              price_oneway: parseFloat(row['One Way Price']) || 0,
              price_roundtrip: parseFloat(row['Round Trip Price']) || 0,
              estimated_duration_hours: parseFloat(row['Duration (hours)']) || 0,
              notes: String(row['Notes'] || '').trim()
            };

            const response = await fetch('/api/pricing/intercity-transfers', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(transferData)
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
            console.error(`Error importing row ${i + 2}:`, error, row);
          }
        }

        if (airportFileInputRef.current) {
          airportFileInputRef.current.value = '';
        }

        alert(
          `Import Complete!\n\n` +
          `Deleted: ${deleteCount} old records\n` +
          `Imported: ${successCount} new records\n` +
          `Errors: ${errorCount}`
        );
        fetchTransfers();
      } catch (error) {
        console.error('Import error:', error);
        alert('Error reading Excel file. Please check the format.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Excel Export/Import - Intercity Transfers
  const handleExportIntercityExcel = () => {
    try {
      const parseExcelDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : date;
      };

      const exportData = intercityTransfers.map(t => ({
        'Vehicle Type': t.vehicle_type,
        'Max Capacity': t.max_capacity,
        'From': t.from_city,
        'To': t.to_city,
        'Season Name': t.season_name || '',
        'Start Date': parseExcelDate(t.start_date),
        'End Date': parseExcelDate(t.end_date),
        'One Way Price': t.price_oneway || 0,
        'Round Trip Price': t.price_roundtrip || 0,
        'Duration (hours)': t.estimated_duration_hours || 0,
        'Notes': t.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Intercity Transfers');

      worksheet['!cols'] = [
        { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 30 }
      ];

      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let row = 1; row <= range.e.r; row++) {
        const startDateCell = `F${row + 1}`;
        if (worksheet[startDateCell] && worksheet[startDateCell].v) {
          worksheet[startDateCell].t = 'd';
          worksheet[startDateCell].z = 'dd/mm/yyyy';
        }
        const endDateCell = `G${row + 1}`;
        if (worksheet[endDateCell] && worksheet[endDateCell].v) {
          worksheet[endDateCell].t = 'd';
          worksheet[endDateCell].z = 'dd/mm/yyyy';
        }
      }

      const fileName = `intercity-transfers-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      alert(`Excel file exported successfully as ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  const handleImportIntercityExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmed = confirm(
      `WARNING: This will DELETE ALL existing intercity transfer data and replace it with the data from the Excel file.\n\n` +
      `Current records: ${intercityTransfers.length}\n\n` +
      'Are you sure you want to continue?'
    );

    if (!confirmed) {
      if (intercityFileInputRef.current) {
        intercityFileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          alert('Excel file is empty!');
          return;
        }

        const token = localStorage.getItem('token');

        // Delete all existing intercity transfers
        console.log('Clearing existing intercity transfers...');
        let deleteCount = 0;
        for (const transfer of intercityTransfers) {
          try {
            const response = await fetch(`/api/pricing/intercity-transfers?id=${transfer.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) deleteCount++;
          } catch (error) {
            console.error('Error deleting transfer:', error);
          }
        }
        console.log(`Deleted ${deleteCount} existing records`);

        // Import new data
        console.log('Importing new data from Excel...');
        let successCount = 0;
        let errorCount = 0;

        const parseDate = (dateValue: any) => {
          if (!dateValue) return '';
          if (typeof dateValue === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
          if (dateValue instanceof Date) {
            const year = dateValue.getFullYear();
            const month = String(dateValue.getMonth() + 1).padStart(2, '0');
            const day = String(dateValue.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
          const dateStr = String(dateValue);
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }
          return '';
        };

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          try {
            const transferData = {
              vehicle_type: String(row['Vehicle Type']).trim(),
              max_capacity: parseInt(row['Max Capacity']) || 0,
              from_city: String(row['From']).trim(),
              to_city: String(row['To']).trim(),
              season_name: String(row['Season Name'] || '').trim(),
              start_date: parseDate(row['Start Date']),
              end_date: parseDate(row['End Date']),
              price_oneway: parseFloat(row['One Way Price']) || 0,
              price_roundtrip: parseFloat(row['Round Trip Price']) || 0,
              estimated_duration_hours: parseFloat(row['Duration (hours)']) || 0,
              notes: String(row['Notes'] || '').trim()
            };

            const response = await fetch('/api/pricing/intercity-transfers', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(transferData)
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
            console.error(`Error importing row ${i + 2}:`, error, row);
          }
        }

        if (intercityFileInputRef.current) {
          intercityFileInputRef.current.value = '';
        }

        alert(
          `Import Complete!\n\n` +
          `Deleted: ${deleteCount} old records\n` +
          `Imported: ${successCount} new records\n` +
          `Errors: ${errorCount}`
        );
        fetchTransfers();
      } catch (error) {
        console.error('Import error:', error);
        alert('Error reading Excel file. Please check the format.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Excel Export/Import - Flights
  const handleExportFlightsExcel = () => {
    try {
      const parseExcelDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : date;
      };

      const exportData = flights.map(f => ({
        'From Airport': f.from_airport,
        'To Airport': f.to_airport,
        'From City': f.from_city,
        'To City': f.to_city,
        'Season Name': f.season_name || '',
        'Start Date': parseExcelDate(f.start_date),
        'End Date': parseExcelDate(f.end_date),
        'One Way Price': f.price_oneway || 0,
        'Round Trip Price': f.price_roundtrip || 0,
        'Airline': f.airline || '',
        'Notes': f.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Flights');

      worksheet['!cols'] = [
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 30 }
      ];

      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let row = 1; row <= range.e.r; row++) {
        const startDateCell = `F${row + 1}`;
        if (worksheet[startDateCell] && worksheet[startDateCell].v) {
          worksheet[startDateCell].t = 'd';
          worksheet[startDateCell].z = 'dd/mm/yyyy';
        }
        const endDateCell = `G${row + 1}`;
        if (worksheet[endDateCell] && worksheet[endDateCell].v) {
          worksheet[endDateCell].t = 'd';
          worksheet[endDateCell].z = 'dd/mm/yyyy';
        }
      }

      const fileName = `flights-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      alert(`Excel file exported successfully as ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  const handleImportFlightsExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmed = confirm(
      `WARNING: This will DELETE ALL existing flight data and replace it with the data from the Excel file.\n\n` +
      `Current records: ${flights.length}\n\n` +
      'Are you sure you want to continue?'
    );

    if (!confirmed) {
      if (flightsFileInputRef.current) {
        flightsFileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          alert('Excel file is empty!');
          return;
        }

        const token = localStorage.getItem('token');

        // Delete all existing flights
        console.log('Clearing existing flights...');
        let deleteCount = 0;
        for (const flight of flights) {
          try {
            const response = await fetch(`/api/pricing/flights?id=${flight.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) deleteCount++;
          } catch (error) {
            console.error('Error deleting flight:', error);
          }
        }
        console.log(`Deleted ${deleteCount} existing records`);

        // Import new data
        console.log('Importing new data from Excel...');
        let successCount = 0;
        let errorCount = 0;

        const parseDate = (dateValue: any) => {
          if (!dateValue) return '';
          if (typeof dateValue === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
          if (dateValue instanceof Date) {
            const year = dateValue.getFullYear();
            const month = String(dateValue.getMonth() + 1).padStart(2, '0');
            const day = String(dateValue.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
          const dateStr = String(dateValue);
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }
          return '';
        };

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          try {
            const flightData = {
              from_airport: String(row['From Airport']).trim(),
              to_airport: String(row['To Airport']).trim(),
              from_city: String(row['From City']).trim(),
              to_city: String(row['To City']).trim(),
              season_name: String(row['Season Name'] || '').trim(),
              start_date: parseDate(row['Start Date']),
              end_date: parseDate(row['End Date']),
              price_oneway: parseFloat(row['One Way Price']) || 0,
              price_roundtrip: parseFloat(row['Round Trip Price']) || 0,
              airline: String(row['Airline'] || '').trim(),
              notes: String(row['Notes'] || '').trim()
            };

            const response = await fetch('/api/pricing/flights', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(flightData)
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
            console.error(`Error importing row ${i + 2}:`, error, row);
          }
        }

        if (flightsFileInputRef.current) {
          flightsFileInputRef.current.value = '';
        }

        alert(
          `Import Complete!\n\n` +
          `Deleted: ${deleteCount} old records\n` +
          `Imported: ${successCount} new records\n` +
          `Errors: ${errorCount}`
        );
        fetchFlights();
      } catch (error) {
        console.error('Import error:', error);
        alert('Error reading Excel file. Please check the format.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Filter data
  const uniqueAirportVehicles = ['All', ...Array.from(new Set(airportTransfers.map(t => t.vehicle_type))).sort()];
  const uniqueAirportRoutes = ['All', ...Array.from(new Set(airportTransfers.map(t => `${t.from_city} → ${t.to_city}`))).sort()];

  const uniqueIntercityVehicles = ['All', ...Array.from(new Set(intercityTransfers.map(t => t.vehicle_type))).sort()];
  const uniqueIntercityRoutes = ['All', ...Array.from(new Set(intercityTransfers.map(t => `${t.from_city} → ${t.to_city}`))).sort()];

  const uniqueFlightRoutes = ['All', ...Array.from(new Set(flights.map(f => `${f.from_airport} → ${f.to_airport}`))).sort()];

  const filteredAirportTransfers = airportTransfers.filter(t => {
    const vehicleMatch = selectedAirportVehicle === 'All' || t.vehicle_type === selectedAirportVehicle;
    const routeMatch = selectedAirportRoute === 'All' || `${t.from_city} → ${t.to_city}` === selectedAirportRoute;
    return vehicleMatch && routeMatch;
  });

  const filteredIntercityTransfers = intercityTransfers.filter(t => {
    const vehicleMatch = selectedIntercityVehicle === 'All' || t.vehicle_type === selectedIntercityVehicle;
    const routeMatch = selectedIntercityRoute === 'All' || `${t.from_city} → ${t.to_city}` === selectedIntercityRoute;
    return vehicleMatch && routeMatch;
  });

  const filteredFlights = flights.filter(f => {
    const routeMatch = selectedFlightRoute === 'All' || `${f.from_airport} → ${f.to_airport}` === selectedFlightRoute;
    return routeMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transfers and flights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <button
                type="button"
                onClick={() => router.push('/dashboard/pricing')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2"
              >
                ← Back to Pricing
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Transfers & Flights Pricing</h1>
              <p className="text-sm text-gray-600">Manage airport transfers, intercity transfers, and flight pricing</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              type="button"
              onClick={() => setActiveTab('airport')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'airport'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Airport Transfers ({airportTransfers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('intercity')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'intercity'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Intercity Transfers ({intercityTransfers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flights')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'flights'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Flights ({flights.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-6">
        {/* Airport Transfers Tab */}
        {activeTab === 'airport' && (
          <div>
            {/* Actions and Filters */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={selectedAirportVehicle}
                    onChange={(e) => setSelectedAirportVehicle(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  >
                    {uniqueAirportVehicles.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Route</label>
                  <select
                    value={selectedAirportRoute}
                    onChange={(e) => setSelectedAirportRoute(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  >
                    {uniqueAirportRoutes.map((route) => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  ref={airportFileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportAirportExcel}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => airportFileInputRef.current?.click()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                >
                  Import Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportAirportExcel}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={() => openAddTransferModal('airport')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
                >
                  + Add Airport Transfer
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Total Airport Transfers</p>
                <p className="text-2xl font-bold text-gray-900">{airportTransfers.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Vehicle Types</p>
                <p className="text-2xl font-bold text-indigo-600">{uniqueAirportVehicles.length - 1}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Routes</p>
                <p className="text-2xl font-bold text-blue-600">{uniqueAirportRoutes.length - 1}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Showing</p>
                <p className="text-2xl font-bold text-green-600">{filteredAirportTransfers.length}</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Vehicle Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Season / Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">One Way</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Round Trip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAirportTransfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{transfer.vehicle_type}</div>
                        <div className="text-xs text-gray-500">Max {transfer.max_capacity} pax</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transfer.from_city}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transfer.to_city}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{transfer.season_name}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(transfer.start_date)} - {formatDate(transfer.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-indigo-600">EUR {transfer.price_oneway}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-green-600">EUR {transfer.price_roundtrip}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transfer.estimated_duration_hours}h</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditTransferModal(transfer, 'airport')}
                            className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDuplicateTransferModal(transfer, 'airport')}
                            className="text-green-600 hover:text-green-900 font-medium text-xs"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTransfer(transfer)}
                            className="text-red-600 hover:text-red-900 font-medium text-xs"
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Intercity Transfers Tab */}
        {activeTab === 'intercity' && (
          <div>
            {/* Actions and Filters */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={selectedIntercityVehicle}
                    onChange={(e) => setSelectedIntercityVehicle(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  >
                    {uniqueIntercityVehicles.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Route</label>
                  <select
                    value={selectedIntercityRoute}
                    onChange={(e) => setSelectedIntercityRoute(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  >
                    {uniqueIntercityRoutes.map((route) => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  ref={intercityFileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportIntercityExcel}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => intercityFileInputRef.current?.click()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                >
                  Import Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportIntercityExcel}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={() => openAddTransferModal('intercity')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
                >
                  + Add Intercity Transfer
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Total Intercity Transfers</p>
                <p className="text-2xl font-bold text-gray-900">{intercityTransfers.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Vehicle Types</p>
                <p className="text-2xl font-bold text-indigo-600">{uniqueIntercityVehicles.length - 1}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Routes</p>
                <p className="text-2xl font-bold text-blue-600">{uniqueIntercityRoutes.length - 1}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Showing</p>
                <p className="text-2xl font-bold text-green-600">{filteredIntercityTransfers.length}</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Vehicle Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Season / Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">One Way</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Round Trip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIntercityTransfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{transfer.vehicle_type}</div>
                        <div className="text-xs text-gray-500">Max {transfer.max_capacity} pax</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transfer.from_city} → {transfer.to_city}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{transfer.season_name}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(transfer.start_date)} - {formatDate(transfer.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-indigo-600">EUR {transfer.price_oneway}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-green-600">EUR {transfer.price_roundtrip}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transfer.estimated_duration_hours}h</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditTransferModal(transfer, 'intercity')}
                            className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDuplicateTransferModal(transfer, 'intercity')}
                            className="text-green-600 hover:text-green-900 font-medium text-xs"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTransfer(transfer)}
                            className="text-red-600 hover:text-red-900 font-medium text-xs"
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Flights Tab */}
        {activeTab === 'flights' && (
          <div>
            {/* Actions and Filters */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Route</label>
                  <select
                    value={selectedFlightRoute}
                    onChange={(e) => setSelectedFlightRoute(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black"
                  >
                    {uniqueFlightRoutes.map((route) => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  ref={flightsFileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportFlightsExcel}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => flightsFileInputRef.current?.click()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                >
                  Import Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportFlightsExcel}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={openAddFlightModal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
                >
                  + Add Flight
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Total Flights</p>
                <p className="text-2xl font-bold text-gray-900">{flights.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Routes</p>
                <p className="text-2xl font-bold text-blue-600">{uniqueFlightRoutes.length - 1}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600">Showing</p>
                <p className="text-2xl font-bold text-green-600">{filteredFlights.length}</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Route (Airports)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Cities</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Season / Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">One Way</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Round Trip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Airline</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFlights.map((flight) => (
                    <tr key={flight.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          {flight.from_airport} → {flight.to_airport}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {flight.from_city} → {flight.to_city}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{flight.season_name}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(flight.start_date)} - {formatDate(flight.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-indigo-600">EUR {flight.price_oneway}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-green-600">EUR {flight.price_roundtrip}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{flight.airline || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditFlightModal(flight)}
                            className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDuplicateFlightModal(flight)}
                            className="text-green-600 hover:text-green-900 font-medium text-xs"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFlight(flight)}
                            className="text-red-600 hover:text-red-900 font-medium text-xs"
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-indigo-900 mb-2">Transfer & Flight Pricing Guide:</h4>
          <ul className="text-xs text-indigo-800 space-y-1">
            <li><strong>Airport Transfers:</strong> Point-to-point service between airports and cities. Includes city names with "Airport" keyword.</li>
            <li><strong>Intercity Transfers:</strong> Long-distance transfers between cities (excluding airport routes).</li>
            <li><strong>Flights:</strong> Domestic and international flight pricing with airport codes (IST, AYT, SAW, etc.).</li>
            <li><strong>Vehicle Types:</strong> Vito (4 pax), Sprinter (10 pax), Isuzu (18 pax), Coach (46 pax).</li>
            <li><strong>Pricing:</strong> All prices are per vehicle/flight, not per person. Round trip usually discounted vs 2x one-way.</li>
            <li><strong>Excel Import:</strong> Will DELETE all existing data in the selected tab and replace with Excel data.</li>
          </ul>
        </div>
      </main>

      {/* Modal - Transfer */}
      {showModal && (modalType === 'airport' || modalType === 'intercity') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Transfer' : modalMode === 'duplicate' ? 'Duplicate Transfer' : `Add New ${modalType === 'airport' ? 'Airport' : 'Intercity'} Transfer`}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6">
              {/* Vehicle Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                    <input
                      type="text"
                      required
                      value={transferFormData.vehicle_type}
                      onChange={(e) => setTransferFormData({ ...transferFormData, vehicle_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Vito, Sprinter"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity *</label>
                    <input
                      type="number"
                      required
                      value={transferFormData.max_capacity}
                      onChange={(e) => setTransferFormData({ ...transferFormData, max_capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., 4, 10, 18"
                    />
                  </div>
                </div>
              </div>

              {/* Route Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From City *</label>
                    <input
                      type="text"
                      required
                      value={transferFormData.from_city}
                      onChange={(e) => setTransferFormData({ ...transferFormData, from_city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Antalya Airport, Istanbul"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To City *</label>
                    <input
                      type="text"
                      required
                      value={transferFormData.to_city}
                      onChange={(e) => setTransferFormData({ ...transferFormData, to_city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Antalya, Pamukkale"
                    />
                  </div>
                </div>
              </div>

              {/* Season Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Season & Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Season Name</label>
                    <input
                      type="text"
                      value={transferFormData.season_name}
                      onChange={(e) => setTransferFormData({ ...transferFormData, season_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Winter 2025-26"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={transferFormData.estimated_duration_hours}
                      onChange={(e) => setTransferFormData({ ...transferFormData, estimated_duration_hours: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={transferFormData.start_date}
                      onChange={(e) => setTransferFormData({ ...transferFormData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={transferFormData.end_date}
                      onChange={(e) => setTransferFormData({ ...transferFormData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">One Way Price (EUR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transferFormData.price_oneway}
                      onChange={(e) => setTransferFormData({ ...transferFormData, price_oneway: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Round Trip Price (EUR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transferFormData.price_roundtrip}
                      onChange={(e) => setTransferFormData({ ...transferFormData, price_roundtrip: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={transferFormData.notes}
                  onChange={(e) => setTransferFormData({ ...transferFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {modalMode === 'edit' ? 'Update Transfer' : 'Create Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Flight */}
      {showModal && modalType === 'flights' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Flight' : modalMode === 'duplicate' ? 'Duplicate Flight' : 'Add New Flight'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFlightSubmit} className="p-6">
              {/* Airport Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Flight Route</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Airport *</label>
                    <input
                      type="text"
                      required
                      value={flightFormData.from_airport}
                      onChange={(e) => setFlightFormData({ ...flightFormData, from_airport: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., IST, AYT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Airport *</label>
                    <input
                      type="text"
                      required
                      value={flightFormData.to_airport}
                      onChange={(e) => setFlightFormData({ ...flightFormData, to_airport: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., IST, AYT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From City *</label>
                    <input
                      type="text"
                      required
                      value={flightFormData.from_city}
                      onChange={(e) => setFlightFormData({ ...flightFormData, from_city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Istanbul, Antalya"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To City *</label>
                    <input
                      type="text"
                      required
                      value={flightFormData.to_city}
                      onChange={(e) => setFlightFormData({ ...flightFormData, to_city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Istanbul, Antalya"
                    />
                  </div>
                </div>
              </div>

              {/* Season Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Season & Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Season Name</label>
                    <input
                      type="text"
                      value={flightFormData.season_name}
                      onChange={(e) => setFlightFormData({ ...flightFormData, season_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Winter 2025-26"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
                    <input
                      type="text"
                      value={flightFormData.airline}
                      onChange={(e) => setFlightFormData({ ...flightFormData, airline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      placeholder="e.g., Turkish Airlines, Pegasus"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={flightFormData.start_date}
                      onChange={(e) => setFlightFormData({ ...flightFormData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={flightFormData.end_date}
                      onChange={(e) => setFlightFormData({ ...flightFormData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">One Way Price (EUR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={flightFormData.price_oneway}
                      onChange={(e) => setFlightFormData({ ...flightFormData, price_oneway: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Round Trip Price (EUR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={flightFormData.price_roundtrip}
                      onChange={(e) => setFlightFormData({ ...flightFormData, price_roundtrip: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={flightFormData.notes}
                  onChange={(e) => setFlightFormData({ ...flightFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {modalMode === 'edit' ? 'Update Flight' : 'Create Flight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
