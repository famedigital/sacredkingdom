'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PALETTES, LAYOUTS, type LayoutId, type PaletteId } from '@/lib/appearance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { authFetch } from '@/lib/auth/fetch';

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function AppearanceForm() {
  const [palette, setPalette] = useState<PaletteId>('gold-sanctuary');
  const [layout, setLayout] = useState<LayoutId>('magazine');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch('/api/admin/settings?category=appearance');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load appearance');
        if (cancelled) return;
        const settings = data.settings || {};
        if (asString(settings.public_palette)) setPalette(asString(settings.public_palette) as PaletteId);
        if (asString(settings.public_layout)) setLayout(asString(settings.public_layout) as LayoutId);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load appearance');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = [
        {
          key: 'public_palette',
          value: palette,
          category: 'appearance',
          description: 'Public site color palette',
          is_public: true,
        },
        {
          key: 'public_layout',
          value: layout,
          category: 'appearance',
          description: 'Public homepage layout template',
          is_public: true,
        },
      ];
      const res = await authFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      toast.success('Appearance saved — refresh the public site to see it');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save appearance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading appearance…</p>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="palettes">
        <TabsList>
          <TabsTrigger value="palettes">Palettes</TabsTrigger>
          <TabsTrigger value="layouts">Layout templates</TabsTrigger>
        </TabsList>
        <TabsContent value="palettes" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PALETTES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPalette(item.id)}
                className={cn(
                  'rounded-2xl text-left ring-1 transition-shadow',
                  palette === item.id ? 'ring-2 ring-primary' : 'ring-foreground/10 hover:ring-primary/40'
                )}
              >
                <Card className="h-full shadow-none ring-0">
                  <CardHeader>
                    <div className="mb-3 flex gap-1.5">
                      {item.preview.map((color) => (
                        <span
                          key={color}
                          className="size-8 rounded-full ring-1 ring-foreground/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="layouts" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            {LAYOUTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLayout(item.id)}
                className={cn(
                  'rounded-2xl text-left ring-1 transition-shadow',
                  layout === item.id ? 'ring-2 ring-primary' : 'ring-foreground/10 hover:ring-primary/40'
                )}
              >
                <Card className="h-full shadow-none ring-0">
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {item.id}
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save appearance'}
      </Button>
    </div>
  );
}
