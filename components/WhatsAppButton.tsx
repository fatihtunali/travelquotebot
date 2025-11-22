'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  variant?: 'floating' | 'inline' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export default function WhatsAppButton({
  phoneNumber = '905551234567', // Default - should be updated with actual number
  message = 'Hello! I would like to know more about your travel services.',
  variant = 'inline',
  size = 'md',
  className = '',
  label = 'WhatsApp'
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={handleClick}
        className={`fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${className}`}
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleClick}
        className={`bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors ${className}`}
        title="Chat on WhatsApp"
      >
        <MessageCircle className={iconSizes[size]} />
      </button>
    );
  }

  // inline variant
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors ${sizeClasses[size]} ${className}`}
    >
      <MessageCircle className={iconSizes[size]} />
      {label}
    </button>
  );
}

// Share via WhatsApp component
interface WhatsAppShareProps {
  text: string;
  url?: string;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WhatsAppShare({
  text,
  url,
  variant = 'button',
  size = 'md',
  className = ''
}: WhatsAppShareProps) {
  const handleShare = () => {
    let shareText = text;
    if (url) {
      shareText += `\n\n${url}`;
    }
    const encodedText = encodeURIComponent(shareText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className={`bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors ${className}`}
        title="Share via WhatsApp"
      >
        <MessageCircle className={iconSizes[size]} />
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors ${sizeClasses[size]} ${className}`}
    >
      <MessageCircle className={iconSizes[size]} />
      Share via WhatsApp
    </button>
  );
}
