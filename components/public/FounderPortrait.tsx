import type { AboutTeamMember } from '@/lib/content/about';
import { Folio } from '@/components/public/Folio';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export function FounderPortrait({ member }: { member: AboutTeamMember }) {
  const quote = member.quote?.trim();

  return (
    <section id="team" className="wash-paper scroll-mt-24">
      <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="relative min-h-[62svh] overflow-hidden bg-muted lg:min-h-[88svh]">
          {member.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.image}
              alt={member.name}
              className="luxury-photo absolute inset-0 h-full w-full object-cover object-[center_42%]"
            />
          ) : null}
        </div>
        <div className="flex flex-col justify-center px-6 py-16 md:px-12 lg:px-16 lg:py-24">
          <ScrollReveal>
            <Folio index="05" label="Founder" />
            {quote ? (
              <blockquote className="font-accent max-w-[22ch] text-[clamp(1.7rem,3.2vw,2.8rem)] leading-[1.15] font-medium tracking-tight">
                “{quote}”
              </blockquote>
            ) : null}
            <p className="mt-8 text-[13px] font-medium tracking-[0.14em] uppercase">
              {member.name}
              {member.role ? (
                <span className="text-muted-foreground"> — {member.role}</span>
              ) : null}
            </p>
            {member.bio ? (
              <p className="mt-5 max-w-[46ch] whitespace-pre-line text-base leading-relaxed text-muted-foreground md:text-lg">
                {member.bio}
              </p>
            ) : null}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
