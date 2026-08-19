'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type TourCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function TourCategoryManager() {
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/tour-categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  }, []);

  const update = (index: number, patch: Partial<TourCategory>) => {
    setCategories((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        const next = { ...c, ...patch };
        if (patch.name !== undefined && (!c.slug || c.slug === slugify(c.name))) {
          next.slug = slugify(patch.name);
        }
        return next;
      })
    );
  };

  const addCategory = () => {
    const id = `cat-${Date.now()}`;
    setCategories((prev) => [
      ...prev,
      {
        id,
        name: 'New Category',
        slug: `new-category-${prev.length + 1}`,
        sort_order: prev.length,
        is_active: true,
      },
    ]);
  };

  const removeCategory = (index: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== index).map((c, i) => ({ ...c, sort_order: i })));
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/tour-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      });
      if (!response.ok) throw new Error('Save failed');
      toast.success('Categories saved — public Tours menu will update');
    } catch {
      toast.error('Failed to save categories');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-6 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> Loading categories...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Tour Categories</CardTitle>
          <CardDescription>Shown as submenu under Tours on the public site</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={addCategory}>
            <Plus className="size-4" /> Add
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Categories
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            className="grid grid-cols-1 items-end gap-3 rounded-lg border border-border bg-muted/30 p-3 md:grid-cols-12"
          >
            <div className="grid gap-2 md:col-span-4">
              <Label htmlFor={`cat-name-${cat.id}`}>Name</Label>
              <Input
                id={`cat-name-${cat.id}`}
                value={cat.name}
                onChange={(e) => update(index, { name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div className="grid gap-2 md:col-span-3">
              <Label htmlFor={`cat-slug-${cat.id}`}>Slug</Label>
              <Input
                id={`cat-slug-${cat.id}`}
                value={cat.slug}
                onChange={(e) => update(index, { slug: slugify(e.target.value) })}
                placeholder="slug"
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-3 md:pb-1">
              <Switch
                id={`cat-active-${cat.id}`}
                checked={cat.is_active}
                onCheckedChange={(v) => update(index, { is_active: v })}
              />
              <Label htmlFor={`cat-active-${cat.id}`} className="cursor-pointer font-normal">
                Active in menu
              </Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive md:col-span-2"
              onClick={() => removeCategory(index)}
            >
              <Trash2 className="size-4" /> Remove
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
