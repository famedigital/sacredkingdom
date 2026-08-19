'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  LogIn,
  Menu,
  Map,
  ChevronRight,
  ChevronDown,
  Ellipsis,
  Users,
  BookOpen,
  Mail,
  Landmark,
  Mountain,
  Sparkles,
  Trees,
  MapPin,
  CircleHelp,
  Plane,
  type LucideIcon,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from '@/components/icons/social';
import { useContactActions } from '@/hooks/use-whatsapp-link';
import { NavBrandLockup } from '@/components/BrandLogo';
import { PublicMegaMenu } from '@/components/public/PublicMegaMenu';
import { useCompanyBrand } from '@/hooks/use-company-brand';
import { DESTINATIONS } from '@/lib/content/destinations';
import { DEFAULT_TOUR_CATEGORIES, normalizeCategoryKey } from '@/lib/tour-category';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

type TourCategory = { name: string; slug: string };

const fallbackCategories: TourCategory[] = DEFAULT_TOUR_CATEGORIES.map((c) => ({
  name: c.name,
  slug: c.slug,
}));

export function Navigation({ forceSolid: _forceSolid = false }: { forceSolid?: boolean }) {
  const pathname = usePathname();
  const { whatsappHref, mailtoHref } = useContactActions();
  const brand = useCompanyBrand();
  const mobileNav = brand.mobileNav;
  const isTopMobile = mobileNav.style === 'top';

  const logoHeight = brand.logo.height;
  const mobileLogoHeight = Math.max(mobileNav.logoHeight, 64);

  const [tourCategories, setTourCategories] = useState<TourCategory[]>(fallbackCategories);
  const [mobileToursOpen, setMobileToursOpen] = useState(false);
  const [mobileExperienceOpen, setMobileExperienceOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/tour-categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories?.length) setTourCategories(data.categories);
      })
      .catch(() => setTourCategories(fallbackCategories));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.mobileNav = mobileNav.style;
    return () => {
      delete document.documentElement.dataset.mobileNav;
    };
  }, [mobileNav.style]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileToursOpen(false);
    setMobileExperienceOpen(false);
  }, [pathname]);

  const isToursActive = pathname === '/tours' || pathname.startsWith('/tours');
  const isExperienceActive = pathname === '/experience' || pathname.startsWith('/experience');
  const isLoginActive = pathname.startsWith('/admin');
  const isMoreActive =
    mobileMenuOpen ||
    pathname === '/about' ||
    pathname.startsWith('/journal') ||
    pathname.startsWith('/blog') ||
    pathname === '/contact' ||
    pathname === '/faq' ||
    pathname.startsWith('/travel-info') ||
    pathname === '/policy';

  const closeMobileOverlays = () => {
    setMobileMenuOpen(false);
    setMobileToursOpen(false);
    setMobileExperienceOpen(false);
  };

  const desktopLink = (active?: boolean) =>
    cn(
      'rounded-full px-3 py-0 text-[11px] leading-none font-medium uppercase tracking-[0.16em] transition-colors',
      active
        ? 'bg-white/35 text-primary'
        : 'text-foreground/80 hover:bg-white/35 hover:text-foreground'
    );

  const megaTrigger = cn(
    desktopLink(false),
    'inline-flex h-8 items-center gap-1 bg-transparent px-3 py-0 hover:bg-white/20 focus:bg-white/20 data-open:bg-white/30 data-popup-open:bg-white/30 data-open:hover:bg-white/30 data-popup-open:hover:bg-white/30 data-open:focus:bg-white/30'
  );

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-[100] hidden overflow-visible lg:block">
        <nav aria-label="Primary" className="relative h-16 overflow-visible">
          <div
            aria-hidden
            className="nav-paper pointer-events-none absolute inset-0"
          />

          <Link
            href="/"
            className="absolute top-1/2 left-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${brand.name} home`}
          >
            <NavBrandLockup markHeight={Math.max(Math.min(logoHeight, 88), 72)} priority />
          </Link>

          <div className="container relative flex h-16 items-center justify-between gap-4">
            <div className="flex h-16 min-w-0 flex-1 items-center justify-start pr-[min(14rem,24vw)]">
              <PublicMegaMenu
                tourCategories={tourCategories}
                triggerClassName={megaTrigger}
                linkClassName={desktopLink()}
                align="start"
              />
            </div>
            <div className="flex h-16 min-w-0 flex-1 items-center justify-end gap-2 pl-[min(14rem,24vw)]">
              <PublicMegaMenu
                tourCategories={tourCategories}
                triggerClassName={megaTrigger}
                linkClassName={desktopLink()}
                align="end"
              />
              <div className="flex h-8 shrink-0 items-center gap-1.5 pl-1">
                <Link
                  href="/admin/login"
                  aria-label="Admin login"
                  title="Login"
                  className={cn(
                    'inline-flex size-8 items-center justify-center rounded-full leading-none transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-white/40 text-primary'
                      : 'text-foreground/70 hover:bg-white/35 hover:text-foreground'
                  )}
                >
                  <LogIn className="size-4" strokeWidth={1.75} />
                </Link>
                <a
                  href={mailtoHref}
                  aria-label="Email us"
                  title="Email us"
                  className="inline-flex size-8 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-white/35 hover:text-foreground"
                >
                  <Mail className="size-4" strokeWidth={1.75} />
                </a>
                <Link
                  href="/contact#contact-form"
                  className="metal-gold inline-flex h-8 items-center justify-center rounded-full px-4 text-[11px] leading-none font-medium tracking-[0.16em] text-primary-foreground uppercase transition-colors"
                >
                  Plan your Trip
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {isTopMobile ? (
          <header className="fixed inset-x-0 top-0 z-[100] overflow-visible lg:hidden">
            <nav aria-label="Primary" className="relative h-14 overflow-visible">
              <div
                aria-hidden
                className="nav-paper pointer-events-none absolute inset-0"
              />
              <div className="container relative flex h-14 items-center justify-between gap-3">
                <Link
                  href="/"
                  className="relative z-[70] flex min-w-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`${brand.name} home`}
                >
                  <NavBrandLockup
                    markHeight={Math.max(Math.min(mobileLogoHeight, 64), 52)}
                    onDark={false}
                    priority
                  />
                </Link>
                <button
                  type="button"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileMenuOpen(true)}
                  className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background/95 text-foreground transition-colors hover:bg-muted"
                >
                  <Menu className="size-5" />
                </button>
              </div>
            </nav>
          </header>
      ) : (
        <>
          {mobileToursOpen ? (
            <button
              type="button"
              aria-label="Dismiss trips menu"
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
              onClick={() => setMobileToursOpen(false)}
            />
          ) : null}

          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] lg:hidden">
            <div className="pointer-events-auto mx-auto flex w-full max-w-md flex-col gap-2">
              {mobileToursOpen ? (
                <div
                  id="mobile-trips-sheet"
                  className="ios-tabbar rounded-[22px]"
                >
                  <ul className="divide-y divide-black/[0.06] p-1.5">
                    <li>
                      <Link
                        href="/tours"
                        onClick={() => setMobileToursOpen(false)}
                        className="flex h-11 items-center justify-between rounded-[16px] px-3.5 text-[15px] font-medium text-foreground [-webkit-tap-highlight-color:transparent] active:bg-black/[0.04]"
                      >
                        All Trips
                        <ChevronRight className="size-4 text-[#C4BFB4]" strokeWidth={1.75} />
                      </Link>
                    </li>
                    {tourCategories.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/tours?category=${cat.slug}`}
                          onClick={() => setMobileToursOpen(false)}
                          className="flex h-11 items-center justify-between rounded-[16px] px-3.5 text-[15px] font-medium text-foreground [-webkit-tap-highlight-color:transparent] active:bg-black/[0.04]"
                        >
                          {cat.name}
                          <ChevronRight className="size-4 text-[#C4BFB4]" strokeWidth={1.75} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <nav aria-label="Mobile" className="ios-tabbar rounded-[28px]">
                <div className="flex px-1 py-1">
                  <MobileTab
                    href="/"
                    label="Home"
                    icon={Home}
                    active={pathname === '/'}
                    onClick={() => setMobileToursOpen(false)}
                  />
                  <MobileTab
                    label="Trips"
                    icon={Compass}
                    active={isToursActive || mobileToursOpen}
                    expanded={mobileToursOpen}
                    controls={mobileToursOpen ? 'mobile-trips-sheet' : undefined}
                    onClick={() => setMobileToursOpen((v) => !v)}
                  />
                  <MobileTab
                    href="/experience"
                    label="Experience"
                    icon={Map}
                    active={isExperienceActive}
                    onClick={() => setMobileToursOpen(false)}
                  />
                  <MobileTab
                    label="More"
                    icon={Ellipsis}
                    active={isMoreActive}
                    expanded={mobileMenuOpen}
                    controls="mobile-menu"
                    onClick={() => {
                      setMobileToursOpen(false);
                      setMobileMenuOpen(true);
                    }}
                  />
                  <MobileTab
                    href={whatsappHref}
                    label="WhatsApp"
                    icon={WhatsAppIcon}
                    branded
                    external
                    onClick={() => setMobileToursOpen(false)}
                  />
                </div>
              </nav>
            </div>
          </div>
        </>
      )}

      <Drawer
        open={mobileMenuOpen}
        onOpenChange={(open) => {
          setMobileMenuOpen(open);
          if (!open) {
            setMobileToursOpen(false);
            setMobileExperienceOpen(false);
          }
        }}
        showSwipeHandle
      >
        <DrawerContent
          id="mobile-menu"
          className="rounded-t-[28px] border-[#C4A35A]/40 bg-[#FFFCF7] text-[#0A0A0A] shadow-[0_-16px_48px_rgba(10,10,10,0.22)] [--drawer-content-max-height:min(90dvh,44rem)]"
        >
          <DrawerHeader className="border-b border-[#C4A35A]/25 bg-[#FFFCF7] px-5 pb-4 text-left">
            <NavBrandLockup markHeight={48} onDark={false} />
            <DrawerTitle className="sr-only">Menu</DrawerTitle>
            <DrawerDescription className="sr-only">
              Sacred Kingdom Travel site navigation
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 space-y-5 overflow-y-auto py-5">
            <MenuGroup label="Explore">
              <MobileLink
                href="/"
                icon={Home}
                tone="gold"
                active={pathname === '/'}
                onClick={closeMobileOverlays}
              >
                Home
              </MobileLink>
              <MobileAccordion
                label="Trips"
                icon={Compass}
                tone="brass"
                open={mobileToursOpen}
                onToggle={() => setMobileToursOpen((v) => !v)}
                active={isToursActive}
              >
                <MobileLink
                  href="/tours"
                  icon={Compass}
                  tone="gold"
                  nested
                  onClick={closeMobileOverlays}
                >
                  All Trips
                </MobileLink>
                {tourCategories.map((cat) => {
                  const glyph = categoryGlyph(cat.slug);
                  return (
                    <MobileLink
                      key={cat.slug}
                      href={`/tours?category=${cat.slug}`}
                      icon={glyph.icon}
                      tone={glyph.tone}
                      nested
                      onClick={closeMobileOverlays}
                    >
                      {cat.name}
                    </MobileLink>
                  );
                })}
              </MobileAccordion>
              <MobileAccordion
                label="Experience"
                icon={Map}
                tone="forest"
                open={mobileExperienceOpen}
                onToggle={() => setMobileExperienceOpen((v) => !v)}
                active={isExperienceActive}
              >
                <MobileLink
                  href="/experience"
                  icon={Map}
                  tone="forest"
                  nested
                  onClick={closeMobileOverlays}
                >
                  All destinations
                </MobileLink>
                {DESTINATIONS.map((dest) => (
                  <MobileLink
                    key={dest.slug}
                    href={`/experience/${dest.slug}`}
                    icon={MapPin}
                    tone="ink"
                    nested
                    onClick={closeMobileOverlays}
                  >
                    {dest.name}
                  </MobileLink>
                ))}
              </MobileAccordion>
            </MenuGroup>

            <MenuGroup label="Company">
              <MobileLink
                href="/about"
                icon={Users}
                tone="ink"
                active={pathname === '/about'}
                onClick={closeMobileOverlays}
              >
                About Us
              </MobileLink>
              <MobileLink
                href="/journal"
                icon={BookOpen}
                tone="champagne"
                active={pathname.startsWith('/journal') || pathname.startsWith('/blog')}
                onClick={closeMobileOverlays}
              >
                Journal
              </MobileLink>
              <MobileLink
                href="/contact"
                icon={Mail}
                tone="gold"
                active={pathname === '/contact'}
                onClick={closeMobileOverlays}
              >
                Contact Us
              </MobileLink>
              <MobileLink
                href={mailtoHref}
                icon={Mail}
                tone="mail"
                onClick={closeMobileOverlays}
              >
                Email us
              </MobileLink>
            </MenuGroup>

            <MenuGroup label="Travel">
              <MobileLink
                href="/faq"
                icon={CircleHelp}
                tone="brass"
                active={pathname === '/faq'}
                onClick={closeMobileOverlays}
              >
                FAQ
              </MobileLink>
              <MobileLink
                href="/travel-info"
                icon={Plane}
                tone="forest"
                active={pathname.startsWith('/travel-info')}
                onClick={closeMobileOverlays}
              >
                Travel info
              </MobileLink>
              <MobileLink
                href="/admin/login"
                icon={LogIn}
                tone="ink"
                active={isLoginActive}
                onClick={closeMobileOverlays}
              >
                Login
              </MobileLink>
            </MenuGroup>
          </div>

          <DrawerFooter className="border-t border-[#C4A35A]/25 bg-[#FFFCF7] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileOverlays}
                className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white"
              >
                <WhatsAppIcon className="size-5 fill-white" />
                WhatsApp
              </a>
              <a
                href={mailtoHref}
                onClick={closeMobileOverlays}
                className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1A73E8] text-sm font-semibold text-white"
              >
                <Mail className="size-4" strokeWidth={2.3} />
                Email us
              </a>
            </div>
            <Link
              href="/contact#contact-form"
              onClick={closeMobileOverlays}
              className={cn(buttonVariants(), 'h-11 w-full rounded-full')}
            >
              Plan your Trip
            </Link>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

type MenuTone = 'gold' | 'ink' | 'champagne' | 'brass' | 'forest' | 'mail';

const MENU_TONES: Record<MenuTone, string> = {
  gold: 'bg-[#D4AF37] text-[#0A0A0A]',
  ink: 'bg-[#0A0A0A] text-[#F0D060]',
  champagne: 'bg-[#F0D060] text-[#0A0A0A]',
  brass: 'bg-[#C17F17] text-white',
  forest: 'bg-[#0F7B4A] text-white',
  mail: 'bg-[#1A73E8] text-white',
};

function categoryGlyph(slug: string): { icon: LucideIcon; tone: MenuTone } {
  const key = normalizeCategoryKey(slug);
  if (key === 'festivals') return { icon: Sparkles, tone: 'champagne' };
  if (key === 'trekking') return { icon: Mountain, tone: 'forest' };
  if (key === 'wildlife') return { icon: Trees, tone: 'brass' };
  if (key === 'cultural') return { icon: Landmark, tone: 'gold' };
  return { icon: Compass, tone: 'gold' };
}

function MenuGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="px-4">
      <p className="mb-2 px-1 text-[11px] font-semibold tracking-[0.2em] text-[#C17F17] uppercase">
        {label}
      </p>
      <div className="divide-y divide-black/[0.07] overflow-hidden rounded-[18px] bg-[#FFFCF7] shadow-[0_1px_0_rgba(255,255,255,0.8),0_8px_24px_rgba(10,10,10,0.06)] ring-1 ring-black/[0.07]">
        {children}
      </div>
    </section>
  );
}

function MenuGlyph({
  icon: Icon,
  tone,
  nested,
}: {
  icon: LucideIcon;
  tone: MenuTone;
  nested?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[9px]',
        nested ? 'size-7 rounded-[8px]' : 'size-9',
        MENU_TONES[tone]
      )}
    >
      <Icon
        aria-hidden
        className={nested ? 'size-4' : 'size-[18px]'}
        strokeWidth={2.4}
      />
    </span>
  );
}

function MobileTab({
  label,
  icon: Icon,
  active = false,
  href,
  external,
  branded,
  onClick,
  controls,
  expanded,
}: {
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  active?: boolean;
  href?: string;
  external?: boolean;
  branded?: boolean;
  onClick?: () => void;
  controls?: string;
  expanded?: boolean;
}) {
  const className = cn(
    'flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-[3px] rounded-[20px] px-1',
    'text-[10px] leading-none font-semibold tracking-[-0.02em]',
    'select-none transition-colors duration-200 ease-out',
    '[-webkit-tap-highlight-color:transparent] active:opacity-70',
    branded ? 'text-[#128C7E]' : active ? 'text-[#C9A227]' : 'text-[#1A1712]'
  );

  const body = (
    <>
      <Icon
        aria-hidden
        className={cn('size-[22px]', !branded && active && 'fill-[#C9A227]')}
        {...(!branded ? { strokeWidth: active ? 2.35 : 2.1 } : {})}
      />
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={className}
        aria-current={active && !external ? 'page' : undefined}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-expanded={expanded}
      aria-controls={controls}
    >
      {body}
    </button>
  );
}

function MobileLink({
  href,
  active,
  nested,
  onClick,
  children,
  icon,
  tone = 'gold',
}: {
  href: string;
  active?: boolean;
  nested?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: LucideIcon;
  tone?: MenuTone;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex min-h-[52px] items-center gap-3 px-3.5 text-[16px] font-medium text-[#0A0A0A]',
        '[-webkit-tap-highlight-color:transparent] active:bg-black/[0.04]',
        nested && 'min-h-11 bg-[#F7F1E4] text-[15px]',
        active && 'bg-[#C4A35A]/16'
      )}
    >
      {icon ? <MenuGlyph icon={icon} tone={tone} nested={nested} /> : null}
      <span className="min-w-0 flex-1 text-left">{children}</span>
      <ChevronRight className="size-4 shrink-0 text-[#C4A35A]" strokeWidth={2} />
    </Link>
  );
}

function MobileAccordion({
  label,
  open,
  onToggle,
  active,
  children,
  icon,
  tone = 'gold',
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  active?: boolean;
  children: React.ReactNode;
  icon?: LucideIcon;
  tone?: MenuTone;
}) {
  const panelId = `mobile-acc-${label.toLowerCase()}`;
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          'flex min-h-[52px] w-full items-center gap-3 px-3.5 text-left text-[16px] font-medium text-[#0A0A0A]',
          '[-webkit-tap-highlight-color:transparent] active:bg-black/[0.04]',
          (active || open) && 'bg-[#C4A35A]/16'
        )}
      >
        {icon ? <MenuGlyph icon={icon} tone={tone} /> : null}
        <span className="min-w-0 flex-1">{label}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-[#C4A35A] transition-transform duration-200',
            open && 'rotate-180'
          )}
          strokeWidth={2}
        />
      </button>
      {open ? (
        <div id={panelId} className="divide-y divide-black/[0.06] bg-[#F7F1E4]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
