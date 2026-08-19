'use client';

import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  brandLogoGlowStyle,
  type BrandLogoSettings,
} from '@/lib/brand-logo';

type BrandLogoGlowProps = {
  settings: BrandLogoSettings;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Standout plate behind the nav logo (shape + fill + glow + shadow).
 * Positioned independently of the nav bar chrome.
 */
export function BrandLogoGlow({ settings, className, style, children }: BrandLogoGlowProps) {
  const plate = brandLogoGlowStyle(settings);
  const ox = Number(settings.glowOffsetX) || 0;
  const oy = Number(settings.glowOffsetY) || 0;
  const pulse = settings.pulseEnabled;

  return (
    <span
      className={cn('relative inline-flex items-center justify-center', className)}
      style={style}
    >
      {plate ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-visible"
        >
          <span
            className="absolute left-1/2 top-1/2 block"
            style={{
              transform: `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`,
            }}
          >
            <span
              className={cn(
                'block shrink-0',
                pulse && 'animate-[logo-led-pulse_2.8s_ease-in-out_infinite] will-change-transform'
              )}
              style={plate}
            />
          </span>
        </span>
      ) : null}
      <span className="relative z-10 inline-flex items-center justify-center">{children}</span>
    </span>
  );
}
