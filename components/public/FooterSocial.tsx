'use client';

import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import Link from 'next/link';
import {
  isLegacyCloneValue,
  mergeContactContent,
  whatsappToHref,
} from '@/lib/content/contact';
import { SOCIAL_DEFAULTS } from '@/lib/content/social';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TripadvisorIcon,
  TwitterIcon,
  WhatsAppIcon,
} from '@/components/icons/social';
import { cn } from '@/lib/utils';

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>;

type SocialLink = {
  name: string;
  href: string | null;
  icon: SocialIcon;
};

function normalizeUrl(url?: string | null): string | null {
  const raw = String(url || '').trim();
  if (!raw || raw === '#' || isLegacyCloneValue(raw)) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, '')}`;
}

export function FooterSocial() {
  const [links, setLinks] = useState<SocialLink[]>([
    { name: 'Facebook', href: null, icon: FacebookIcon },
    { name: 'Twitter', href: null, icon: TwitterIcon },
    { name: 'Instagram', href: null, icon: InstagramIcon },
    { name: 'WhatsApp', href: whatsappToHref(), icon: WhatsAppIcon },
    { name: 'Tripadvisor', href: SOCIAL_DEFAULTS.tripadvisor, icon: TripadvisorIcon },
  ]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [contactRes, seoRes] = await Promise.all([
          fetch('/api/content?type=contact', { cache: 'no-store' }),
          fetch('/api/social', { cache: 'no-store' }),
        ]);

        const contactJson = contactRes.ok ? await contactRes.json() : null;
        const seoJson = seoRes.ok ? await seoRes.json() : null;
        const merged = mergeContactContent(contactJson?.content);
        const social = merged.socialMedia || {};

        const facebook =
          normalizeUrl(social.facebook) || normalizeUrl(seoJson?.facebook);
        const twitter =
          normalizeUrl(social.twitter) || normalizeUrl(seoJson?.twitter);
        const instagram =
          normalizeUrl(social.instagram) || normalizeUrl(seoJson?.instagram);
        const linkedin =
          normalizeUrl(social.linkedin) || normalizeUrl(seoJson?.linkedin);
        const tripadvisor =
          normalizeUrl(social.tripadvisor) ||
          normalizeUrl(seoJson?.tripadvisor) ||
          SOCIAL_DEFAULTS.tripadvisor;
        const whatsapp = whatsappToHref(merged.contactInfo.whatsapp);

        if (cancelled) return;

        const next: SocialLink[] = [
          { name: 'Facebook', href: facebook, icon: FacebookIcon },
          { name: 'Twitter', href: twitter, icon: TwitterIcon },
          { name: 'Instagram', href: instagram, icon: InstagramIcon },
          { name: 'WhatsApp', href: whatsapp, icon: WhatsAppIcon },
          { name: 'Tripadvisor', href: tripadvisor, icon: TripadvisorIcon },
        ];
        if (linkedin) next.push({ name: 'LinkedIn', href: linkedin, icon: LinkedInIcon });
        setLinks(next);
      } catch {
        /* keep defaults */
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-row flex-wrap items-center gap-3">
      {links.map((social) => {
        const Icon = social.icon;
        const className = cn(
          'inline-flex size-10 items-center justify-center',
          'transition-opacity hover:opacity-80 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-secondary',
          !social.href && 'cursor-default opacity-90'
        );

        if (!social.href) {
          return (
            <span
              key={social.name}
              aria-label={`${social.name} (profile not published yet)`}
              title={`${social.name} — add the profile URL in Contact settings`}
              className={className}
            >
              <Icon className="size-7 shrink-0" />
            </span>
          );
        }

        return (
          <Link
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.name}
            title={social.name}
            className={className}
          >
            <Icon className="size-7 shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
