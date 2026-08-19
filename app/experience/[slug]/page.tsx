import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { Folio } from '@/components/public/Folio';
import { CTASection } from '@/components/public/CTASection';
import { DESTINATIONS, getDestination } from '@/lib/content/destinations';
import { getCompanyName } from '@/lib/brand';
import { buildSocialMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestination(slug);
  const company = await getCompanyName();
  if (!dest) {
    return { title: `Experience | ${company}` };
  }
  return buildSocialMetadata({
    title: `${dest.name} Attractions | ${company}`,
    description: dest.intro.slice(0, 160),
    path: `/experience/${dest.slug}`,
    siteName: company,
  });
}

export default async function ExperienceDestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) notFound();

  const others = DESTINATIONS.filter((d) => d.slug !== dest.slug).slice(0, 6);

  return (
    <div className="wash-paper flex min-h-screen flex-col">
      <Navigation forceSolid />

      <main className="safe-bottom-padding flex-1 pt-16 lg:pb-0">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dest.image} alt={dest.name} className="luxury-photo h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/30" />
          </div>
          <div className="container relative z-10 py-24 md:py-32">
            <Folio index="01" label={`Experience · ${dest.name}`} onDark />
              <h1 className="font-accent max-w-3xl text-5xl font-medium tracking-tight text-[#E8D5A3] md:text-6xl">
                {dest.name} attractions
              </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              {dest.headline}
            </p>
          </div>
        </section>

        <section className="wash-paper py-16 md:py-24">
          <div className="container max-w-3xl">
            <Folio index="02" label="The valley" />
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{dest.intro}</p>
          </div>
        </section>

        {dest.attractions.length > 0 ? (
          <section className="wash-dusk border-y border-primary/20 py-16 md:py-24">
            <div className="container">
              <Folio index="03" label="Places" />
              <h2 className="font-accent mb-10 max-w-[16ch] text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight">
                Top {dest.name} attractions
              </h2>
              <div className="grid gap-0 md:grid-cols-2 md:gap-x-16">
                {dest.attractions.map((item) => (
                  <article key={item.title} className="border-t border-primary/20 py-8">
                    <h3 className="font-heading text-lg font-medium">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="wash-paper py-16 md:py-20">
          <div className="container">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-accent text-2xl font-medium">More valleys</h2>
              <Link href="/experience" className="text-sm font-medium text-primary hover:underline">
                All experience pages
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {others.map((d) => (
                <Link
                  key={d.slug}
                  href={`/experience/${d.slug}`}
                  className="rounded-full border border-primary/30 px-4 py-2 text-[11px] uppercase tracking-[0.14em] hover:border-primary hover:text-primary"
                >
                  {d.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CTASection chapter="04" />
      </main>

      <Footer />
    </div>
  );
}
