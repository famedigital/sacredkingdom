import Link from 'next/link';
import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import {
  getFeaturedTours,
  getActiveHeroSlides,
  getFeaturedTestimonials,
  getPublishedBlogPosts,
  type BlogPost,
} from '@/lib/database';
import { HeroSlideshow } from '@/components/public/HeroSlideshow';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { TourCards } from '@/components/public/TourCards';
import { DestinationPortraits } from '@/components/public/DestinationPortraits';
import { DifferentiatorsSection } from '@/components/public/DifferentiatorsSection';
import { QuickAnswersSection } from '@/components/public/QuickAnswersSection';
import { AboutBhutanSection } from '@/components/public/AboutBhutanSection';
import { JournalTeasers } from '@/components/public/JournalTeasers';
import { CTASection } from '@/components/public/CTASection';
import { PartnersMarquee } from '@/components/public/PartnersMarquee';
import { Folio } from '@/components/public/Folio';
import type { Metadata } from 'next';
import { buildSocialMetadata, SITE_DESCRIPTION } from '@/lib/seo';
import { getCompanyName } from '@/lib/brand';
import { DEFAULT_COMPANY_NAME } from '@/lib/brand-defaults';
import { getHomePageContent } from '@/lib/content/get-home';
import { DEFAULT_FEATURED_TESTIMONIALS } from '@/lib/content/testimonials';
import { DEFAULT_TOUR_CATEGORIES } from '@/lib/tour-category';
import { getAppearance, type LayoutId } from '@/lib/appearance';
import type { HomeContent } from '@/lib/content/home';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyName();
  const description = SITE_DESCRIPTION.replace(DEFAULT_COMPANY_NAME, company);
  return {
    ...buildSocialMetadata({
      title: `${company} — Experience Bhutan like never before`,
      description,
      path: '/',
      siteName: company,
    }),
    keywords: [
      'Bhutan tour',
      'Bhutan travel',
      'Sacred Kingdom Travel',
      'Bhutan trekking',
      'Bhutan festival',
      company,
    ],
  };
}

function PackagesSection({
  tours,
  homeContent,
}: {
  tours: any[];
  homeContent: HomeContent;
}) {
  const title =
    !homeContent.featured.title.trim() || /wangchuk/i.test(homeContent.featured.title)
      ? 'Holiday tour packages in Bhutan'
      : homeContent.featured.title;

  return (
    <section className="wash-paper py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <Folio index="04" label={homeContent.featured.eyebrow} />
              <h2 className="font-accent text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight">
                {title}
              </h2>
              <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-muted-foreground">
                {homeContent.featured.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
              {DEFAULT_TOUR_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/tours?category=${cat.slug}`}
                  className="text-foreground/70 underline-offset-4 hover:text-primary hover:underline"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {tours.length > 0 ? (
          <TourCards tours={tours} featured />
        ) : (
          <p className="py-12 text-muted-foreground">Packages will appear here once published.</p>
        )}

        {tours.length > 0 ? (
          <ScrollReveal className="mt-10">
            <Link
              href="/tours"
              className="text-[13px] font-medium tracking-[0.04em] underline-offset-4 hover:text-primary hover:underline"
            >
              View all trips
            </Link>
          </ScrollReveal>
        ) : null}
      </div>
    </section>
  );
}

function HomeSections({
  layout,
  featuredTours,
  heroSlides,
  testimonials,
  homeContent,
  journalPosts,
}: {
  layout: LayoutId;
  featuredTours: any[];
  heroSlides: any[];
  testimonials: { name: string; location: string; text: string; rating: number; image: string }[];
  homeContent: HomeContent;
  journalPosts: BlogPost[];
}) {
  const hero = <HeroSlideshow slides={heroSlides} autoPlay interval={6000} variant={layout} />;
  const partners = <PartnersMarquee />;
  const aboutBhutan = <AboutBhutanSection content={homeContent.aboutBhutan} />;
  const destinations = <DestinationPortraits />;
  const packages = <PackagesSection tours={featuredTours} homeContent={homeContent} />;
  const pillars = (
    <section className="wash-dusk py-16 md:py-24">
      <div className="container">
        <DifferentiatorsSection content={homeContent.differentiators} />
      </div>
    </section>
  );
  const quotes = testimonials.length > 0 ? <TestimonialsSection testimonials={testimonials} /> : null;
  const faq = <QuickAnswersSection content={homeContent.quickAnswers} />;
  const journal = <JournalTeasers posts={journalPosts} content={homeContent.journal} />;
  const cta = <CTASection chapter="09" />;

  return (
    <>
      {hero}
      {partners}
      {aboutBhutan}
      {layout === 'club' ? null : destinations}
      {packages}
      {pillars}
      {quotes}
      {faq}
      {journal}
      {cta}
    </>
  );
}

export default async function HomePage() {
  const [featuredTours, heroSlides, dbTestimonials, homeContent, appearance, journalPosts] =
    await Promise.all([
      getFeaturedTours(5),
      getActiveHeroSlides(),
      getFeaturedTestimonials(),
      getHomePageContent(),
      getAppearance(),
      getPublishedBlogPosts(3),
    ]);

  const testimonials =
    dbTestimonials.length > 0
      ? dbTestimonials.map((t) => ({
          name: t.name,
          location: t.location,
          text: t.text,
          rating: t.rating,
          image: t.image_url || '',
        }))
      : DEFAULT_FEATURED_TESTIMONIALS;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeContent.quickAnswers.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div className="wash-paper flex min-h-screen flex-col safe-bottom-padding lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Navigation />
      <div id="main-content" tabIndex={-1}>
        <HomeSections
          layout={appearance.layout}
          featuredTours={featuredTours}
          heroSlides={heroSlides}
          testimonials={testimonials}
          homeContent={homeContent}
          journalPosts={journalPosts}
        />
      </div>
      <Footer />
    </div>
  );
}
