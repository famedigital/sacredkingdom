import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { Folio } from '@/components/public/Folio';
import { CTASection } from '@/components/public/CTASection';
import { TourGallery } from '@/components/public/TourGallery';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { buttonVariants } from '@/components/ui/button';
import { getRelatedTours, getTourBySlug, Tour } from '@/lib/database';
import { TourCards } from '@/components/public/TourCards';
import { formatTourPrice, isTourPriceVisible } from '@/lib/tour-options';
import { normalizeTourInclusions } from '@/lib/quotes/client-quote';
import { buildSocialMetadata, SITE_NAME } from '@/lib/seo';
import { categoryDisplayName } from '@/lib/tour-category';
import { cn } from '@/lib/utils';
import { focalToObjectPosition } from '@/lib/image-focal';
import {
  Clock,
  TrendingUp,
  Users,
  MapPin,
  Mountain,
  Check,
  X,
  Utensils,
  Bed,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);

  if (!tour) {
    return {
      title: `Tour not found | ${SITE_NAME}`,
    };
  }

  const title = tour.meta_title?.trim() || tour.title;
  const description =
    tour.meta_description?.trim() ||
    tour.description?.trim() ||
    tour.tagline?.trim() ||
    `Explore ${tour.title} with ${SITE_NAME}.`;
  const image = tour.thumbnail_url || tour.hero_image_url;

  return buildSocialMetadata({
    title,
    description,
    path: `/tours/${slug}`,
    image,
  });
}

function categoryLabel(category?: string | null) {
  return categoryDisplayName(category);
}

