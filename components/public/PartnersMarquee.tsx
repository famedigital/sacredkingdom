import { PARTNER_LOGOS } from '@/lib/content/partners';
import { cn } from '@/lib/utils';

export function PartnersMarquee() {
  return (
    <section
      aria-label="Affiliations"
      className="wash-dusk border-y border-primary/20"
    >
      <div className="container py-8 md:py-10">
        <p className="mb-6 text-center text-[0.6875rem] font-semibold tracking-[0.32em] text-primary uppercase">
          Affiliated with
        </p>
        <ul className="flex flex-wrap items-center justify-center">
          {PARTNER_LOGOS.map((partner, index) => (
            <li
              key={partner.name}
              className={cn(
                'flex min-w-[7.5rem] flex-col items-center gap-2 px-5 py-1 md:px-7',
                index > 0 && 'md:border-l md:border-primary/25'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partner.src}
                alt={partner.name}
                className={cn(
                  'h-12 w-auto max-w-[7.5rem] object-contain',
                  partner.ink && 'brightness-0 opacity-70'
                )}
              />
              <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {partner.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
