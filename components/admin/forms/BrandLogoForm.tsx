'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Image as ImageIcon, Loader2, Save, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import {
  BRAND_LOGO_ASPECT,
  DEFAULT_BRAND_LOGO_SETTINGS,
  DEFAULT_BRAND_LOGO_SRC,
  normalizeBrandLogoSettings,
  publicNavMarkHeight,
  resolveBrandLogoSrc,
  type BrandLogoGlowShape,
  type BrandLogoSettings,
} from '@/lib/brand-logo';
import { useCompanyBrand } from '@/hooks/use-company-brand';
import { cn } from '@/lib/utils';

function SliderField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  hint,
  onChange,
  formatValue,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
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
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value.slice(0, 7)}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded border bg-transparent p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-[9rem] font-mono text-sm"
        />
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const SHAPES: { value: BrandLogoGlowShape; label: string }[] = [
  { value: 'oval', label: 'Oval' },
  { value: 'circle', label: 'Circle' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' },
  { value: 'square', label: 'Square' },
];

export function BrandLogoForm() {
  const brand = useCompanyBrand();
  const [settings, setSettings] = useState<BrandLogoSettings>({
    ...DEFAULT_BRAND_LOGO_SETTINGS,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ;(async () => {
      try {
        const res = await fetch('/api/admin/settings?category=brand');
        const data = await res.json();
        if (cancelled) return;
        if (data.settings?.brand_logo) {
          setSettings(normalizeBrandLogoSettings(data.settings.brand_logo));
        } else {
          const all = await fetch('/api/admin/settings');
          const allData = await all.json();
          if (!cancelled && allData.settings?.brand_logo) {
            setSettings(normalizeBrandLogoSettings(allData.settings.brand_logo));
          }
        }
      } catch (err) {
        console.error('Failed to load logo settings', err);
        toast.error('Failed to load logo settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const previewSrc = resolveBrandLogoSrc(settings, settings.height, 2);
  const markHeight = publicNavMarkHeight(settings.height);
  const markWidth = Math.round(markHeight * BRAND_LOGO_ASPECT);

  const patch = (partial: Partial<BrandLogoSettings>) => {
    setSettings((s) => ({ ...s, ...partial }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = normalizeBrandLogoSettings(settings);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'brand_logo',
          value: normalized,
          category: 'brand',
          description: 'Public site logo, nav position, and standout backdrop',
          is_public: true,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSettings(normalized);
      toast.success('Logo settings saved', {
        description: 'Refresh the public site to see the updated logo.',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to save logo settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading logo settings…
      </div>
    );
  }

  const previewPanel = (
    <Card className="space-y-4 p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Public header preview
      </p>
      <div className="overflow-hidden rounded border border-border">
        <div className="relative h-16">
          <div aria-hidden className="nav-paper pointer-events-none absolute inset-0" />
          <div className="relative flex h-16 items-center justify-center px-4">
            <span className="flex max-w-[min(100%,24rem)] items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt=""
                width={markWidth}
                height={markHeight}
                style={{ height: markHeight, width: 'auto', maxHeight: markHeight }}
                className="shrink-0 object-contain"
              />
              <span className="flex min-w-0 flex-col justify-center text-left">
                <span className="font-accent truncate text-[0.98rem] leading-[1.1] font-medium tracking-tight text-foreground sm:text-lg">
                  {brand.name}
                </span>
                <span className="mt-0.5 truncate text-[10px] leading-tight font-medium tracking-[0.12em] text-primary">
                  {brand.tagline}
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Same mark, size, and wordmark as the public site header. Height on the site is 72–88px.
      </p>
      <div className="flex flex-col gap-2">
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save logo settings
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setSettings({ ...DEFAULT_BRAND_LOGO_SETTINGS })}
          disabled={saving}
        >
          <RotateCcw className="size-4" />
          Reset to defaults
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-6">
        {/* Settings column — scrolls independently */}
        <div className="min-h-0 space-y-6 overflow-y-auto overscroll-contain pr-1 pb-8">
          {/* Mobile: compact sticky preview while scrolling settings */}
          <div className="sticky top-0 z-20 -mx-1 bg-muted/95 px-1 pb-3 pt-1 backdrop-blur lg:hidden">
            {previewPanel}
          </div>

        <Card className="space-y-6 p-6">
          <div>
            <h2 className="text-lg font-semibold">Logo image</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the logo shown across the site. Leave empty to keep the default brand mark.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-28 w-44 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/40 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="Logo preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setShowMediaPicker(true)}>
                  <ImageIcon className="size-4" />
                  Choose from media
                </Button>
                {settings.url ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => patch({ url: '', publicId: '' })}
                  >
                    Use default logo
                  </Button>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="logo-url">Or paste image URL</Label>
                <Input
                  id="logo-url"
                  value={settings.url}
                  placeholder="https://res.cloudinary.com/…"
                  onChange={(e) => patch({ url: e.target.value })}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-6 p-6">
          <div>
            <h2 className="text-lg font-semibold">Size &amp; position</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Place the logo on the public nav. Positive vertical offset hangs it below the bar.
            </p>
          </div>
          <div className="space-y-5">
            <SliderField
              id="logo-height"
              label="Height"
              value={settings.height}
              min={24}
              max={160}
              formatValue={(n) => `${n}px`}
              hint="Public header uses 72–88px (same as the homepage nav)."
              onChange={(height) => patch({ height })}
            />
            <SliderField
              id="logo-offset-x"
              label="Left / right"
              value={settings.offsetX}
              min={-120}
              max={120}
              formatValue={(n) => `${n}px`}
              onChange={(offsetX) => patch({ offsetX })}
            />
            <SliderField
              id="logo-offset-y"
              label="Up / down"
              value={settings.offsetY}
              min={-80}
              max={120}
              hint="↑ Up (negative) · Down / overhang (positive) ↓"
              formatValue={(n) => `${n}px`}
              onChange={(offsetY) => patch({ offsetY })}
            />
          </div>
        </Card>

        <Card className="space-y-6 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Standout backdrop</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Solid plate behind the logo so it stays readable when offset over the hero. Independent
                of the nav bar.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.glowEnabled}
                onCheckedChange={(glowEnabled) => patch({ glowEnabled })}
                id="logo-backdrop-enabled"
              />
              <Label htmlFor="logo-backdrop-enabled">Enabled</Label>
            </div>
          </div>

          <div className={cn('space-y-6', !settings.glowEnabled && 'pointer-events-none opacity-50')}>
            <div className="space-y-2">
              <Label>Shape</Label>
              <div className="flex flex-wrap gap-2">
                {SHAPES.map(({ value, label }) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={settings.glowShape === value ? 'default' : 'outline'}
                    onClick={() => patch({ glowShape: value })}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {settings.glowShape === 'rounded' ? (
              <SliderField
                id="logo-backdrop-radius"
                label="Corner radius"
                value={settings.backdropRadius}
                min={0}
                max={48}
                formatValue={(n) => `${n}px`}
                onChange={(backdropRadius) => patch({ backdropRadius })}
              />
            ) : null}

            <SliderField
              id="logo-backdrop-padding"
              label="Padding around logo"
              value={settings.backdropPadding}
              min={0}
              max={48}
              hint="Larger padding = bigger plate behind the mark"
              formatValue={(n) => `${n}px`}
              onChange={(backdropPadding) => patch({ backdropPadding })}
            />

            <div className="space-y-2">
              <Label>Fill type</Label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['solid', 'Solid color'],
                    ['gradient', 'Gradient wash'],
                  ] as const
                ).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={settings.bgMode === value ? 'default' : 'outline'}
                    onClick={() => patch({ bgMode: value })}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Use <strong>Solid color</strong> for maximum standout over busy hero photos.
              </p>
            </div>

            {settings.bgMode === 'solid' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorField
                  id="logo-bg-color"
                  label="Background color"
                  value={settings.bgColor}
                  onChange={(bgColor) => patch({ bgColor })}
                  hint="Plate color behind the logo"
                />
                <SliderField
                  id="logo-bg-opacity"
                  label="Background opacity"
                  value={settings.bgOpacity}
                  min={0}
                  max={100}
                  formatValue={(n) => `${n}%`}
                  onChange={(bgOpacity) => patch({ bgOpacity })}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField
                    id="logo-grad-center"
                    label="Gradient center"
                    value={settings.glowColor}
                    onChange={(glowColor) => patch({ glowColor })}
                  />
                  <ColorField
                    id="logo-grad-edge"
                    label="Gradient edge"
                    value={settings.glowColorEnd}
                    onChange={(glowColorEnd) => patch({ glowColorEnd })}
                  />
                </div>
                <SliderField
                  id="logo-grad-spread"
                  label="Gradient spread"
                  value={settings.glowGradientSpread}
                  min={0}
                  max={100}
                  formatValue={(n) => `${n}%`}
                  onChange={(glowGradientSpread) => patch({ glowGradientSpread })}
                />
                <SliderField
                  id="logo-grad-intensity"
                  label="Gradient intensity"
                  value={settings.glowIntensity}
                  min={0}
                  max={100}
                  formatValue={(n) => `${n}%`}
                  onChange={(glowIntensity) => patch({ glowIntensity })}
                />
              </div>
            )}

            <SliderField
              id="logo-glow-offset-x"
              label="Plate left / right"
              value={settings.glowOffsetX}
              min={-80}
              max={80}
              formatValue={(n) => `${n}px`}
              onChange={(glowOffsetX) => patch({ glowOffsetX })}
            />
            <SliderField
              id="logo-glow-offset-y"
              label="Plate up / down"
              value={settings.glowOffsetY}
              min={-80}
              max={80}
              formatValue={(n) => `${n}px`}
              onChange={(glowOffsetY) => patch({ glowOffsetY })}
            />
          </div>
        </Card>

        <Card className="space-y-6 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Outer glow</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Soft light around the plate (Photoshop outer glow).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.outerGlowEnabled}
                onCheckedChange={(outerGlowEnabled) => patch({ outerGlowEnabled })}
                id="logo-outer-glow"
              />
              <Label htmlFor="logo-outer-glow">Enabled</Label>
            </div>
          </div>
          <div
            className={cn('space-y-5', !settings.outerGlowEnabled && 'pointer-events-none opacity-50')}
          >
            <ColorField
              id="logo-outer-glow-color"
              label="Glow color"
              value={settings.outerGlowColor}
              onChange={(outerGlowColor) => patch({ outerGlowColor })}
            />
            <SliderField
              id="logo-outer-glow-size"
              label="Glow size"
              value={settings.outerGlowSize}
              min={0}
              max={80}
              formatValue={(n) => `${n}px`}
              onChange={(outerGlowSize) => patch({ outerGlowSize })}
            />
            <SliderField
              id="logo-outer-glow-intensity"
              label="Glow intensity"
              value={settings.outerGlowIntensity}
              min={0}
              max={100}
              formatValue={(n) => `${n}%`}
              onChange={(outerGlowIntensity) => patch({ outerGlowIntensity })}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.pulseEnabled}
                onCheckedChange={(pulseEnabled) => patch({ pulseEnabled })}
                id="logo-pulse"
              />
              <Label htmlFor="logo-pulse">Soft LED pulse</Label>
            </div>
          </div>
        </Card>

        <Card className="space-y-6 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Drop shadow</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Depth under the plate so it lifts off the hero photo.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.shadowEnabled}
                onCheckedChange={(shadowEnabled) => patch({ shadowEnabled })}
                id="logo-shadow"
              />
              <Label htmlFor="logo-shadow">Enabled</Label>
            </div>
          </div>
          <div className={cn('space-y-5', !settings.shadowEnabled && 'pointer-events-none opacity-50')}>
            <ColorField
              id="logo-shadow-color"
              label="Shadow color"
              value={settings.shadowColor}
              onChange={(shadowColor) => patch({ shadowColor })}
            />
            <SliderField
              id="logo-shadow-blur"
              label="Blur"
              value={settings.shadowBlur}
              min={0}
              max={60}
              formatValue={(n) => `${n}px`}
              onChange={(shadowBlur) => patch({ shadowBlur })}
            />
            <SliderField
              id="logo-shadow-ox"
              label="Shadow left / right"
              value={settings.shadowOffsetX}
              min={-40}
              max={40}
              formatValue={(n) => `${n}px`}
              onChange={(shadowOffsetX) => patch({ shadowOffsetX })}
            />
            <SliderField
              id="logo-shadow-oy"
              label="Shadow up / down"
              value={settings.shadowOffsetY}
              min={-40}
              max={40}
              formatValue={(n) => `${n}px`}
              onChange={(shadowOffsetY) => patch({ shadowOffsetY })}
            />
            <SliderField
              id="logo-shadow-opacity"
              label="Shadow opacity"
              value={settings.shadowOpacity}
              min={0}
              max={100}
              formatValue={(n) => `${n}%`}
              onChange={(shadowOpacity) => patch({ shadowOpacity })}
            />
          </div>
        </Card>
        </div>

        {/* Desktop: fixed preview column (does not scroll) */}
        <aside className="hidden min-h-0 overflow-y-auto lg:block">
          {previewPanel}
        </aside>
      </div>

      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(media) => {
          const item = Array.isArray(media) ? media[0] : media;
          if (!item) return;
          patch({
            url: item.secure_url || item.url,
            publicId: item.public_id || '',
          });
          setShowMediaPicker(false);
        }}
        allowedTypes={['image']}
      />
    </>
  );
}
