'use client';

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import {
  BRAND_LOGO_ASPECT,
  resolveBrandLogoSrc,
  resolveBrandLogoSrcSet,
} from '@/lib/brand-logo';
import { useCompanyBrand } from '@/hooks/use-company-brand';

type BrandLogoProps = {
  height?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
  style?: CSSProperties;
};

/**
 * Default is the deep-blue 3D icon (transparent PNG).
 * Height is always applied in CSS so the PNG cannot paint at intrinsic size.
 */
export function BrandLogo({
  height = 48,
  className,
  priority = false,
  alt,
  style,
}: BrandLogoProps) {
  const brand = useCompanyBrand();
  const src = resolveBrandLogoSrc(brand.logo, height, 2);
  const srcSet = resolveBrandLogoSrcSet(brand.logo, height);
  const width = Math.round(height * BRAND_LOGO_ASPECT);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={`${width}px`}
      width={width}
      height={height}
      alt={alt || brand.name}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      draggable={false}
      style={{ height, width: 'auto', maxHeight: height, ...style }}
      className={cn('shrink-0 object-contain', className)}
    />
  );
}

export function NavBrandLockup({
  markHeight = 52,
  onDark = false,
  priority = false,
}: {
  markHeight?: number;
  onDark?: boolean;
  priority?: boolean;
}) {
  const brand = useCompanyBrand();
  const mark = Math.min(Math.max(markHeight, 44), 56);

  return (
    <span className="flex max-w-[min(100%,24rem)] items-center gap-2.5 overflow-visible">
      <BrandLogo height={mark} priority={priority} alt="" />
      <span className="flex min-w-0 flex-col justify-center text-left">
        <span
          className={cn(
            'font-accent truncate text-[0.98rem] leading-[1.1] font-medium tracking-tight sm:text-lg',
            onDark ? 'text-white' : 'text-foreground'
          )}
        >
          {brand.name}
        </span>
        <span className="mt-0.5 truncate text-[10px] leading-tight font-medium tracking-[0.12em] text-primary">
          {brand.tagline}
        </span>
      </span>
    </span>
  );
}
