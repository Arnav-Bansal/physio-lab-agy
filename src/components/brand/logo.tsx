import React from 'react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  variant?: 'dark' | 'light';
  showTagline?: boolean;
  compact?: boolean;
  subtitle?: string;
}

export function BrandEmblem({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-border shadow-sm overflow-hidden p-1',
        className
      )}
    >
      <img
        src="/images/clinic/lovable-logo.png"
        alt="The Physio Lab"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export function BrandLogo({
  className,
  markClassName,
  variant = 'dark',
  showTagline = true,
  compact = false,
  subtitle,
}: BrandLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <BrandEmblem className={cn(compact ? 'h-8 w-8' : 'h-10 w-10', markClassName)} />
      <div className="flex flex-col">
        <span
          className={cn(
            'font-semibold tracking-tight leading-tight',
            compact ? 'text-sm' : 'text-base sm:text-lg',
            variant === 'light' ? 'text-white' : 'text-foreground'
          )}
        >
          The Physio Lab
        </span>
        {showTagline && (
          <span
            className={cn(
              'text-xs leading-tight',
              variant === 'light' ? 'text-white/70' : 'text-muted-foreground'
            )}
          >
            {subtitle || 'Research & Rehabilitation'}
          </span>
        )}
      </div>
    </div>
  );
}
