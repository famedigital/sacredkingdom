'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw, Menu, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DEFAULT_MOBILE_NAV_SETTINGS,
  normalizeMobileNavSettings,
  type MobileNavSettings,
  type MobileNavStyle,
} from '@/lib/mobile-nav';
import { useCompanyBrand } from '@/hooks/use-company-brand';
import { DEFAULT_BRAND_LOGO_SRC } from '@/lib/brand-logo';
import { cn } from '@/lib/utils';

function SliderField({
  id,
  label,
  value,
  min,
  max,
  hint,
  onChange,
  formatValue,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  hint?: string;
  onChange: (n: number) => void;
  formatValue?: (n: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="tabular-nums text-sm font-medium text-muted-foreground">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function MobileNavForm() {
  const brand = useCompanyBrand();
  const [settings, setSettings] = useState<MobileNavSettings>({
    ...DEFAULT_MOBILE_NAV_SETTINGS,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ;(async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (cancelled) return;
        if (data.settings?.mobile_nav) {
          setSettings(normalizeMobileNavSettings(data.settings.mobile_nav));
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load mobile menu settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = (partial: Partial<MobileNavSettings>) => {
    setSettings((s) => ({ ...s, ...partial }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = normalizeMobileNavSettings(settings);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'mobile_nav',
          value: normalized,
          category: 'brand',
          description: 'Public mobile navigation style (footer vs top burger)',
          is_public: true,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSettings(normalized);
      toast.success('Mobile menu settings saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const logoSrc = brand.logo.url?.trim() || DEFAULT_BRAND_LOGO_SRC;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">Mobile menu style</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how the public site navigates on phones. Desktop nav is unchanged.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              {
                value: 'footer' as MobileNavStyle,
                title: 'App-style footer',
                desc: 'Bottom tab bar (Home, Tours, About, Blog, WhatsApp)',
                icon: Smartphone,
              },
              {
                value: 'top' as MobileNavStyle,
                title: 'Top + burger',
                desc: 'Logo + company name on top, hamburger opens the menu',
                icon: Menu,
              },
            ] as const
          ).map(({ value, title, desc, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => patch({ style: value })}
              className={cn(
                'rounded-lg border p-4 text-left transition-colors',
                settings.style === value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-primary/40 hover:bg-muted/40'
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className="size-5 text-primary" />
                <span className="font-semibold">{title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card
        className={cn(
          'space-y-6 p-6',
          settings.style !== 'top' && 'pointer-events-none opacity-50'
        )}
      >
        <div>
          <h2 className="text-lg font-semibold">Top bar options</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Only used when “Top + burger” is selected. Logo offset is independent of the desktop
            logo position.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="show-company-name">Show company name beside logo</Label>
            <p className="text-xs text-muted-foreground">Uses the CRM company name</p>
          </div>
          <Switch
            id="show-company-name"
            checked={settings.showCompanyName}
            onCheckedChange={(showCompanyName) => patch({ showCompanyName })}
          />
        </div>

        <SliderField
          id="mobile-logo-height"
          label="Logo height"
          value={settings.logoHeight}
          min={24}
          max={64}
          formatValue={(n) => `${n}px`}
          onChange={(logoHeight) => patch({ logoHeight })}
        />
        <SliderField
          id="mobile-logo-ox"
          label="Logo left / right"
          value={settings.logoOffsetX}
          min={-60}
          max={60}
          formatValue={(n) => `${n}px`}
          onChange={(logoOffsetX) => patch({ logoOffsetX })}
        />
        <SliderField
          id="mobile-logo-oy"
          label="Logo up / down"
          value={settings.logoOffsetY}
          min={-24}
          max={24}
          formatValue={(n) => `${n}px`}
          onChange={(logoOffsetY) => patch({ logoOffsetY })}
        />

        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Preview
          </p>
          <div
            className="flex h-14 items-center justify-between gap-2 rounded border px-3"
            style={{
              background:
                'linear-gradient(90deg, rgba(10,39,68,0.6), rgba(10,39,68,0.3)), url(https://res.cloudinary.com/hqxti5zm/image/upload/c_fill,w_800,h_120,q_auto,f_auto/v1787140718/sacred-himalaya/generated-punakha.png) center/cover',
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                style={{
                  transform: `translate(${settings.logoOffsetX}px, ${settings.logoOffsetY}px)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt=""
                  style={{ height: settings.logoHeight }}
                  className="w-auto object-contain drop-shadow"
                />
              </span>
              {settings.showCompanyName ? (
                <span className="truncate text-sm font-semibold text-white drop-shadow">
                  {brand.name}
                </span>
              ) : null}
            </div>
            <Menu className="size-6 shrink-0 text-white" />
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save mobile menu
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={() => setSettings({ ...DEFAULT_MOBILE_NAV_SETTINGS })}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
