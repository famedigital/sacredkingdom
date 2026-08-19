'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, User, Settings, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { authFetch, authPatch } from '@/lib/auth/fetch';

interface AdminHeaderProps {
  onMobileMenuOpen: () => void;
  user?: {
    name: string;
    email: string;
    avatar_url?: string;
    role: string;
  };
}

type NotificationItem = {
  id: string;
  type: 'booking' | 'inquiry';
  title: string;
  message: string;
  href: string;
  time: string;
  unread: boolean;
};

const THEME_STORAGE_KEY = 'admin-theme';

export function AdminHeader({ onMobileMenuOpen, user }: AdminHeaderProps) {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const loadNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setLoadingNotifications(true);
      const res = await authFetch('/api/admin/notifications');
      if (res.status === 401) {
        setNotifications([]);
        setUnreadCount(0);
        return false;
      }
      if (!res.ok) return true;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.counts?.unread || 0);
      return true;
    } catch {
      return true;
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark =
      stored === 'dark' ||
      (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', prefersDark);
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      const ok = await loadNotifications();
      if (!ok && !cancelled) {
        if (intervalId) clearInterval(intervalId);
        router.push('/admin/login');
      }
    };

    void tick();
    intervalId = setInterval(tick, 60_000);
    const onRefresh = () => {
      void tick();
    };
    window.addEventListener('admin-badges-refresh', onRefresh);
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('admin-badges-refresh', onRefresh);
    };
  }, [loadNotifications, router]);

  useEffect(() => {
    if (notificationsOpen) void loadNotifications();
  }, [notificationsOpen, loadNotifications]);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    setIsDarkMode(next);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const refreshBadges = () => {
    window.dispatchEvent(new Event('admin-badges-refresh'));
  };

  const markAllRead = async () => {
    try {
      await authPatch('/api/admin/notifications', { action: 'mark_inquiries_read' });
      await loadNotifications();
      refreshBadges();
    } catch {
      // ignore
    }
  };

  const openNotification = async (n: NotificationItem) => {
    setNotificationsOpen(false);

    // Navigate immediately so the click always feels responsive
    router.push(n.href);

    try {
      if (n.type === 'inquiry') {
        await authPatch('/api/admin/notifications', {
          action: 'mark_inquiry_read',
          id: n.id,
        });
      }
      await loadNotifications();
      refreshBadges();
    } catch {
      // navigation already happened
    }
  };

  return (
    <header className="wash-paper sticky top-0 z-30 border-b border-border">
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:h-16 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            onClick={onMobileMenuOpen}
            className="lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>

          <div className="relative hidden w-full max-w-md md:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tours, bookings, customers…"
              className="h-9 bg-muted/60 pl-9"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger
              aria-label="Notifications"
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative')}
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 sm:w-96">
              <DropdownMenuGroup>
                <div className="border-b border-border p-4">
                  <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
                    Notifications
                  </DropdownMenuLabel>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount > 0
                      ? `${unreadCount} pending booking${unreadCount === 1 ? '' : 's'} / new inquir${unreadCount === 1 ? 'y' : 'ies'}`
                      : "You're all caught up"}
                  </p>
                </div>
              </DropdownMenuGroup>
              <div className="max-h-80 overflow-y-auto">
                {loadingNotifications && notifications.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">Loading…</p>
                ) : notifications.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No new notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void openNotification(notification)}
                      className={cn(
                        'flex w-full flex-col items-start border-b border-border/60 p-4 text-left last:border-0 hover:bg-muted/60',
                        notification.unread && 'bg-primary/5'
                      )}
                    >
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
                    </button>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <div className="flex items-center gap-2 bg-muted/40 p-3">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto flex-1 p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      void markAllRead();
                    }}
                  >
                    Mark inquiries read
                  </Button>
                  <Link
                    href="/admin/bookings"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex-1 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    View bookings
                  </Link>
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ variant: 'ghost' }), 'h-auto gap-2.5 px-1.5 py-1.5')}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="size-8 rounded-full object-cover" />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-primary">
                  <User className="size-4 text-primary-foreground" />
                </div>
              )}
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium leading-none">{user?.name || 'Admin User'}</p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">{user?.role || 'Admin'}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="border-b border-border px-2 py-2">
                <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email || 'admin@sacredkingdom.travel'}
                </p>
              </div>
              <DropdownMenuItem onClick={() => router.push('/admin/settings/users')}>
                <User className="size-4 text-muted-foreground" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/settings/general')}>
                <Settings className="size-4 text-muted-foreground" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="size-4" />
                {isLoggingOut ? 'Logging out…' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
