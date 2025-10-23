interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark' | 'gradient';
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
    dark: 'text-gray-900',
    gradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'
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
          {/* Background circle with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>

          {/* Main circle background */}
          <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />

          {/* Travel pin/location marker shape */}
          <path
            d="M50 25 C42 25 35 32 35 40 C35 50 50 65 50 65 C50 65 65 50 65 40 C65 32 58 25 50 25 Z"
            fill="white"
            opacity="0.95"
          />

          {/* Inner circle of pin (represents the "point") */}
          <circle cx="50" cy="40" r="6" fill="url(#accentGradient)" />

          {/* AI Circuit/Node elements - small dots around the pin */}
          <circle cx="38" cy="48" r="2" fill="white" opacity="0.8" />
          <circle cx="62" cy="48" r="2" fill="white" opacity="0.8" />
          <circle cx="44" cy="56" r="2" fill="white" opacity="0.8" />
          <circle cx="56" cy="56" r="2" fill="white" opacity="0.8" />

          {/* AI neural network lines */}
          <line x1="38" y1="48" x2="44" y2="56" stroke="white" strokeWidth="1" opacity="0.6" />
          <line x1="62" y1="48" x2="56" y2="56" stroke="white" strokeWidth="1" opacity="0.6" />
          <line x1="44" y1="56" x2="56" y2="56" stroke="white" strokeWidth="1" opacity="0.6" />

          {/* Quote mark accent - subtle */}
          <text x="50" y="82" fontSize="18" fill="white" opacity="0.9" textAnchor="middle" fontWeight="bold" fontFamily="Georgia, serif">"</text>
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight ${textColors[variant]} ${text}`}>
            TQA
          </span>
          {size !== 'sm' && (
            <span className={`text-xs ${variant === 'light' ? 'text-white/70' : variant === 'dark' ? 'text-gray-600' : 'text-gray-600'} font-medium tracking-wide`}>
              Travel Quote AI
            </span>
          )}
        </div>
      )}
    </div>
  );
}
