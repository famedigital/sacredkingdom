'use client';

import { useEffect, useState } from 'react';
import {
  CONTACT_INFO_DEFAULTS,
  mergeContactContent,
  whatsappToHref,
} from '@/lib/content/contact';

/**
 * WhatsApp chat link from Admin → Settings → General → WhatsApp Number.
 */
export function useWhatsAppHref(): string {
  const [href, setHref] = useState(() =>
    whatsappToHref(CONTACT_INFO_DEFAULTS.whatsapp)
  );

  useEffect(() => {
    let cancelled = false;
    fetch('/api/content?type=contact', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const merged = mergeContactContent(data.content);
        setHref(whatsappToHref(merged.contactInfo?.whatsapp));
      })
      .catch(() => {
        /* keep default */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return href;
}
