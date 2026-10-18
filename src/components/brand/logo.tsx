import React from 'react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  variant?: 'dark' | 'light';
  showTagline?: boolean;
  compact?: boolean;
}

export function BrandEmblem({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      className={cn('h-10 w-10 shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="physioTealEmblem" x1="16" y1="12" x2="104" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#009CA6" />
          <stop offset="55%" stopColor="#00858E" />
          <stop offset="100%" stopColor="#006D75" />
        </linearGradient>
      </defs>
      {/* Top Circular Head */}
      <circle cx="60" cy="21" r="11" fill="url(#physioTealEmblem)" />
      {/* Left Heart Wing */}
      <path
        d="M46 98C26 83 16 64 16 46C16 33.5 24.5 26 35.5 26C43.5 26 50.5 30.5 55 37.5C45.5 47.5 40.5 64 43.5 84.5C44.2 89.2 45 93.8 46 98Z"
        fill="url(#physioTealEmblem)"
      />
      {/* Right Heart Wing */}
      <path
        d="M74 98C94 83 104 64 104 46C104 33.5 95.5 26 84.5 26C76.5 26 69.5 30.5 65 37.5C74.5 47.5 79.5 64 76.5 84.5C75.8 89.2 75 93.8 74 98Z"
        fill="url(#physioTealEmblem)"
      />
      {/* Center Teardrop Torso */}
      <path
        d="M60 46C65.5 56 70 70.5 70 83C70 92.5 65.8 100 60 100C54.2 100 50 92.5 50 83C50 70.5 54.5 56 60 46Z"
        fill="url(#physioTealEmblem)"
      />
    </svg>
  );
}

export function BrandLogo({
  className,
  markClassName,
  variant = 'dark',
  showTagline = true,
  compact = false,
}: BrandLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      <BrandEmblem className={cn(compact ? 'h-9 w-9' : 'h-11 w-11', markClassName)} />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-extrabold tracking-[0.08em] uppercase',
            compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl',
            variant === 'light' ? 'text-white' : 'text-[#141413]'
          )}
        >
          THE PHYSIO LAB
        </span>
        {showTagline && (
          <span
            className={cn(
              'font-semibold uppercase tracking-[0.22em] mt-1',
              compact ? 'text-[9px]' : 'text-[10px] sm:text-[11px]',
              variant === 'light' ? 'text-[#5EEAD4]' : 'text-[#00858E]'
            )}
          >
            RESEARCH &amp; REHABILITATION
          </span>
        )}
      </div>
    </div>
  );
}
