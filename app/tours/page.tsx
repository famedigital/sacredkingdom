import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllTours } from '@/lib/database';
import { ToursPageClient } from './ToursPageClient';
import { buildSocialMetadata } from '@/lib/seo';
import { getCompanyName } from '@/lib/brand';

// Always fetch fresh tours after admin edits (avoid stale Vercel/RSC cache)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyName();
  return buildSocialMetadata({
    title: `Trips | ${company}`,
    description: `Browse Bhutan trip packages — cultural immersions, treks, festivals, and wildlife with ${company}.`,
    path: '/tours',
    siteName: company,
  });
}

export default async function ToursPage() {
  const tours = await getAllTours();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading tours...</div>}>
      <ToursPageClient tours={tours} />
    </Suspense>
  );
}
