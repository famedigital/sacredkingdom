'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_COMPANY_NAME,
  DEFAULT_COMPANY_TAGLINE,
  normalizeCompanyName,
} from '@/lib/brand-defaults';
import {
  DEFAULT_BRAND_LOGO_SETTINGS,
  normalizeBrandLogoSettings,
  type BrandLogoSettings,
} from '@/lib/brand-logo';
import {
  DEFAULT_MOBILE_NAV_SETTINGS,
  normalizeMobileNavSettings,
  type MobileNavSettings,
} from '@/lib/mobile-nav';

type BrandInfo = {
  name: string;
  tagline: string;
  logo: BrandLogoSettings;
  mobileNav: MobileNavSettings;
};

/**
 * Client hook — company name, logo, and mobile nav from CRM.
 */
export function useCompanyBrand(): BrandInfo {
  const [brand, setBrand] = useState<BrandInfo>({
    name: DEFAULT_COMPANY_NAME,
    tagline: DEFAULT_COMPANY_TAGLINE,
    logo: { ...DEFAULT_BRAND_LOGO_SETTINGS },
    mobileNav: { ...DEFAULT_MOBILE_NAV_SETTINGS },
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/brand', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setBrand({
          name: normalizeCompanyName(data.name),
          tagline:
            String(data.tagline || DEFAULT_COMPANY_TAGLINE).trim() || DEFAULT_COMPANY_TAGLINE,
          logo: normalizeBrandLogoSettings(data.logo),
          mobileNav: normalizeMobileNavSettings(data.mobileNav),
        });
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return brand;
}
