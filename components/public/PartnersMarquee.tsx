import { PARTNER_LOGOS } from '@/lib/content/partners';
import { Marquee } from '@/components/ui/marquee';
import { cn } from '@/lib/utils';

export function PartnersMarquee() {
  return (
    <section
      aria-label="Affiliations"
      className="wash-dusk border-y border-primary/20"
    >
      <div className="flex min-h-14 items-center gap-3 py-2.5 md:gap-5 md:py-3">
        <p className="shrink-0 pl-4 text-[0.625rem] font-semibold tracking-[0.28em] text-primary uppercase md:pl-8 md:text-[0.6875rem] md:tracking-[0.32em]">
          Affiliated with
        </p>
        <Marquee
          pauseOnHover
          className="min-w-0 flex-1 p-0 [--duration:28s] [--gap:0.25rem] [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
        >
          {PARTNER_LOGOS.map((partner) => (
            <div
              key={partner.name}
              className="flex h-12 shrink-0 items-center justify-center px-5 md:px-7"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partner.src}
                alt={partner.fullName}
                className={cn(
                  'h-9 w-auto max-w-[6.25rem] object-contain md:h-10 md:max-w-[7rem]',
                  partner.ink && 'brightness-0 opacity-70'
                )}
              />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
