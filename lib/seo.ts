import type { Metadata } from 'next';
import { DEFAULT_COMPANY_NAME } from '@/lib/brand-defaults';

/** Fallback brand — prefer getCompanyName() from CRM at runtime */
export const SITE_NAME = DEFAULT_COMPANY_NAME;
export const SITE_DESCRIPTION =
  `Travel Bhutan with ${DEFAULT_COMPANY_NAME}. Locally owned journeys through culture, treks, festivals, and wildlife — authentic, tailor-made, and planned in Thimphu.`;

/** Canonical site origin used for absolute OG/Twitter image URLs */
export function getSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (fromEnv) {
    const withProtocol = fromEnv.startsWith('http') ? fromEnv : `https://${fromEnv}`;
    return withProtocol.replace(/\/$/, '');
  }

  return 'https://sacredkingdom.travel';
}

/** Default social share image (1200×630) */
export const DEFAULT_OG_IMAGE = '/brand/logo-3d.png';

/** Wordmark / emblem */
export const SITE_LOGO_URL = '/brand/icon-3d-deep-blue.png';

/**
 * Optimize remote images (esp. Cloudinary) for WhatsApp / OG (≈1200×630).
 */
export function toOgImageUrl(url?: string | null): string {
  if (!url || !url.trim()) return DEFAULT_OG_IMAGE;

  const trimmed = url.trim();
  const cloudinaryMatch = trimmed.match(
    /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i
  );

  if (cloudinaryMatch) {
    const [, prefix, rest] = cloudinaryMatch;
    const pathOnly = rest.replace(/^((?:[^/]+,)+\w+\/)*/, '');
    return `${prefix}c_fill,w_1200,h_630,g_auto,f_jpg,q_auto/${pathOnly}`;
  }

  return trimmed;
}

export function buildSocialMetadata({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  siteName = SITE_NAME,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  type?: 'website' | 'article';
  siteName?: string;
}): Metadata {
  const siteUrl = getSiteUrl();
  const ogImage = toOgImageUrl(image);
  const url = `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: 'en_US',
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
