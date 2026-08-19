import type { Metadata } from 'next';
import { LegalPageView } from '@/components/public/LegalPageView';
import { getCompanyName } from '@/lib/brand';
import { buildSocialMetadata } from '@/lib/seo';
import type { LegalPageContent } from '@/lib/content/legal';

export const dynamic = 'force-dynamic';

const BOOKING_POLICY: LegalPageContent = {
  title: 'Booking Policy',
  lastUpdated: '',
  sections: [
    {
      title: 'Booking process',
      body: `- Submit a booking inquiry via the website, email, or phone
- Receive a detailed proposal and quotation within 24–48 hours
- Confirm the itinerary and provide traveler details
- Pay a deposit to secure the booking
- Receive confirmation and invoice
- Pay the final balance 30 days before departure
- Receive travel documents and pre-departure notes`,
    },
    {
      title: 'Payment terms',
      body: `A deposit secures the itinerary. The remaining balance is due 30 days before departure.

- International airfare to/from Bhutan is not included
- Travel insurance is mandatory
- Personal expenses (shopping, drinks, tips) are extra
- Visa fees are arranged with your booking
- Optional activities not in the itinerary are extra`,
    },
    {
      title: 'Cancellation',
      body: `- 30+ days before departure: full refund minus deposit
- 15–30 days: 50% of total cost
- 7–14 days: 25% of total cost
- Less than 7 days: no refund
- No-show: no refund or rescheduling

Refunds are processed within 14 business days. Cancellations must be in writing by email.`,
    },
    {
      title: 'Changes',
      body: `- More than 30 days prior: no extra charge
- 15–30 days: a small administrative fee may apply
- Less than 15 days: subject to availability and cancellation terms
- Force majeure may require itinerary adjustments at no extra cost`,
    },
    {
      title: 'Travel insurance',
      body: `All travelers must hold comprehensive insurance covering medical emergencies, evacuation, trip interruption, baggage, and flight disruption. Proof is required before departure.`,
    },
    {
      title: 'Questions',
      body: `Write to sacredkingdomtravel@gmail.com or call +975 77888822. Studio: Changlam Plaza, Room No. 502, Thimphu, Bhutan.`,
    },
  ],
  cta: {
    title: 'Ready to book',
    subtitle: 'Tell us how you like to travel and we will shape the days.',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyName();
  return buildSocialMetadata({
    title: `Booking Policy | ${company}`,
    description: 'Booking, payment, and cancellation terms for Sacred Kingdom Travel.',
    path: '/policy',
    siteName: company,
  });
}

export default async function PolicyPage() {
  const company = await getCompanyName();
  return <LegalPageView content={BOOKING_POLICY} company={company} />;
}
