import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { PageMasthead } from '@/components/public/PageMasthead';
import { CTASection } from '@/components/public/CTASection';
import { parseLegalBody, type LegalPageContent } from '@/lib/content/legal';

export function LegalPageView({
  content,
  company,
}: {
  content: LegalPageContent;
  company: string;
}) {
  const lastUpdated =
    content.lastUpdated?.trim() ||
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="wash-paper flex min-h-screen flex-col">
      <Navigation forceSolid />

      <main className="flex-1 pt-16">
        <PageMasthead
          index="01"
          label="Legal"
          title={content.title}
          dek={`Last updated ${lastUpdated}`}
        />

        <section className="wash-paper py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl space-y-12">
              {content.sections.map((section, index) => {
                const blocks = parseLegalBody(section.body, company);
                return (
                  <div key={`${section.title}-${index}`}>
                    <h2 className="font-accent mb-4 text-2xl font-medium tracking-tight">{section.title}</h2>
                    <div className="space-y-3">
                      {blocks.map((block, bi) =>
                        block.type === 'ul' ? (
                          <ul key={bi} className="space-y-2 text-muted-foreground">
                            {block.items.map((item, ii) => (
                              <li key={ii} className="flex gap-2">
                                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p key={bi} className="leading-relaxed text-foreground/80">
                            {block.text}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <CTASection chapter="02" />
      </main>

      <Footer />
    </div>
  );
}
