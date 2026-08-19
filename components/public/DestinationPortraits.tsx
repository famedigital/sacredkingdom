import Link from 'next/link';
import { DESTINATIONS } from '@/lib/content/destinations';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Folio } from '@/components/public/Folio';

const FEATURED_SLUGS = ['paro', 'punakha', 'haa'] as const;

export function DestinationPortraits({ limit = 3 }: { limit?: number }) {
  const places = FEATURED_SLUGS.map((slug) => DESTINATIONS.find((d) => d.slug === slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .slice(0, limit);
  const [lead, ...rest] = places;
  if (!lead) return null;

  return (
    <section className="wash-dusk py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="mb-10 flex items-end justify-between gap-4 md:mb-12">
            <div>
              <Folio index="03" label="Destinations" />
              <h2 className="font-accent text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight">
                Three stills from the road
              </h2>
            </div>
            <Link
              href="/experience"
              className="hidden text-[13px] font-medium tracking-[0.04em] underline-offset-4 hover:text-primary hover:underline md:inline"
            >
              All destinations
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-1 md:h-[min(72vh,40rem)] md:grid-cols-2 md:grid-rows-2">
          <Link
            href={`/experience/${lead.slug}`}
            className="group relative aspect-[4/5] overflow-hidden bg-muted md:row-span-2 md:aspect-auto md:h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lead.image}
              alt={lead.name}
              className="luxury-photo absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#E8D5A3] uppercase">
                01 · {lead.name}
              </p>
            </div>
          </Link>
          {rest.map((dest, i) => (
            <Link
              key={dest.slug}
              href={`/experience/${dest.slug}`}
              className="group relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto md:h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dest.image}
                alt={dest.name}
                className="luxury-photo absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-[#E8D5A3] uppercase">
                  {String(i + 2).padStart(2, '0')} · {dest.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
