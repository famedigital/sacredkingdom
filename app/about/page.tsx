import Link from 'next/link';
import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { TeamMembers } from '@/components/public/TeamMembers';
import { FounderPortrait } from '@/components/public/FounderPortrait';
import { isFounderMember } from '@/lib/content/about';
import { Folio } from '@/components/public/Folio';
import { CTASection } from '@/components/public/CTASection';
import { getAboutPageContent } from '@/lib/content/get-about';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary-url';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import type { Metadata } from 'next';
import { getCompanyName } from '@/lib/brand';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompanyName();
  return {
    title: `About Us | ${company}`,
    description:
      'Learn about our story, values, milestones, and the Bhutanese team behind authentic Himalayan journeys.',
  };
}

function optimizeImageUrl(url: string, width: number, height: number) {
  return optimizeCloudinaryUrl(url, { width, height, crop: 'fill' });
}

export default async function AboutPage() {
  const content = await getAboutPageContent();
  const { hero, story, values, statistics, timeline, team } = content;
  const founder = team.find((member) => isFounderMember(member));
  const rest = founder ? team.filter((member) => member !== founder) : team;

  return (
    <div className="wash-paper flex min-h-screen flex-col">
      <Navigation forceSolid />

      <main className="safe-bottom-padding flex-1 pt-16 pb-4 lg:pb-0">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={optimizeImageUrl(hero.backgroundImage, 1920, 900)}
              alt={hero.title}
              className="luxury-photo h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/35" />
          </div>

          <div className="relative container py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <Folio index="01" label="About us" onDark />
              <h1 className="font-accent mb-5 text-5xl font-medium tracking-tight text-[#E8D5A3] md:text-6xl">
                {hero.title}
              </h1>
              {hero.subtitle && (
                <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed whitespace-pre-line text-white/85 md:text-lg">
                  {hero.subtitle}
                </p>
              )}
              {hero.cta?.text && (
                <Link
                  href={hero.cta.link || '/tours'}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'inline-flex gap-2 rounded-full px-7 text-[11px] uppercase tracking-[0.18em]'
                  )}
                >
                  {hero.cta.text}
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Story */}
        <section id="story" className="wash-paper scroll-mt-24 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <Folio index="02" label="Our story" />
              <h2 className="font-accent mb-5 text-2xl font-medium md:text-3xl">{story.title}</h2>
              <p className="text-left text-base leading-relaxed whitespace-pre-line text-muted-foreground md:text-center md:text-lg">
                {story.content}
              </p>
              {story.founded && (
                <p className="mt-6 inline-flex rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-foreground">
                  House since {story.founded} · TCB licensed 2022
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Values */}
        {values.length > 0 && (
          <section className="wash-dusk border-y border-primary/20 py-16 md:py-24">
            <div className="container">
              <Folio index="03" label="Values" />
              <h2 className="font-accent mb-10 max-w-[16ch] text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight">
                What we hold
              </h2>
              <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
                {values.map((value, index) => (
                  <div
                    key={`${value.title}-${index}`}
                    className={cn(
                      'border-t border-primary/20 py-8',
                      index % 2 === 1 && 'sm:border-l sm:pl-8',
                      index >= 2 && 'lg:border-l lg:pl-8'
                    )}
                  >
                    <h3 className="font-heading text-sm font-medium sm:text-base">{value.title}</h3>
                    {value.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Statistics */}
        {statistics.length > 0 && (
          <section className="wash-paper py-14 md:py-20">
            <div className="container grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {statistics.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="text-center">
                  <span className="font-accent text-3xl font-medium text-primary md:text-5xl">
                    {stat.number}
                  </span>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <section className="wash-dusk border-y border-primary/20 py-16 md:py-24">
            <div className="container">
              <Folio index="04" label="Milestones" />
              <h2 className="font-accent mb-10 text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight">
                Along the way
              </h2>
              <div className="relative mx-auto max-w-2xl">
                <div className="absolute top-3 bottom-3 left-[1.35rem] w-px bg-primary/30 md:left-6" />
                <div className="space-y-8">
                  {timeline.map((event, index) => (
                    <div key={`${event.year}-${index}`} className="relative flex gap-4 md:gap-5">
                      <div className="relative z-10 flex min-w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-card px-2 py-2 text-center text-[10px] font-semibold text-primary md:min-w-14 md:text-xs">
                        {event.year}
                      </div>
                      <div className="flex-1 border-t border-primary/20 pt-2">
                        <h3 className="font-heading mb-1 font-medium">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {founder ? <FounderPortrait member={founder} /> : null}

        {rest.length > 0 && (
          <section
            id={founder ? 'studio' : 'team'}
            className="wash-paper scroll-mt-24 py-16 md:py-24"
          >
            <div className="container">
              <Folio index={founder ? '06' : '05'} label="Studio" />
              <h2 className="font-accent mb-10 text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight">
                The people on the ground
              </h2>
              <TeamMembers members={rest} />
            </div>
          </section>
        )}

        <CTASection chapter={rest.length > 0 ? '07' : '06'} />
      </main>

      <Footer />
    </div>
  );
}
