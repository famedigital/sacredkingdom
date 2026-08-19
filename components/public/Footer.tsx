'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { FooterContact } from '@/components/public/FooterContact';
import { FooterSocial } from '@/components/public/FooterSocial';
import { useCompanyBrand } from '@/hooks/use-company-brand';
import { BrandLogo } from '@/components/BrandLogo';

import { DEFAULT_TOUR_CATEGORIES } from '@/lib/tour-category';

type FooterLink = { name: string; href: string };
type TourCategory = { name: string; slug: string };

const footerLinks = {
  explore: [
    { name: 'Trips', href: '/tours' },
    { name: 'Experience', href: '/experience' },
    { name: 'Journal', href: '/journal' },
    { name: 'Contact Us', href: '/contact' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/about#story' },
    { name: 'Team', href: '/about#team' },
    { name: 'Inquire', href: '/contact' },
  ],
  support: [
    { name: 'FAQ', href: '/faq' },
    { name: 'Travel Info', href: '/bhutan' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
  ],
};

export function Footer() {
  const brand = useCompanyBrand();
  const [tourLinks, setTourLinks] = useState<FooterLink[]>(
    DEFAULT_TOUR_CATEGORIES.map((c) => ({
      name: c.name,
      href: `/tours?category=${c.slug}`,
    }))
  );

  useEffect(() => {
    let cancelled = false;
    fetch('/api/tour-categories')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const categories = (data.categories || []) as TourCategory[];
        if (!categories.length) return;
        setTourLinks(
          categories.map((c) => ({
            name: c.name,
            href: `/tours?category=${c.slug}`,
          }))
        );
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const columns: [string, FooterLink[]][] = [
    ['Explore', footerLinks.explore],
    ['Trips', tourLinks],
    ['Company', footerLinks.company],
    ['Support', footerLinks.support],
  ];

  return (
    <footer className="wash-night border-t border-primary/25 text-secondary-foreground">
      <div className="container py-14 md:py-16">
        <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <Link href="/" className="group mb-5 flex items-center gap-3">
              <BrandLogo height={48} className="h-12" />
              <div className="flex flex-col">
                <span className="font-heading text-lg font-semibold">{brand.name}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-primary">{brand.tagline}</span>
              </div>
            </Link>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-secondary-foreground/70">
              Locally owned Bhutan journeys — authentic experiences, expert guides, and tailor-made
              itineraries from Thimphu. Licensed with the Tourism Council of Bhutan.
            </p>

            <FooterSocial />
          </div>

          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {columns.map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
                  {title}
                </h3>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-secondary-foreground/65 transition-colors hover:text-primary"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <a
            href="https://innovates.bt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-secondary-foreground/40 transition-colors hover:text-primary"
          >
            Designed by innovates.bt
          </a>
        </div>

        <Separator className="my-8 bg-primary/20" />

        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs md:text-sm">
              <p className="text-secondary-foreground/45">
              © {new Date().getFullYear()} Sacred Kingdom.Travel. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <FooterContact />
            </div>
          </div>

          <div className="flex gap-6 text-xs md:text-sm">
            <Link
              href="/privacy"
              className="text-secondary-foreground/55 transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-secondary-foreground/55 transition-colors hover:text-primary"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
