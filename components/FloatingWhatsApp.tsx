'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  defaultMessage?: string;
  companyName?: string;
  showOnDashboard?: boolean;
}

export default function FloatingWhatsApp({
  phoneNumber = '905551234567', // Update with actual number
  defaultMessage = 'Hello! I would like to know more about Travel Quote Bot.',
  companyName = 'Travel Quote Bot',
  showOnDashboard = false
}: FloatingWhatsAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide on dashboard pages unless explicitly shown
    if (!showOnDashboard && window.location.pathname.startsWith('/dashboard')) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [showOnDashboard]);

  const handleSend = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Chat popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-green-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{companyName}</h3>
                <p className="text-green-100 text-xs">Typically replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat area */}
          <div className="p-4 bg-gray-50">
            <div className="bg-white rounded-lg p-3 shadow-sm mb-3">
              <p className="text-sm text-gray-700">
                Hi there! How can we help you today?
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Just now</span>
            </div>
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-gray-100">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
            <button
              onClick={handleSend}
              className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Send via WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${isOpen ? 'rotate-90' : 'hover:scale-110'}`}
        title="Chat on WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
}
