'use client';

import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import type { HomeEditorial } from '@/lib/content/home';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function EditorialSection({
  content,
  cta,
  reverse = false,
  id,
}: {
  content: HomeEditorial;
  cta?: { href: string; label: string };
  reverse?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className="wash-paper py-20 md:py-28">
      <div className="container">
        <div
          className={cn(
            'grid items-center gap-12 lg:grid-cols-2 lg:gap-20',
            reverse && 'lg:[&>*:first-child]:order-2'
          )}
        >
          <ScrollReveal>
            <p className="eyebrow mb-5">{content.eyebrow}</p>
            <h2 className="font-accent text-4xl font-medium tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {content.title}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {content.body}
            </p>
            {cta ? (
              <Link
                href={cta.href}
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'mt-8 rounded-full px-7 text-[11px] uppercase tracking-[0.18em]'
                )}
              >
                {cta.label}
              </Link>
            ) : null}
          </ScrollReveal>
          {content.image ? (
            <ScrollReveal delay={0.08}>
              <div className="group overflow-hidden rounded-2xl border border-primary/25">
                <img
                  src={content.image}
                  alt={content.title}
                  className="luxury-photo aspect-[4/3] w-full object-cover"
                />
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal delay={0.08}>
              <div className="aspect-[4/3] rounded-2xl bg-secondary" />
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
