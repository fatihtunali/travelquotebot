interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'gradient';
}

export default function Logo({ size = 'md', showText = true, variant = 'light' }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', spacing: 'gap-1.5' },
    md: { icon: 'w-8 h-8', text: 'text-xl', spacing: 'gap-2' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', spacing: 'gap-3' },
    xl: { icon: 'w-16 h-16', text: 'text-4xl', spacing: 'gap-4' }
  };

  const textColors = {
    light: 'text-white',
    gradient: 'bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'
  };

  const { icon, text, spacing } = sizeClasses[size];

  return (
    <div className={`flex items-center ${spacing}`}>
      {/* Logo Icon */}
      <div className="relative">
        <svg
          className={icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="botGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>

          {/* Bot Head Shape */}
          <rect x="20" y="30" width="60" height="50" rx="12" fill="url(#botGradient)" />

          {/* Antenna */}
          <line x1="50" y1="30" x2="50" y2="15" stroke="url(#botGradient)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="12" r="6" fill="#F59E0B" />
          <circle cx="50" cy="12" r="3" fill="#FEF3C7" opacity="0.8" />

          {/* Eyes */}
          <rect x="32" y="45" width="14" height="10" rx="4" fill="white" />
          <rect x="54" y="45" width="14" height="10" rx="4" fill="white" />

          {/* Pupils */}
          <circle cx="39" cy="50" r="3" fill="#3B82F6" />
          <circle cx="61" cy="50" r="3" fill="#3B82F6" />

          {/* Smile */}
          <path d="M40 65 Q50 72 60 65" stroke="white" strokeWidth="3" strokeLinecap="round" />

          {/* Ear/Headphones details */}
          <rect x="14" y="42" width="6" height="26" rx="2" fill="#4F46E5" />
          <rect x="80" y="42" width="6" height="26" rx="2" fill="#4F46E5" />

        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight ${textColors[variant]} ${text}`}>
            TQB
          </span>
          {size !== 'sm' && (
            <span className={`text-xs ${variant === 'light' ? 'text-white/70' : 'text-gray-600'} font-medium tracking-wide`}>
              Travel Quote Bot
            </span>
          )}
        </div>
      )}
    </div>
  );
}
