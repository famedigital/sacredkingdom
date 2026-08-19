'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  FileText,
  Image,
  Settings,
  Users,
  BarChart3,
  Home,
  LogOut,
  X,
  ChevronDown,
  Images,
  Mail,
  Shield,
  HelpCircle,
  Search,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  Smartphone,
  Briefcase,
  Palette,
} from 'lucide-react';
import type { AdminUser } from '@/lib/auth/rbac';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCompanyBrand } from '@/hooks/use-company-brand';
import { authFetch } from '@/lib/auth/fetch';
import { BrandLogo } from '@/components/BrandLogo';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: NavItem[];
  badgeKey?: 'pendingBookings' | 'newInquiries';
}

interface AdminSidebarProps {
  user: AdminUser | null;
  hasPermission: (permission: string) => boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const navigationSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
      { id: 'docs', label: 'Docs & manual', icon: BookOpen, href: '/admin/docs' },
    ],
  },
  {
    title: 'Website content',
    items: [
      { id: 'hero', label: 'Hero slides', icon: Images, href: '/admin/hero' },
      { id: 'homepage', label: 'Homepage', icon: Home, href: '/admin/homepage' },
      { id: 'tours', label: 'Tours', icon: MapPin, href: '/admin/tours' },
      { id: 'blog', label: 'Blog', icon: FileText, href: '/admin/blog' },
      { id: 'media', label: 'Media library', icon: Image, href: '/admin/media' },
    ],
  },
  {
    title: 'Customers',
    items: [
      {
        id: 'bookings',
        label: 'Bookings',
        icon: Calendar,
        href: '/admin/bookings',
        badgeKey: 'pendingBookings',
      },
      {
        id: 'inquiries',
        label: 'Inquiries',
        icon: Mail,
        href: '/admin/inquiries',
        badgeKey: 'newInquiries',
      },
      { id: 'customers', label: 'Customers', icon: Users, href: '/admin/customers' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'ops-home', label: 'Clients', icon: Users, href: '/admin/operations' },
      { id: 'ops-rosters', label: 'Rosters', icon: Briefcase, href: '/admin/operations/rosters' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        children: [
          { id: 'appearance', label: 'Appearance', icon: Palette, href: '/admin/settings/appearance' },
          { id: 'general', label: 'Contact & general', icon: Settings, href: '/admin/settings/general' },
          { id: 'logo', label: 'Logo & position', icon: Image, href: '/admin/settings/logo' },
          { id: 'mobile-nav', label: 'Mobile menu', icon: Smartphone, href: '/admin/settings/mobile-nav' },
          { id: 'site', label: 'About page', icon: Home, href: '/admin/settings/site' },
          { id: 'privacy', label: 'Privacy Policy', icon: FileText, href: '/admin/settings/privacy' },
          { id: 'terms', label: 'Terms & Conditions', icon: FileText, href: '/admin/settings/terms' },
          { id: 'navigation', label: 'SEO', icon: Search, href: '/admin/settings/navigation' },
          { id: 'payments', label: 'FAQ', icon: HelpCircle, href: '/admin/settings/payments' },
          { id: 'users', label: 'Admin users', icon: Shield, href: '/admin/settings/users' },
        ],
      },
    ],
  },
];

