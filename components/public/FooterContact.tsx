'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import {
  CONTACT_INFO_DEFAULTS,
  mergeContactContent,
  phoneToTelHref,
  type ContactInfo,
} from '@/lib/content/contact';

/**
 * Email + phone from admin Contact Settings (`content_pages` type=contact).
 * Client fetch so Footer can still be used from client pages (tours, FAQ).
 */
export function FooterContact() {
  const [contact, setContact] = useState<ContactInfo>(CONTACT_INFO_DEFAULTS);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/content?type=contact')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.content) return;
        const merged = mergeContactContent(data.content);
        setContact(merged.contactInfo);
      })
      .catch(() => {
        // Keep defaults on failure
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <a
        href={`mailto:${contact.email}`}
        className="flex items-center gap-2 text-secondary-foreground/60 transition-colors hover:text-primary"
      >
        <Mail className="h-4 w-4" />
        {contact.email}
      </a>
      <a
        href={phoneToTelHref(contact.phone)}
        className="flex items-center gap-2 text-secondary-foreground/60 transition-colors hover:text-primary"
      >
        <Phone className="h-4 w-4" />
        {contact.phone}
      </a>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-secondary-foreground/60 transition-colors hover:text-primary"
      >
        <MapPin className="h-4 w-4" />
        Thimphu, Bhutan
      </a>
    </>
  );
}
