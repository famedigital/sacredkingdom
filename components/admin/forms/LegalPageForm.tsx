'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField, FormTextarea } from '@/components/ui/form-field';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import {
  mergeLegalContent,
  type LegalPageContent,
  type LegalSection,
} from '@/lib/content/legal';

type LegalPageType = 'privacy' | 'terms';

interface LegalPageFormProps {
  pageType: LegalPageType;
  defaults: LegalPageContent;
  heading: string;
  description: string;
}

export function LegalPageForm({
  pageType,
  defaults,
  heading,
  description,
}: LegalPageFormProps) {
  const [content, setContent] = useState<LegalPageContent>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/content?type=${pageType}`);
        const data = await response.json();
        if (response.ok && data.content) {
          setContent(mergeLegalContent(data.content, defaults));
        }
      } catch (error) {
        console.error(`Error fetching ${pageType} content:`, error);
        toast.error(`Failed to load ${heading}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageType, defaults, heading]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType,
          content,
          metadata: {
            seoTitle: content.title,
            seoDescription: content.cta.subtitle || content.title,
          },
        }),
      });

      if (response.ok) {
        toast.success(`${heading} updated`, {
          description: 'Changes are live on the public site.',
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error(`Error saving ${pageType}:`, error);
      toast.error(`Failed to save ${heading}`);
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (index: number, field: keyof LegalSection, value: string) => {
    setContent((prev) => {
      const sections = [...prev.sections];
      sections[index] = { ...sections[index], [field]: value };
      return { ...prev, sections };
    });
  };

  const addSection = () => {
    setContent((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: 'New section',
          body: 'Write the section content here. Use a new line starting with - for bullet points.\n\nYou can type {company} where the company name should appear.',
        },
      ],
    }));
  };

  const removeSection = (index: number) => {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    setContent((prev) => {
      const next = index + direction;
      if (next < 0 || next >= prev.sections.length) return prev;
      const sections = [...prev.sections];
      const [item] = sections.splice(index, 1);
      sections.splice(next, 0, item);
      return { ...prev, sections };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{heading}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <FormField
            label="Page title"
            value={content.title}
            onChange={(e) => setContent((prev) => ({ ...prev, title: e.target.value }))}
          />
          <FormField
            label="Last updated label"
            value={content.lastUpdated}
            onChange={(e) => setContent((prev) => ({ ...prev, lastUpdated: e.target.value }))}
            placeholder="Leave blank to show today’s date"
          />
          <p className="text-xs text-muted-foreground">
            Tip: type <code className="rounded bg-muted px-1">{'{company}'}</code> in any section —
            it will be replaced with your company name on the website.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {content.sections.map((section, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">Section {index + 1}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSection(index, -1)}
                    disabled={index === 0}
                  >
                    Up
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSection(index, 1)}
                    disabled={index === content.sections.length - 1}
                  >
                    Down
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(index)}
                    disabled={content.sections.length <= 1}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </div>
              </div>
              <FormField
                label="Heading"
                value={section.title}
                onChange={(e) => updateSection(index, 'title', e.target.value)}
              />
              <FormTextarea
                label="Content"
                value={section.body}
                onChange={(e) => updateSection(index, 'body', e.target.value)}
                rows={8}
                placeholder={
                  'Write paragraphs here.\n\n- Bullet one\n- Bullet two'
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addSection}>
        <Plus className="size-4" />
        Add section
      </Button>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="font-medium">Bottom call-to-action</h3>
            <p className="text-sm text-muted-foreground">
              Banner at the bottom of the page with Contact / Tours buttons
            </p>
          </div>
          <FormField
            label="CTA title"
            value={content.cta.title}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                cta: { ...prev.cta, title: e.target.value },
              }))
            }
          />
          <FormField
            label="CTA subtitle"
            value={content.cta.subtitle}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                cta: { ...prev.cta, subtitle: e.target.value },
              }))
            }
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
