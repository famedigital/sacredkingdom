'use client';

import { useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TeamMemberAvatar } from '@/components/public/TeamMemberAvatar';
import { cn } from '@/lib/utils';
import type { AboutTeamMember } from '@/lib/content/about';

type TeamMembersProps = {
  members: AboutTeamMember[];
};

/**
 * Mobile: horizontal snap — exactly one team member per screen.
 * sm+: multi-column grid.
 */
export function TeamMembers({ members }: TeamMembersProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const slide = el.firstElementChild as HTMLElement | null;
      const width = slide?.offsetWidth || el.clientWidth;
      if (width <= 0) return;
      setActive(Math.min(Math.max(Math.round(el.scrollLeft / width), 0), members.length - 1));
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [members.length]);

  const scrollTo = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const slide = el.children[index] as HTMLElement | undefined;
    if (slide) {
      el.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
      return;
    }
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  };

  if (!members.length) return null;

  return (
    <div>
      <div
        ref={scrollerRef}
        className={cn(
          // Mobile: one member fills the screen width
          'flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain',
          '-mx-4 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // Desktop grid
          'sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-3'
        )}
      >
        {members.map((member, index) => (
          <div
            key={`${member.name}-${index}`}
            className={cn(
              // Critical: basis/min-width lock so each slide = one screen
              'box-border w-full min-w-full shrink-0 basis-full snap-start px-4',
              'sm:min-w-0 sm:w-auto sm:basis-auto sm:shrink sm:snap-align-none sm:px-0'
            )}
          >
            <Card className="h-full min-h-[22rem] border-border shadow-none sm:min-h-0">
              <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center sm:p-6">
                <div className="relative mx-auto mb-5 size-32 overflow-hidden rounded-full bg-muted sm:mb-4 sm:size-28">
                  {member.image ? (
                    <TeamMemberAvatar
                      src={member.image}
                      alt={member.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Users className="size-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="font-heading mb-1 text-lg font-semibold sm:text-lg">
                  {member.name}
                </h3>
                {member.role ? (
                  <p className="mb-3 text-sm font-medium text-primary">{member.role}</p>
                ) : null}
                {member.bio ? (
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {member.bio}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {members.length > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-2 sm:hidden">
          {members.map((member, index) => (
            <button
              key={`dot-${member.name}-${index}`}
              type="button"
              aria-label={`Show ${member.name}`}
              aria-current={active === index}
              onClick={() => scrollTo(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                active === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