/** Render long_description with ✓ lines as checklist rows. */
function DetailedDescription({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);

  return (
    <div className="mt-6 space-y-2">
      <h3 className="font-heading text-lg font-semibold text-foreground">Detailed Description</h3>
      <div className="space-y-2 text-base leading-relaxed text-foreground/80">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={i} className="h-2" />;
          }
          if (trimmed.startsWith('✓') || trimmed.startsWith('✔')) {
            const content = trimmed.replace(/^[✓✔]\s*/, '');
            return (
              <div key={i} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{content}</span>
              </div>
            );
          }
          return (
            <p key={i} className="font-medium text-foreground/90">
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  let tour: Tour | null = null;
  let relatedTours: Tour[] = [];

  try {
    const { slug } = await params;
    tour = await getTourBySlug(slug);

    if (!tour) {
      notFound();
    }
    relatedTours = await getRelatedTours(tour.slug, tour.category, 4);
  } catch (error) {
    console.error('[PAGE] Error in tour detail page:', error);

    return (
      <div className="wash-paper flex min-h-screen flex-col">
        <Navigation forceSolid />
        <main className="flex flex-1 items-center justify-center">
          <div className="px-6 py-20 text-center">
            <div className="mx-auto max-w-md">
              <h1 className="mb-4 text-3xl font-bold text-foreground">Unable to Load Tour</h1>
              <p className="mb-8 text-lg text-muted-foreground">
                We encountered an issue while loading this tour. This might be a temporary problem.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/tours" className={cn(buttonVariants({ size: 'lg' }))}>
                  View All Tours
                </Link>
                <Link href="/contact" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const includedItems = normalizeTourInclusions(
    (tour.included_items || tour.inclusions || []).filter(
      (item): item is string => Boolean(item && String(item).trim())
    )
  );
  const excludedItems = (tour.excluded_items || tour.exclusions || []).filter(
    (item): item is string => Boolean(item && String(item).trim())
  );
  const galleryUrls = (tour.gallery_urls || []).filter(
    (url): url is string => Boolean(url && String(url).trim())
  );
  const detailedDescription = (tour.long_description || '').trim();
  const bookHref = `/contact?intent=book&tour=${tour.slug}&title=${encodeURIComponent(tour.title || '')}#contact-form`;
  const inquireHref = `/contact?intent=inquire&tour=${tour.slug}&title=${encodeURIComponent(tour.title || '')}#contact-form`;
  const priceLabel = isTourPriceVisible(tour)
    ? formatTourPrice(tour.price, tour.category)
    : 'Contact for price';
  const metaLine = [
    tour.duration ? `${tour.duration} days` : null,
    tour.difficulty_level ? String(tour.difficulty_level) : null,
    categoryLabel(tour.category),
  ]
    .filter(Boolean)
    .join(' · ');

  if (tour.tour_type === 'custom') {
    return (
      <div className="wash-paper flex min-h-screen flex-col">
        <Navigation forceSolid />
        <main className="flex-1">
          <section className="bg-background py-32">
            <div className="container">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary">
                  <Users className="h-12 w-12 text-primary-foreground" />
                </div>
                <h1 className="font-accent mb-6 text-4xl font-medium md:text-5xl">{tour.title}</h1>
                <p className="mb-12 text-xl leading-relaxed text-muted-foreground">{tour.description}</p>
                {includedItems.length > 0 && (
                  <div className="mb-10 rounded-2xl bg-muted/30 p-8 text-left">
                    <h3 className="font-heading mb-6 text-xl font-semibold">What&apos;s Included</h3>
                    <ul className="grid gap-3">
                      {includedItems.map((inclusion, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/contact" className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>
                    Request Custom Tour
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link href="/tours" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'gap-2')}>
                    View All Tours
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="wash-paper flex min-h-screen flex-col">
      <Navigation forceSolid />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative flex min-h-[70vh] items-end overflow-hidden md:min-h-[75vh]">
          <div className="absolute inset-0">
            <img
              src={tour.hero_image_url || tour.thumbnail_url || '/og-default.jpg'}
              alt={tour.title}
              className="h-full w-full object-cover"
              style={{
                objectPosition: focalToObjectPosition(
                  tour.hero_image_focal_x,
                  tour.hero_image_focal_y
                ),
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
          </div>

          <div className="relative w-full px-6 pb-12 pt-32 md:px-12 md:pb-16 lg:px-16">
            <div className="mx-auto max-w-4xl">
              <Link
                href="/tours"
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Back to Tours
              </Link>

              <Folio index="01" label="Journey" onDark />
              <h1 className="font-accent text-4xl font-medium tracking-tight text-[#E8D5A3] md:text-5xl lg:text-6xl">
                {tour.title}
              </h1>

              {(tour.tagline || tour.description) && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
                  {tour.tagline || tour.description}
                </p>
              )}

              {metaLine && (
                <p className="mt-4 text-sm font-medium tracking-wide text-white/70 uppercase">
                  {metaLine}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={bookHref} className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-full px-7 gap-2')}>
                  Book Now
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href={inquireHref}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'gap-2 border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white'
                  )}
                >
                  Inquire
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile sticky book bar */}
        <div className="sticky top-0 z-40 border-b border-primary/20 wash-paper px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {isTourPriceVisible(tour) ? 'Starting from' : 'Pricing'}
              </p>
              <p className="truncate text-base font-semibold text-primary">{priceLabel}</p>
              <p className="truncate text-xs text-muted-foreground">{metaLine}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link href={bookHref} className={cn(buttonVariants({ size: 'sm' }))}>
                Book
              </Link>
              <Link href={inquireHref} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                Inquire
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <section className="wash-paper py-14 md:py-20">
          <div className="container mx-auto px-6 md:px-12 lg:px-16">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-16">
                {/* Overview */}
                <ScrollReveal>
                  <div>
                    <Folio index="02" label="The journey" />
                    <h2 className="font-accent text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                      Overview
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-foreground/80 md:text-lg">
                      {tour.description ||
                        'A private Bhutan journey shaped around how you like to travel.'}
                    </p>
                    {detailedDescription && <DetailedDescription text={detailedDescription} />}
                  </div>
                </ScrollReveal>

                {/* Gallery */}
                {galleryUrls.length > 0 && (
                  <ScrollReveal>
                    <div>
                      <p className="mb-2 text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
                        Moments
                      </p>
                      <h2 className="font-accent mb-2 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                        Gallery
                      </h2>
                      <p className="mb-6 text-sm text-muted-foreground">
                        Tap any photo to view it larger
                      </p>
                      <TourGallery images={galleryUrls} title={tour.title} />
                    </div>
                  </ScrollReveal>
                )}

                {/* Highlights */}
                {tour.highlights && tour.highlights.length > 0 && (
                  <ScrollReveal>
                    <div>
                      <p className="mb-2 text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
                        Why this tour
                      </p>
                      <h2 className="font-accent mb-6 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                        Highlights
                      </h2>
                      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                        {tour.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-start gap-3 border-t border-border pt-4">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                            <p className="text-sm leading-relaxed text-foreground/85 md:text-base">
                              {highlight}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>
                )}

                {/* Itinerary */}
                {tour.itinerary && tour.itinerary.length > 0 && (
                  <div>
                    <ScrollReveal>
                      <Folio index="03" label="Day by day" />
                      <h2 className="font-accent mb-8 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                        Itinerary
                      </h2>
                    </ScrollReveal>

                    <div className="relative space-y-0 border-l border-border/80 pl-8">
                      {tour.itinerary.map((day, i) => (
                        <ScrollReveal key={`${day.day}-${i}`} delay={Math.min(i * 0.04, 0.2)}>
                          <div className="relative pb-10 last:pb-0">
                            <div className="absolute top-0 -left-8 flex size-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-4 ring-background">
                              {day.day}
                            </div>
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-heading text-xl font-semibold text-foreground">
                                  {day.title}
                                </h3>
                                {day.location && (
                                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <MapPin className="size-3.5 text-accent" />
                                    {day.location}
                                  </p>
                                )}
                              </div>
                              {day.description && (
                                <p className="text-base leading-relaxed text-foreground/80">
                                  {day.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
                                {day.meals && (
                                  <span className="inline-flex items-center gap-1.5">
                                    <Utensils className="size-4 text-accent" />
                                    {day.meals}
                                  </span>
                                )}
                                {day.accommodation && (
                                  <span className="inline-flex items-center gap-1.5">
                                    <Bed className="size-4 text-accent" />
                                    {day.accommodation}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                )}

                {/* Included / Excluded */}
                {(includedItems.length > 0 || excludedItems.length > 0) && (
                  <ScrollReveal>
                    <div>
                      <p className="mb-2 text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
                        Practical details
                      </p>
                      <h2 className="font-accent mb-8 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                        What&apos;s covered
                      </h2>
                      <div className="grid gap-10 sm:grid-cols-2">
                        {includedItems.length > 0 && (
                          <div>
                            <h3 className="font-heading mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                              <Check className="size-5 text-emerald-600" />
                              Included
                            </h3>
                            <ul className="space-y-3">
                              {includedItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {excludedItems.length > 0 && (
                          <div>
                            <h3 className="font-heading mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                              <X className="size-5 text-muted-foreground" />
                              Excluded
                            </h3>
                            <ul className="space-y-3">
                              {excludedItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                                  <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                )}

                {/* Best season / altitude */}
                {((tour.best_season && tour.best_season.length > 0) ||
                  (tour.altitude_range && tour.altitude_range !== 'Variable')) && (
                  <ScrollReveal>
                    <div className="grid gap-8 sm:grid-cols-2">
                      {tour.best_season && tour.best_season.length > 0 && (
                        <div>
                          <h3 className="font-heading mb-3 text-lg font-semibold">Best time to visit</h3>
                          <p className="text-sm capitalize text-foreground/80">
                            {tour.best_season.join(', ')}
                          </p>
                        </div>
                      )}
                      {tour.altitude_range && tour.altitude_range !== 'Variable' && (
                        <div>
                          <h3 className="font-heading mb-3 flex items-center gap-2 text-lg font-semibold">
                            <Mountain className="size-5 text-accent" />
                            Altitude
                          </h3>
                          <p className="text-sm text-foreground/80">{tour.altitude_range}</p>
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                )}
              </div>

              {/* Desktop book card */}
              <aside className="hidden lg:block">
                <div className="sticky top-28 rounded-xl border border-primary/20 bg-card p-6 ring-1 ring-foreground/10">
                  <h3 className="font-heading text-xl font-semibold text-foreground">Book this tour</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Reserve your place on this journey</p>

                  <div className="mt-6 space-y-3 border-b border-border pb-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-muted-foreground">
                        {isTourPriceVisible(tour) ? 'From' : 'Price'}
                      </span>
                      <span className="text-xl font-semibold text-primary">{priceLabel}</span>
                    </div>
                    {tour.duration ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="size-3.5" />
                          Duration
                        </span>
                        <span className="font-medium text-foreground">{tour.duration} days</span>
                      </div>
                    ) : null}
                    {tour.difficulty_level ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-1.5 capitalize text-muted-foreground">
                          <TrendingUp className="size-3.5" />
                          Difficulty
                        </span>
                        <span className="font-medium capitalize text-foreground">
                          {tour.difficulty_level}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    <Link href={bookHref} className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
                      Request booking
                    </Link>
                    <Link
                      href={inquireHref}
                      className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}
                    >
                      Ask a question
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {relatedTours.length > 0 && (
          <section className="wash-dusk border-y border-primary/20 py-14 md:py-20">
            <div className="container mx-auto px-6 md:px-12 lg:px-16">
              <ScrollReveal>
                <Folio index="04" label="Other experiences" />
                <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="font-accent text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                    Other trips you may like
                  </h2>
                  <Link
                    href="/tours"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    View all trips
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </ScrollReveal>
              <TourCards tours={relatedTours} />
            </div>
          </section>
        )}

        <CTASection chapter="09" />
      </main>

      <Footer />
    </div>
  );
}
