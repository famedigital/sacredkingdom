'use client';

import { useEffect, useState } from 'react';
import { Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function AdminPwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

    if (isStandalone) {
      setInstalled(true);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/admin/sw.js', { scope: '/admin/' })
        .then(() => setReady(true))
        .catch((err) => console.warn('Admin PWA SW registration failed:', err));
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (installed) {
    return (
      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <Check className="size-3.5 text-primary" />
        App installed — open from your home screen
      </p>
    );
  }

  if (!deferredPrompt) {
    return (
      <p className="mt-4 text-center text-xs text-muted-foreground">
        {ready
          ? 'Install tip: use browser menu → Add to Home Screen'
          : 'Preparing installable admin app…'}
      </p>
    );
  }

  return (
    <div className="mt-4 flex justify-center">
      <Button type="button" variant="outline" size="sm" onClick={handleInstall} className="gap-2">
        <Download className="size-4" />
        Install Admin App
      </Button>
    </div>
  );
}
