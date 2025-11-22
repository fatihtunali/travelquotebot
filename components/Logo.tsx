import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'gradient';
}

export default function Logo({ size = 'md', showText = true, variant = 'light' }: LogoProps) {
  // Size configurations for different logo sizes
  const sizeConfig = {
    sm: { width: 200, height: 65 },
    md: { width: 280, height: 90 },
    lg: { width: 360, height: 115 },
    xl: { width: 480, height: 150 }
  };

  const { width, height } = sizeConfig[size];

  // For light variant (dark backgrounds), we might want to add a filter
  // For now, the teal logo works well on both light and dark backgrounds
  const imageClass = variant === 'light'
    ? 'brightness-110' // Slightly brighter for dark backgrounds
    : '';

  return (
    <div className="flex items-center">
      <Image
        src="/logo-assets/navbar-480x150.png"
        alt="Travel Quote Bot - Intelligent Travel, Simplified"
        width={width}
        height={height}
        className={`object-contain ${imageClass}`}
        priority={size === 'md' || size === 'lg'}
      />
    </div>
  );
}
