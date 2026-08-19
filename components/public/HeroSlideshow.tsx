'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompanyBrand } from '@/hooks/use-company-brand';
import { focalToObjectPosition } from '@/lib/image-focal';
import type { LayoutId } from '@/lib/appearance';
import { buttonVariants } from '@/components/ui/button';

interface HeroSlide {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image_public_id: string;
  image_url: string;
  mobile_image_public_id?: string | null;
  mobile_image_url?: string | null;
  image_focal_x?: number | null;
  image_focal_y?: number | null;
  cta_text?: string | null;
  cta_link?: string | null;
  cta_style?: string | null;
  title_color?: string | null;
  slide_order?: number | null;
  is_active?: boolean | null;
}

interface HeroSlideshowProps {
  slides?: HeroSlide[];
  autoPlay?: boolean;
  interval?: number;
  variant?: LayoutId;
}

function clampDek(text: string, maxChars = 90) {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  const slice = trimmed.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(' ');
  return `${slice.slice(0, lastSpace > 50 ? lastSpace : maxChars).trim()}…`;
}

export function HeroSlideshow({
  slides = [],
  autoPlay = true,
  interval = 7000,
  variant = 'magazine',
}: HeroSlideshowProps) {
  const brand = useCompanyBrand();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [allowPan, setAllowPan] = useState(false);

  const activeSlides = slides.length > 0 ? slides : [];
  const statement = activeSlides[currentIndex] ?? activeSlides[0];
  const isClub = variant === 'club';

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setTimeout(() => setAllowPan(true), 1200);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  useEffect(() => {
    if (!autoPlay || activeSlides.length <= 1 || reduceMotion) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, activeSlides.length, reduceMotion]);

  const caption = statement?.title?.trim() || '';
  const rawDek = statement?.subtitle || statement?.description || '';
  const tagline = rawDek
    ? clampDek(rawDek)
    : `${brand.name} plans private journeys through Bhutan.`;
  const folio = String(currentIndex + 1).padStart(2, '0');
  const of = String(Math.max(activeSlides.length, 1)).padStart(2, '0');

  return (
    <section id="site-hero" data-nav-tone="light" className="relative min-h-svh overflow-hidden bg-secondary">
      {activeSlides.map((slide, index) => (
        <img
          key={slide.id}
          src={index === 0 ? slide.image_url : slide.mobile_image_url || slide.image_url}
          alt={slide.title || 'Bhutan'}
          className={cn(
            'luxury-photo absolute inset-0 h-full w-full object-cover transition-opacity duration-1000',
            !reduceMotion && 'top-[-4%] left-[-4%] h-[108%] w-[108%] max-w-none',
            index === currentIndex ? 'opacity-100' : 'opacity-0',
            allowPan &&
              !reduceMotion &&
              index === currentIndex &&
              (index % 2 === 0 ? 'hero-pan' : 'hero-pan-alt')
          )}
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          style={{
            objectPosition: focalToObjectPosition(slide.image_focal_x, slide.image_focal_y),
          }}
        />
      ))}

      <div className="relative z-10 flex min-h-svh flex-col justify-end lg:block">
        <div
          className={cn(
            'flex w-full flex-col justify-center px-6 py-10 md:px-10 lg:absolute lg:top-16 lg:bottom-0 lg:left-0 lg:w-[30%] lg:px-12 lg:py-12',
            isClub ? 'wash-night' : 'wash-paper'
          )}
        >
          <p
            className={cn(
              'mb-5 text-[11px] font-semibold tracking-[0.28em] uppercase',
              isClub
                ? 'text-primary'
                : 'text-[color-mix(in_srgb,var(--primary)_55%,#0a0a0a)]'
            )}
          >
            {folio} / {of}
          </p>
          <h1
            className={cn(
              'font-accent text-[clamp(2.2rem,4.2vw,3.75rem)] leading-[1.06] font-medium tracking-tight',
              isClub ? 'text-secondary-foreground' : 'text-foreground'
            )}
          >
            Experience Bhutan like never before
          </h1>
          {tagline ? (
            <p
              className={cn(
                'mt-5 max-w-[32ch] text-base leading-relaxed md:text-lg',
                isClub ? 'text-secondary-foreground/70' : 'text-muted-foreground'
              )}
            >
              {tagline}
            </p>
          ) : null}
          {caption ? (
            <p
              className={cn(
                'mt-6 max-w-[32ch] text-[13px] leading-snug',
                isClub ? 'text-secondary-foreground/55' : 'text-foreground/55'
              )}
            >
              {caption}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 lg:hidden">
            <Link
              href="/contact#contact-form"
              className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-full px-7')}
            >
              Plan your Trip
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/tours"
              className="text-[13px] font-medium tracking-[0.04em] text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              View trips
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute right-6 bottom-6 z-20 hidden items-center gap-3 lg:flex xl:right-10 xl:bottom-8">
        <Link
          href="/contact#contact-form"
          className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-full px-7')}
        >
          Plan your Trip
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/tours"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/55 bg-black/25 px-5 text-[13px] font-medium tracking-[0.04em] text-white backdrop-blur-sm transition-colors hover:bg-black/40"
        >
          <Compass className="size-4" />
          View trips
        </Link>
      </div>

      {activeSlides.length > 1 ? (
        <div className="absolute top-28 left-6 z-20 flex gap-1.5 lg:top-auto lg:bottom-8 lg:left-[32%]">
          {activeSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-1 rounded-none transition-all',
                index === currentIndex ? 'w-7 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
