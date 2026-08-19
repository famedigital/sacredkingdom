import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Folio } from '@/components/public/Folio';
import type { HomeEditorial } from '@/lib/content/home';

const FALLBACK_TITLE = 'A kingdom still taught as a living place';

export function AboutBhutanSection({ content }: { content: HomeEditorial }) {
  const bland = /best tourist/i.test(content.title);
  const title = bland || !content.title.trim() ? FALLBACK_TITLE : content.title;
  const image = content.image?.trim();

  return (
    <section id="kingdom" className="wash-paper">
      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="relative min-h-[58svh] overflow-hidden bg-muted lg:min-h-[78svh]">
          {image ? (
            <img
              src={image}
              alt={title}
              className="luxury-photo absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="flex flex-col justify-center px-6 py-16 md:px-12 lg:px-16 lg:py-24">
          <ScrollReveal>
            <Folio index="02" label={content.eyebrow || 'The kingdom'} />
            <h2 className="font-accent max-w-[14ch] text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.08] font-medium tracking-tight">
              {title}
            </h2>
            <p className="mt-6 max-w-[38ch] text-base leading-relaxed text-muted-foreground md:text-lg">
              {content.body}
            </p>
            <Link
              href="/experience"
              className="mt-8 inline-flex text-[13px] font-medium tracking-[0.04em] underline-offset-4 hover:text-primary hover:underline"
            >
              Explore destinations
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
