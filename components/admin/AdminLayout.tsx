'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useRouter } from 'next/navigation';
import type { AdminUser } from '@/lib/auth/rbac';
import { Button } from '@/components/ui/button';
import { keepAdminSessionAlive } from '@/lib/auth/fetch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AdminTheme } from '@/components/admin/AdminTheme';

interface AdminLayoutProps {
  children: React.ReactNode;
  /** When true, main content area does not scroll — child manages its own panes. */
  lockScroll?: boolean;
}

const KEEPALIVE_MS = 10 * 60 * 1000; // refresh session every 10 minutes while browsing

export function AdminLayout({ children, lockScroll = false }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const redirectToLogin = useCallback(() => {
    router.push('/admin/login');
  }, [router]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setAuthError(null);
          return;
        }

        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'same-origin',
        });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setUser(refreshData.user);
          setAuthError(null);
          return;
        }

        setAuthError('Authentication failed. Please log in again.');
        setTimeout(redirectToLogin, 1500);
      } catch {
        setAuthError('Connection error. Please try again.');
        setTimeout(redirectToLogin, 2000);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [redirectToLogin]);

  // Keep session alive while the admin panel is open (prevents mid-edit logout)
  useEffect(() => {
    if (!user) return;

    const tick = () => {
      void keepAdminSessionAlive();
    };

    // Warm the session shortly after load, then on an interval + focus/visibility
    const warm = window.setTimeout(tick, 5_000);
    const interval = window.setInterval(tick, KEEPALIVE_MS);

    const onFocus = () => tick();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    const onExpired = () => {
      toast.error('Session expired. Please log in again to save your work.', {
        duration: 6000,
      });
      setTimeout(redirectToLogin, 1200);
    };
    window.addEventListener('admin-session-expired', onExpired);

    return () => {
      window.clearTimeout(warm);
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('admin-session-expired', onExpired);
    };
  }, [user, redirectToLogin]);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.role === 'admin' || (user.permissions?.includes(permission) ?? false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center wash-paper">
        <AdminTheme />
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center wash-paper p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6">
            <h2 className="mb-2 font-heading text-lg font-semibold text-destructive">Authentication Error</h2>
            <p className="text-sm text-destructive/80">{authError}</p>
          </div>
          <Button type="button" size="lg" onClick={redirectToLogin}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center wash-paper">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden wash-paper">
      <AdminTheme />
      <AdminSidebar
        user={user}
        hasPermission={hasPermission}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader
          user={user}
          onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
        />
        <main
          className={cn(
            'min-h-0 flex-1 overflow-x-hidden p-4 pb-20 md:p-6 md:pb-6',
            lockScroll ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
