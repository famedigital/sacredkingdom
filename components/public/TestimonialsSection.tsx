import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Folio } from '@/components/public/Folio';
import {
  TRIPADVISOR_LISTING_URL,
  TRIPADVISOR_RATING_LABEL,
} from '@/lib/content/testimonials';

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  image: string;
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const [lead, ...rest] = testimonials;
  if (!lead) return null;

  return (
    <section className="wash-paper py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <Folio index="06" label="Guests" />
            <a
              href={TRIPADVISOR_LISTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium tracking-[0.04em] text-primary underline-offset-4 hover:underline"
            >
              Rated {TRIPADVISOR_RATING_LABEL} — read reviews
            </a>
          </div>
        </ScrollReveal>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:gap-20 lg:items-end">
          <ScrollReveal>
            <blockquote className="font-accent text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.2] font-medium tracking-tight">
              “{lead.text}”
            </blockquote>
            <p className="mt-6 text-[13px] font-medium tracking-[0.12em] uppercase">
              {lead.name}
              {lead.location ? (
                <span className="text-muted-foreground"> — {lead.location}</span>
              ) : null}
            </p>
          </ScrollReveal>
          {rest.length > 0 ? (
            <div className="space-y-10">
              {rest.map((item) => (
                <ScrollReveal key={`${item.name}-${item.text.slice(0, 24)}`} delay={0.06}>
                  <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                    “{item.text}”
                  </p>
                  <p className="mt-4 text-[13px] font-medium tracking-[0.12em] uppercase">
                    {item.name}
                    {item.location ? (
                      <span className="text-muted-foreground"> — {item.location}</span>
                    ) : null}
                  </p>
                </ScrollReveal>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
