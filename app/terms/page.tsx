import type { Metadata } from 'next';
import { LegalPageView } from '@/components/public/LegalPageView';
import { getTermsPageContent } from '@/lib/content/get-legal';
import { getCompanyName } from '@/lib/brand';
import { buildSocialMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const [company, content] = await Promise.all([getCompanyName(), getTermsPageContent()]);
  return buildSocialMetadata({
    title: `${content.title} | ${company}`,
    description: content.cta.subtitle || content.title,
    path: '/terms',
    siteName: company,
  });
}

export default async function TermsPage() {
  const [company, content] = await Promise.all([getCompanyName(), getTermsPageContent()]);
  return <LegalPageView content={content} company={company} />;
}
