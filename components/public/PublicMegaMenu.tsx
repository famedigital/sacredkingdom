'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  Compass,
  Landmark,
  Mountain,
  PawPrint,
  Sparkles,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { DESTINATIONS } from '@/lib/content/destinations';
import { cn } from '@/lib/utils';

const megaRowClass =
  'rounded-lg border border-transparent hover:border-primary/55 hover:bg-primary/20 focus:border-primary/55 focus:bg-primary/20 data-active:border-primary/55 data-active:bg-primary/20 data-active:hover:bg-primary/25';

const TRIP_BLURBS: Record<string, { icon: typeof Compass; description: string }> = {
  cultural: { icon: Landmark, description: 'Dzongs, temples, and living Bhutanese culture' },
  festivals: { icon: Sparkles, description: 'Tshechus, masked dances, and festival dates' },
  trekking: { icon: Mountain, description: 'Himalayan trails, camps, and high passes' },
  wildlife: { icon: PawPrint, description: 'Parks, birds, and the national animal' },
};

type TourCategory = { name: string; slug: string };

export function PublicMegaMenu({
  tourCategories,
  triggerClassName,
  linkClassName,
  align = 'start',
}: {
  tourCategories: TourCategory[];
  triggerClassName?: string;
  linkClassName?: string;
  align?: 'start' | 'end';
}) {
  const pathname = usePathname();

  return (
    <NavigationMenu
      key={pathname}
      align={align}
      className="flex h-8 w-max max-w-none flex-none items-center justify-start"
      delay={90}
      closeDelay={180}
    >
      <NavigationMenuList className="gap-0">
        {align === 'start' ? (
          <>
            <TextLink href="/" className={linkClassName} active={pathname === '/'}>
              Home
            </TextLink>
            <TextLink href="/about" className={linkClassName} active={pathname === '/about'}>
              <span className="hidden xl:inline">About Us</span>
              <span className="xl:hidden">About</span>
            </TextLink>
            <TripsMega
              categories={tourCategories}
              triggerClassName={cn(triggerClassName, pathname.startsWith('/tours') && 'text-primary')}
            />
          </>
        ) : (
          <>
            <ExperienceMega
              triggerClassName={cn(
                triggerClassName,
                pathname.startsWith('/experience') && 'text-primary'
              )}
            />
            <TextLink
              href="/journal"
              className={linkClassName}
              active={pathname.startsWith('/journal') || pathname.startsWith('/blog')}
            >
              Journal
            </TextLink>
            <TextLink href="/contact" className={linkClassName} active={pathname === '/contact'}>
              <span className="hidden xl:inline">Contact Us</span>
              <span className="xl:hidden">Contact</span>
            </TextLink>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function TextLink({
  href,
  className,
  active,
  children,
}: {
  href: string;
  className?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        href={href}
        active={active}
        closeOnClick={false}
        className={cn(
          'bg-transparent hover:bg-transparent focus:bg-transparent data-active:bg-transparent',
          className,
          active && 'text-primary'
        )}
      >
        {children}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

function TripsMega({
  categories,
  triggerClassName,
}: {
  categories: TourCategory[];
  triggerClassName?: string;
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className={triggerClassName}>Trips</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="w-[min(34rem,calc(100vw-2rem))] p-4 md:p-5">
          <div className="grid gap-5 md:grid-cols-[1.15fr_13rem]">
            <div>
              <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Holiday packages
              </p>
              <div className="grid gap-0.5">
                <NavigationMenuLink
                  href="/tours"
                  className={cn('flex flex-row items-center gap-3 px-2.5 py-2', megaRowClass)}
                >
                  <Compass className="size-4 shrink-0 text-primary" />
                  <div>
                    <span className="block text-sm font-medium">All Trips</span>
                    <span className="block text-xs text-muted-foreground">
                      Cultural, festival, trekking, wildlife
                    </span>
                  </div>
                </NavigationMenuLink>
                {categories.map((cat) => {
                  const meta = TRIP_BLURBS[cat.slug] || { icon: Compass, description: cat.name };
                  const Icon = meta.icon;
                  return (
                    <NavigationMenuLink
                      key={cat.slug}
                      href={`/tours?category=${cat.slug}`}
                      className={cn('flex flex-row items-center gap-3 px-2.5 py-2', megaRowClass)}
                    >
                      <Icon className="size-4 shrink-0 text-primary" />
                      <div>
                        <span className="block text-sm font-medium">{cat.name}</span>
                        <span className="block text-xs text-muted-foreground">{meta.description}</span>
                      </div>
                    </NavigationMenuLink>
                  );
                })}
              </div>
            </div>

            <div className="wash-night flex flex-col justify-between rounded-xl p-4 text-secondary-foreground">
              <div>
                <p className="text-[10px] font-medium tracking-[0.18em] text-primary uppercase">Bespoke</p>
                <p className="font-accent mt-2 text-xl leading-snug">Shaped around you</p>
                <p className="mt-2 text-xs leading-relaxed text-secondary-foreground/70">
                  We plan the days from Thimphu.
                </p>
              </div>
              <Link
                href="/contact#contact-form"
                className={cn(buttonVariants({ size: 'sm' }), 'mt-4 w-full rounded-full')}
              >
                Plan your Trip
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function ExperienceMega({ triggerClassName }: { triggerClassName?: string }) {
  const featured = DESTINATIONS.find((d) => d.slug === 'paro') || DESTINATIONS[0];

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className={triggerClassName}>Experience</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="w-[min(32rem,calc(100vw-2rem))] p-4 md:p-5">
          <div className="grid gap-5 md:grid-cols-[1fr_11rem]">
            <div>
              <p className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Destinations
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {DESTINATIONS.map((dest) => (
                  <NavigationMenuLink
                    key={dest.slug}
                    href={`/experience/${dest.slug}`}
                    className={cn('rounded-lg px-2 py-1.5 text-sm font-medium', megaRowClass)}
                  >
                    {dest.name}
                  </NavigationMenuLink>
                ))}
              </div>
              <NavigationMenuLink
                href="/experience"
                className={cn('mt-3 px-2 py-1.5 text-sm font-medium text-primary', megaRowClass)}
              >
                All destinations
                <ArrowRight className="size-3.5" />
              </NavigationMenuLink>
            </div>

            {featured ? (
              <NavigationMenuLink
                href={`/experience/${featured.slug}`}
                className="group/feat relative overflow-hidden rounded-xl p-0"
              >
                <span className="relative block aspect-[3/4] min-h-[12.5rem]">
                  <img
                    src={featured.image}
                    alt=""
                    className="luxury-photo size-full object-cover transition-transform duration-500 group-hover/feat:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-3">
                    <span className="block text-[10px] tracking-[0.16em] text-primary uppercase">
                      Featured
                    </span>
                    <span className="font-accent text-xl text-white">{featured.name}</span>
                  </span>
                </span>
              </NavigationMenuLink>
            ) : null}
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
