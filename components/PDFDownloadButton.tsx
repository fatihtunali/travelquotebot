'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ItineraryPDF from './ItineraryPDF';

interface PDFDownloadButtonProps {
  itinerary: any;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ itinerary }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold shadow-md cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Loading PDF...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ItineraryPDF itinerary={itinerary} />}
      fileName={`${itinerary.destination.replace(/\s+/g, '-')}-Itinerary.pdf`}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-colors shadow-md"
    >
      {({ loading }) => (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {loading ? 'Generating PDF...' : 'Download PDF'}
        </>
      )}
    </PDFDownloadLink>
  );
};

export default PDFDownloadButton;
