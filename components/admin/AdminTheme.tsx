'use client';

import { useEffect } from 'react';

/** Keeps the CMS on gold-ivory luxury tokens while the public site uses palettes. */
export function AdminTheme() {
  useEffect(() => {
    document.documentElement.dataset.admin = 'true';
    return () => {
      delete document.documentElement.dataset.admin;
    };
  }, []);
  return null;
}
