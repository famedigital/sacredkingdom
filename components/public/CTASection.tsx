'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Folio } from '@/components/public/Folio';
import { EmailUsButton } from '@/components/public/EmailUsButton';

export function CTASection({ chapter }: { chapter?: string }) {
  return (
    <section className="wash-night text-secondary-foreground">
      <div className="container py-20 md:py-28">
        {chapter ? <Folio index={chapter} label="Bespoke" onDark /> : null}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-accent max-w-[18ch] text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.06] font-medium tracking-tight">
            Looking for a personalized Bhutan itinerary?
          </h2>
          <div className="max-w-md">
            <p className="mb-6 text-base leading-relaxed text-secondary-foreground/70 md:text-lg">
              Cultural journey, luxury stay, trek, or a fully custom route — write from Thimphu and we will shape the days.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/contact#contact-form"
                className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-full px-7')}
              >
                Request custom itinerary
                <ArrowRight className="size-4" />
              </Link>
              <EmailUsButton onDark />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
