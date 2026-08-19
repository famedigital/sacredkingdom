'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { cn } from '@/lib/utils';
import type { HomeEditorial } from '@/lib/content/home';

export function ManifestoSection({ content }: { content: HomeEditorial }) {
  return (
    <section id="company" className="bg-background py-20 md:py-28">
      <div className="container">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mb-5">{content.eyebrow}</p>
            <div className="gold-rule-center mb-8" />
            <h2 className="font-accent text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
              {content.title}
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
              {content.body}
            </p>
            <Link
              href="/about"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'mt-10 rounded-full px-8 text-[11px] uppercase tracking-[0.18em]'
              )}
            >
              About Us
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
