'use client';

import { useEffect, useState } from 'react';
import {
  CONTACT_INFO_DEFAULTS,
  isLegacyCloneValue,
  mergeContactContent,
  whatsappToHref,
} from '@/lib/content/contact';

function mailtoHref(email?: string | null): string {
  const raw = String(email || '').trim();
  const addr =
    raw && !isLegacyCloneValue(raw) ? raw : CONTACT_INFO_DEFAULTS.email;
  return `mailto:${addr}`;
}

/** WhatsApp + email actions from CRM Contact settings. */
export function useContactActions(): { whatsappHref: string; mailtoHref: string } {
  const [links, setLinks] = useState({
    whatsappHref: whatsappToHref(CONTACT_INFO_DEFAULTS.whatsapp),
    mailtoHref: mailtoHref(CONTACT_INFO_DEFAULTS.email),
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/content?type=contact', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const merged = mergeContactContent(data.content);
        setLinks({
          whatsappHref: whatsappToHref(merged.contactInfo?.whatsapp),
          mailtoHref: mailtoHref(merged.contactInfo?.email),
        });
      })
      .catch(() => {
        /* keep default */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return links;
}

/**
 * WhatsApp chat link from Admin → Settings → General → WhatsApp Number.
 */
export function useWhatsAppHref(): string {
  return useContactActions().whatsappHref;
}
