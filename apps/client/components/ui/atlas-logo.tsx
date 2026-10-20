'use client';

import { cn } from '@/lib/utils';

interface AtlasLogoProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

export function AtlasLogo({ size = 24, className, withGlow = true }: AtlasLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none', className)}
    >
      <defs>
        <linearGradient id="globeGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0a84ff" />
          <stop offset="100%" stopColor="#0051c7" />
        </linearGradient>
        {withGlow && (
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a84ff" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0a84ff" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {/* Ambient celestial glow */}
      {withGlow && <circle cx="24" cy="24" r="20" fill="url(#globeGlow)" />}

      {/* Outer World Sphere */}
      <circle cx="24" cy="24" r="18" stroke="url(#globeGrad)" strokeWidth="3" />

      {/* Equator */}
      <line x1="6" y1="24" x2="42" y2="24" stroke="url(#globeGrad)" strokeWidth="2.2" strokeLinecap="round" />

      {/* Central Meridian */}
      <line x1="24" y1="6" x2="24" y2="42" stroke="url(#globeGrad)" strokeWidth="2.2" strokeLinecap="round" />

      {/* Curved Meridian */}
      <ellipse cx="24" cy="24" rx="8.5" ry="18" stroke="url(#globeGrad)" strokeWidth="2.2" />

      {/* Upper Latitude */}
      <path
        d="M9.5 15 C14 17.5, 34 17.5, 38.5 15"
        stroke="url(#globeGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Lower Latitude */}
      <path
        d="M9.5 33 C14 30.5, 34 30.5, 38.5 33"
        stroke="url(#globeGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