export function AdminSidebar({
  user,
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const brand = useCompanyBrand();
  const [expandedItems, setExpandedItems] = useState<string[]>(['settings']);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [badges, setBadges] = useState({ pendingBookings: 0, newInquiries: 0 });

  const loadBadges = useCallback(async (): Promise<boolean> => {
    try {
      const res = await authFetch('/api/admin/notifications');
      if (res.status === 401) {
        setBadges({ pendingBookings: 0, newInquiries: 0 });
        return false;
      }
      if (!res.ok) return true;
      const data = await res.json();
      setBadges({
        pendingBookings: data.counts?.pendingBookings || 0,
        newInquiries: data.counts?.newInquiries || 0,
      });
      return true;
    } catch {
      return true;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      const ok = await loadBadges();
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
  }, [loadBadges, router]);

  useEffect(() => {
    if (pathname.startsWith('/admin/bookings') || pathname.startsWith('/admin/inquiries')) {
      loadBadges();
    }
  }, [pathname, loadBadges]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === href;
    if (href === '/admin/operations') {
      return pathname === href || pathname.startsWith('/admin/operations/clients');
    }
    if (href === '/admin/operations/rosters') {
      return pathname.startsWith('/admin/operations/rosters');
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      onMobileClose();
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const linkClass = (active: boolean) =>
    cn(
      'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors min-h-10',
      'px-3 py-2.5',
      isCollapsed && 'justify-center px-2',
      active
        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
        : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    );

  const childLinkClass = (active: boolean) =>
    cn(
      'flex items-center gap-3 rounded-md px-3 py-2 text-sm min-h-9 transition-colors',
      active
        ? 'bg-sidebar-primary/15 text-sidebar-primary font-medium'
        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
    );

  const renderBadge = (item: NavItem, active: boolean) => {
    if (!item.badgeKey) return null;
    const count = badges[item.badgeKey];
    if (!count) return null;
    return (
      <span
        className={cn(
          'ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
          active
            ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
            : 'bg-sidebar-primary text-sidebar-primary-foreground'
        )}
      >
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border wash-night text-sidebar-foreground',
          'transition-[width,transform] duration-200 ease-out',
          isCollapsed ? 'w-[4.5rem]' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-sidebar-border px-3',
            isCollapsed ? 'justify-center' : 'justify-between gap-2'
          )}
        >
          {!isCollapsed ? (
            <div className="flex min-w-0 items-center gap-2.5 px-1">
              <BrandLogo height={36} className="h-9 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">Admin</p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  {user?.name || brand.name}
                </p>
              </div>
            </div>
          ) : (
            <BrandLogo height={32} className="h-8" alt="Logo" />
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            onClick={onMobileClose}
            className="lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="hidden lg:inline-flex absolute -right-3 top-20 z-10 h-6 w-6 rounded-full shadow-sm"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
        </Button>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-5">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/55">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const hasChildren = !!item.children?.length;
                const isExpanded = expandedItems.includes(item.id);
                const childActive = item.children?.some((c) => c.href && isActive(c.href));
                const itemActive = item.href ? isActive(item.href) : !!childActive;
                const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

                if (hasChildren) {
                  return (
                    <div key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isCollapsed) onToggle();
                          toggleExpanded(item.id);
                        }}
                        className={cn(linkClass(!!childActive), 'w-full')}
                        title={item.label}
                      >
                        <Icon className="size-4 shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown
                              className={cn('h-4 w-4 opacity-60 transition-transform', isExpanded && 'rotate-180')}
                            />
                          </>
                        )}
                      </button>
                      {!isCollapsed && isExpanded && (
                        <div className="mt-0.5 ml-2 space-y-0.5 border-l border-sidebar-border pl-2">
                          {item.children!.map((child) => {
                            const ChildIcon = child.icon;
                            const active = !!child.href && isActive(child.href);
                            return (
                              <Link
                                key={child.id}
                                href={child.href || '#'}
                                onClick={onMobileClose}
                                className={childLinkClass(active)}
                              >
                                <ChildIcon className="size-4 shrink-0" />
                                <span>{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href || '#'}
                    onClick={onMobileClose}
                    className={cn(linkClass(itemActive), !isCollapsed && 'pr-2')}
                    title={badgeCount ? `${item.label} (${badgeCount} pending)` : item.label}
                  >
                    <span className="relative shrink-0">
                      <Icon className="size-4" />
                      {isCollapsed && badgeCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground">
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </span>
                      )}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {renderBadge(item, itemActive)}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-sidebar-border p-2 space-y-0.5">
          <Link href="/" target="_blank" className={linkClass(false)} title="View website">
            <Home className="size-4 shrink-0" />
            {!isCollapsed && <span>View website</span>}
          </Link>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              'w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium min-h-10 h-auto',
              isCollapsed && 'justify-center px-2'
            )}
            title="Log out"
          >
            <LogOut className="size-4 shrink-0" />
            {!isCollapsed && <span>{isLoggingOut ? 'Logging out…' : 'Log out'}</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
