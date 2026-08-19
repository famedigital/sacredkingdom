import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Folio } from '@/components/public/Folio';
import type { HomeContent } from '@/lib/content/home';

export function QuickAnswersSection({ content }: { content: HomeContent['quickAnswers'] }) {
  if (!content.items?.length) return null;

  return (
    <section className="wash-dusk border-y border-primary/20 py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <Folio index="07" label="FAQ" />
          <h2 className="font-accent mb-10 max-w-[16ch] text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight md:mb-14">
            {content.title}
          </h2>
        </ScrollReveal>
        <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-16">
          {content.items.map((faq, index) => (
            <div key={`${faq.q}-${index}`} className="border-t border-primary/20 py-6">
              <h3 className="font-heading text-sm font-medium md:text-base">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
