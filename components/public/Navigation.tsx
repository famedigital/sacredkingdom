'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Users,
  MessageCircle,
  LogIn,
  Menu,
  Map,
  Minus,
  Plus,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWhatsAppHref } from '@/hooks/use-whatsapp-link';
import { NavBrandLockup } from '@/components/BrandLogo';
import { PublicMegaMenu } from '@/components/public/PublicMegaMenu';
import { useCompanyBrand } from '@/hooks/use-company-brand';
import { DESTINATIONS } from '@/lib/content/destinations';
import { DEFAULT_TOUR_CATEGORIES } from '@/lib/tour-category';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type TourCategory = { name: string; slug: string };

const fallbackCategories: TourCategory[] = DEFAULT_TOUR_CATEGORIES.map((c) => ({
  name: c.name,
  slug: c.slug,
}));

export function Navigation({ forceSolid: _forceSolid = false }: { forceSolid?: boolean }) {
  const pathname = usePathname();
  const whatsappHref = useWhatsAppHref();
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

          <div className="container relative grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex h-16 min-w-0 items-center justify-start">
              <PublicMegaMenu
                tourCategories={tourCategories}
                triggerClassName={megaTrigger}
                linkClassName={desktopLink()}
                align="start"
              />
            </div>

            <Link
              href="/"
              className="relative z-[70] flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${brand.name} home`}
            >
              <NavBrandLockup markHeight={Math.max(Math.min(logoHeight, 88), 72)} priority />
            </Link>

            <div className="flex h-16 min-w-0 items-center justify-end gap-2">
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
        <>
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

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent
              id="mobile-menu"
              side="right"
              className="w-full gap-0 bg-transparent p-0 sm:max-w-md"
            >
              <SheetHeader className="border-b border-border px-5 py-4">
                <NavBrandLockup markHeight={52} />
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Sacred Kingdom Travel site navigation
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-3 py-3">
                <MobileLink href="/" active={pathname === '/'} onClick={() => setMobileMenuOpen(false)}>
                  Home
                </MobileLink>
                <MobileLink href="/about" active={pathname === '/about'} onClick={() => setMobileMenuOpen(false)}>
                  About Us
                </MobileLink>
                <MobileAccordion
                  label="Trips"
                  open={mobileToursOpen}
                  onToggle={() => setMobileToursOpen((v) => !v)}
                  active={isToursActive}
                >
                  <MobileLink href="/tours" nested onClick={() => setMobileMenuOpen(false)}>
                    All Trips
                  </MobileLink>
                  {tourCategories.map((cat) => (
                    <MobileLink
                      key={cat.slug}
                      href={`/tours?category=${cat.slug}`}
                      nested
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {cat.name}
                    </MobileLink>
                  ))}
                </MobileAccordion>
                <MobileAccordion
                  label="Experience"
                  open={mobileExperienceOpen}
                  onToggle={() => setMobileExperienceOpen((v) => !v)}
                  active={isExperienceActive}
                >
                  <MobileLink href="/experience" nested onClick={() => setMobileMenuOpen(false)}>
                    All destinations
                  </MobileLink>
                  {DESTINATIONS.map((dest) => (
                    <MobileLink
                      key={dest.slug}
                      href={`/experience/${dest.slug}`}
                      nested
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {dest.name}
                    </MobileLink>
                  ))}
                </MobileAccordion>
                <MobileLink
                  href="/journal"
                  active={pathname.startsWith('/journal') || pathname.startsWith('/blog')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Journal
                </MobileLink>
                <MobileLink
                  href="/contact"
                  active={pathname === '/contact'}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Us
                </MobileLink>
              </div>
              <div className="mt-auto space-y-2 border-t border-border p-4">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/30 text-sm font-medium text-primary"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
                <Link
                  href="/contact#contact-form"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(buttonVariants(), 'h-11 w-full rounded-full')}
                >
                  Plan your Trip
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <div className="safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-50 lg:hidden">
          <div aria-hidden className="nav-paper-bottom pointer-events-none absolute inset-0" />
          <div className="relative">
          {mobileToursOpen && (
            <div className="grid grid-cols-2 gap-2 border-b border-border bg-card px-3 py-2.5">
              <Link
                href="/tours"
                onClick={() => setMobileToursOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-md bg-muted text-sm font-medium text-foreground"
              >
                All Trips
              </Link>
              {tourCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/tours?category=${cat.slug}`}
                  onClick={() => setMobileToursOpen(false)}
                  className="flex min-h-11 items-center justify-center rounded-md bg-muted px-2 text-center text-sm font-medium text-foreground"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
          <div className="mx-auto flex max-w-lg flex-row">
            <Link href="/" className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-2.5">
              <Home className={cn('mb-0.5 size-5', pathname === '/' ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-[10px] font-semibold', pathname === '/' ? 'text-primary' : 'text-muted-foreground')}>
                Home
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileToursOpen((v) => !v)}
              className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-2.5"
            >
              <Compass
                className={cn(
                  'mb-0.5 size-5',
                  isToursActive || mobileToursOpen ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold',
                  isToursActive || mobileToursOpen ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Trips
              </span>
            </button>
            <Link
              href="/experience"
              className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-2.5"
            >
              <Map
                className={cn('mb-0.5 size-5', isExperienceActive ? 'text-primary' : 'text-muted-foreground')}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold',
                  isExperienceActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Experience
              </span>
            </Link>
            <Link href="/about" className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-2.5">
              <Users className={cn('mb-0.5 size-5', pathname === '/about' ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-[10px] font-semibold', pathname === '/about' ? 'text-primary' : 'text-muted-foreground')}>
                About
              </span>
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-2.5"
            >
              <MessageCircle className="mb-0.5 size-5 text-primary" />
              <span className="text-[10px] font-semibold text-primary">WhatsApp</span>
            </a>
          </div>
          </div>
        </div>
      )}
    </>
  );
}

function MobileLink({
  href,
  active,
  nested,
  onClick,
  children,
}: {
  href: string;
  active?: boolean;
  nested?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex min-h-12 items-center rounded-xl px-4 text-base font-medium transition-colors',
        nested && 'min-h-10 pl-4 text-sm text-foreground/80',
        active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
      )}
    >
      {children}
    </Link>
  );
}

function MobileAccordion({
  label,
  open,
  onToggle,
  active,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  active?: boolean;
  children: React.ReactNode;
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
          'flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-left text-base font-medium',
          active || open ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
        )}
      >
        {label}
        {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
      </button>
      {open ? (
        <div id={panelId} className="mb-1 ml-3 space-y-0.5 border-l border-border pl-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
