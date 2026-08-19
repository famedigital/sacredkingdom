'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField, FormTextarea } from '@/components/ui/form-field';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { HOME_DEFAULTS, mergeHomeContent, type HomeContent } from '@/lib/content/home'
import {
  DEFAULT_SECTION_TITLE_COLOR,
  SECTION_TITLE_COLOR_PRESETS,
  sanitizeCssColor,
} from '@/lib/hero-title-color';

const ICON_OPTIONS = ['Heart', 'Shield', 'Mountain', 'Clock', 'Users', 'Compass', 'Star', 'Globe']

export function HomePageForm() {
  const [content, setContent] = useState<HomeContent>(HOME_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchHomeContent()
  }, [])

  const fetchHomeContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/content?type=home')
      const data = await response.json()
      if (response.ok && data.content) {
        setContent(mergeHomeContent(data.content))
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error)
      toast.error('Failed to load homepage content')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType: 'home',
          content,
          metadata: {
            seoTitle: 'Homepage',
            seoDescription: 'Homepage: hero, FAQ, Bhutan, company, packages, Journal, testimonials',
          },
        }),
      })

      if (response.ok) {
        toast.success('Homepage content updated!', {
          description: 'Changes are live on the homepage.',
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Error saving homepage content:', error)
      toast.error('Failed to save homepage content')
    } finally {
      setSaving(false)
    }
  }

  const updateDifferentiator = (
    index: number,
    field: 'icon' | 'title' | 'description',
    value: string
  ) => {
    setContent((prev) => {
      const items = [...prev.differentiators.items]
      items[index] = { ...items[index], [field]: value }
      return {
        ...prev,
        differentiators: { ...prev.differentiators, items },
      }
    })
  }

  const addItem = () => {
    setContent((prev) => ({
      ...prev,
      differentiators: {
        ...prev.differentiators,
        items: [
          ...prev.differentiators.items,
          {
            icon: 'Star',
            title: 'New highlight',
            description: 'Describe this strength in one or two sentences.',
          },
        ],
      },
    }))
  }

  const removeItem = (index: number) => {
    setContent((prev) => ({
      ...prev,
      differentiators: {
        ...prev.differentiators,
        items: prev.differentiators.items.filter((_, i) => i !== index),
      },
    }))
  }

  const updateQuickAnswer = (index: number, field: 'q' | 'a', value: string) => {
    setContent((prev) => {
      const items = [...prev.quickAnswers.items]
      items[index] = { ...items[index], [field]: value }
      return {
        ...prev,
        quickAnswers: { ...prev.quickAnswers, items },
      }
    })
  }

  const addQuickAnswer = () => {
    setContent((prev) => ({
      ...prev,
      quickAnswers: {
        ...prev.quickAnswers,
        items: [
          ...prev.quickAnswers.items,
          { q: 'New question?', a: 'Short clear answer in one or two lines.' },
        ],
      },
    }))
  }

  const removeQuickAnswer = (index: number) => {
    setContent((prev) => ({
      ...prev,
      quickAnswers: {
        ...prev.quickAnswers,
        items: prev.quickAnswers.items.filter((_, i) => i !== index),
      },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading homepage content…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Homepage sections</h2>
          <p className="text-sm text-muted-foreground">
            Edit text shown on the public homepage. No coding needed — change the words and save.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="font-medium">Quick answers</h3>
            <p className="text-sm text-muted-foreground">
              Brief Q&amp;A strip directly under the hero. Keep questions short and answers to 1–2
              lines.
            </p>
          </div>
          <FormField
            label="Section title"
            value={content.quickAnswers.title}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                quickAnswers: { ...prev.quickAnswers, title: e.target.value },
              }))
            }
          />
          <FormTextarea
            label="Subtitle"
            value={content.quickAnswers.subtitle}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                quickAnswers: { ...prev.quickAnswers, subtitle: e.target.value },
              }))
            }
            rows={2}
          />

          <div className="space-y-4 pt-2">
            {content.quickAnswers.items.map((item, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Answer {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuickAnswer(index)}
                    disabled={content.quickAnswers.items.length <= 1}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </div>
                <FormField
                  label="Question (keep brief)"
                  value={item.q}
                  onChange={(e) => updateQuickAnswer(index, 'q', e.target.value)}
                />
                <FormTextarea
                  label="Answer"
                  value={item.a}
                  onChange={(e) => updateQuickAnswer(index, 'a', e.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addQuickAnswer}>
            <Plus className="size-4" />
            Add answer
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="font-medium">About Bhutan</h3>
            <p className="text-sm text-muted-foreground">
              Second homepage block after FAQ. Image is optional — leave blank to keep text-only.
            </p>
          </div>
          <FormField
            label="Small label"
            value={content.aboutBhutan.eyebrow}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                aboutBhutan: { ...prev.aboutBhutan, eyebrow: e.target.value },
              }))
            }
          />
          <FormField
            label="Title"
            value={content.aboutBhutan.title}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                aboutBhutan: { ...prev.aboutBhutan, title: e.target.value },
              }))
            }
          />
          <FormTextarea
            label="Body"
            value={content.aboutBhutan.body}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                aboutBhutan: { ...prev.aboutBhutan, body: e.target.value },
              }))
            }
            rows={5}
          />
          <FormField
            label="Image URL (Cloudinary)"
            value={content.aboutBhutan.image || ''}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                aboutBhutan: { ...prev.aboutBhutan, image: e.target.value },
              }))
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="font-medium">About the company</h3>
            <p className="text-sm text-muted-foreground">Third homepage block — Sacred Kingdom Travel.</p>
          </div>
          <FormField
            label="Small label"
            value={content.aboutCompany.eyebrow}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                aboutCompany: { ...prev.aboutCompany, eyebrow: e.target.value },
              }))
            }
          />
          <FormField
            label="Title"
            value={content.aboutCompany.title}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                aboutCompany: { ...prev.aboutCompany, title: e.target.value },
              }))
            }
          />
          <FormTextarea
            label="Body"
            value={content.aboutCompany.body}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                aboutCompany: { ...prev.aboutCompany, body: e.target.value },
              }))
            }
            rows={5}
          />
          <FormField
            label="Image URL (Cloudinary)"
            value={content.aboutCompany.image || ''}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                aboutCompany: { ...prev.aboutCompany, image: e.target.value },
              }))
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="font-medium">Journal teasers</h3>
            <p className="text-sm text-muted-foreground">Heading above the latest journal posts</p>
          </div>
          <FormField
            label="Small label"
            value={content.journal.eyebrow}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                journal: { ...prev.journal, eyebrow: e.target.value },
              }))
            }
          />
          <FormField
            label="Title"
            value={content.journal.title}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                journal: { ...prev.journal, title: e.target.value },
              }))
            }
          />
          <FormTextarea
            label="Subtitle"
            value={content.journal.subtitle}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                journal: { ...prev.journal, subtitle: e.target.value },
              }))
            }
            rows={2}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="font-medium">Tour packages section</h3>
            <p className="text-sm text-muted-foreground">Heading above the featured tour cards</p>
          </div>
          <FormField
            label="Small label"
            value={content.featured.eyebrow}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                featured: { ...prev.featured, eyebrow: e.target.value },
              }))
            }
          />
          <FormField
            label="Title"
            value={content.featured.title}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                featured: { ...prev.featured, title: e.target.value },
              }))
            }
          />

          <div className="space-y-2 rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Title color</p>
                <p className="text-xs text-muted-foreground">
                  Color for “Featured journeys” on the homepage
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Featured title color"
                  value={
                    /^#([0-9a-fA-F]{6})$/.test(content.featured.titleColor)
                      ? content.featured.titleColor
                      : DEFAULT_SECTION_TITLE_COLOR
                  }
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      featured: { ...prev.featured, titleColor: e.target.value },
                    }))
                  }
                  className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
                />
                <input
                  type="text"
                  value={content.featured.titleColor}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      featured: { ...prev.featured, titleColor: e.target.value },
                    }))
                  }
                  placeholder="#0A2744"
                  className="h-10 w-32 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SECTION_TITLE_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      featured: { ...prev.featured, titleColor: preset.value },
                    }))
                  }
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    content.featured.titleColor.toLowerCase() === preset.value.toLowerCase()
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  <span
                    className="size-3 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: preset.value }}
                  />
                  {preset.label}
                </button>
              ))}
            </div>
            <p
              className="font-accent truncate rounded-md bg-muted px-3 py-2 text-xl font-medium"
              style={{ color: sanitizeCssColor(content.featured.titleColor) }}
            >
              {content.featured.title || 'Preview title color'}
            </p>
          </div>

          <FormTextarea
            label="Subtitle"
            value={content.featured.subtitle}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                featured: { ...prev.featured, subtitle: e.target.value },
              }))
            }
            rows={2}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="font-medium">How we travel</h3>
            <p className="text-sm text-muted-foreground">
              Why-choose-us section on the homepage
            </p>
          </div>
          <FormField
            label="Small label"
            value={content.differentiators.eyebrow}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                differentiators: { ...prev.differentiators, eyebrow: e.target.value },
              }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Title (before accent)"
              value={content.differentiators.title}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  differentiators: { ...prev.differentiators, title: e.target.value },
                }))
              }
            />
            <FormField
              label="Accent word (highlighted)"
              value={content.differentiators.titleAccent}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  differentiators: { ...prev.differentiators, titleAccent: e.target.value },
                }))
              }
            />
          </div>

          <div className="space-y-4 pt-2">
            {content.differentiators.items.map((item, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Highlight {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={content.differentiators.items.length <= 1}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Icon</label>
                    <select
                      value={item.icon}
                      onChange={(e) => updateDifferentiator(index, 'icon', e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {ICON_OPTIONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FormField
                    label="Title"
                    value={item.title}
                    onChange={(e) => updateDifferentiator(index, 'title', e.target.value)}
                  />
                </div>
                <FormTextarea
                  label="Description"
                  value={item.description}
                  onChange={(e) => updateDifferentiator(index, 'description', e.target.value)}
                  rows={3}
                />
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addItem}>
            <Plus className="size-4" />
            Add highlight
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </Button>
      </div>
    </div>
  )
}
