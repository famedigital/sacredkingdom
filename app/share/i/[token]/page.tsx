import type { Metadata } from 'next';
import { SharedItineraryView } from '@/components/share/SharedItineraryView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Shared Itinerary',
  robots: { index: false, follow: false },
};

export default async function BookingShareItineraryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <SharedItineraryView mode="booking" token={token} />;
}
