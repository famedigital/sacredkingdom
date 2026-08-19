import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Folio } from '@/components/public/Folio';
import type { HomeContent } from '@/lib/content/home';
import { HOME_DEFAULTS } from '@/lib/content/home';

export function DifferentiatorsSection({
  content,
}: {
  content?: HomeContent['differentiators'];
}) {
  const section = content || HOME_DEFAULTS.differentiators;
  const items = section.items.slice(0, 3);

  return (
    <>
      <ScrollReveal>
        <Folio index="05" label={section.eyebrow} />
        <h2 className="font-accent mb-12 max-w-[16ch] text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight md:mb-16">
          Local guides. Private days. The visa handled.
        </h2>
      </ScrollReveal>

      <div className="grid gap-10 md:grid-cols-3 md:gap-0">
        {items.map((item, index) => (
          <ScrollReveal
            key={`${item.title}-${index}`}
            direction="up"
            delay={index * 0.04}
            className={index > 0 ? 'md:border-l md:border-primary/25 md:pl-10' : ''}
          >
            <p className="font-accent text-4xl leading-none text-[color-mix(in_srgb,var(--primary)_55%,#0a0a0a)]">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="font-heading mt-4 text-lg font-medium">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
              {item.description}
            </p>
          </ScrollReveal>
        ))}
      </div>
    </>
  );
}
