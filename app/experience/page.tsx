import Link from 'next/link';
import type { Metadata } from 'next';
import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { PageMasthead } from '@/components/public/PageMasthead';
import { CTASection } from '@/components/public/CTASection';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { DESTINATIONS } from '@/lib/content/destinations';
import { getCompanyName } from '@/lib/brand';
import { buildSocialMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyName();
  return buildSocialMetadata({
    title: `Experience Bhutan | ${company}`,
    description:
      'Peaceful valleys, ancient monasteries, scenic mountain views, and charming villages — Paro, Thimphu, Punakha, Bumthang, Haa, Gasa, and the east.',
    path: '/experience',
    siteName: company,
  });
}

export default async function ExperiencePage() {
  return (
    <div className="wash-paper flex min-h-screen flex-col">
      <Navigation forceSolid />

      <main className="safe-bottom-padding flex-1 pt-16 lg:pb-0">
        <PageMasthead
          index="01"
          label="Experience"
          title="Best tourist spots in Bhutan"
          dek="Peaceful valleys, ancient monasteries, mountain passes, and village life. Every dzongkhag offers its own mix of culture and landscape — start with a place, then we shape the days."
          variant="dusk"
        />

        <section className="wash-paper py-16 md:py-24">
          <div className="container">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {DESTINATIONS.map((dest, index) => (
                <ScrollReveal key={dest.slug} delay={index * 0.03}>
                  <Link
                    href={`/experience/${dest.slug}`}
                    className="hover-lift group block overflow-hidden rounded-xl border-primary/20 ring-1 ring-foreground/10"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="luxury-photo h-full w-full object-cover"
                      />
                    </div>
                    <div className="wash-paper p-6">
                      <p className="text-[10px] font-semibold tracking-[0.16em] text-[color-mix(in_srgb,var(--primary)_55%,#0a0a0a)] uppercase">
                        Dzongkhag
                      </p>
                      <h2 className="font-accent mt-1.5 text-xl leading-snug font-medium tracking-tight group-hover:text-primary">
                        {dest.name} attractions
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {dest.intro}
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <CTASection chapter="02" />
      </main>

      <Footer />
    </div>
  );
}
