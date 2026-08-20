'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, ChevronRight, Calendar, MapPin, Users, DollarSign, Clock, TrendingUp, Star, Loader2, Eye, Check, Link2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/components/ui/form-field';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import { ImageFocalPicker } from '@/components/admin/ImageFocalPicker';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { clampFocal } from '@/lib/image-focal';
import {
  TOUR_LOCATIONS,
  MEAL_OPTIONS,
  ACCOMMODATION_OPTIONS,
  TOUR_INCLUSION_OPTIONS,
  TOUR_HIGHLIGHT_OPTIONS,
  createEmptyItineraryDay,
  getCurrencyForCategory,
  formatTourPrice,
  currencySymbol,
  readShowPrice,
  syncShowPriceKeywords,
  HIDE_PRICE_KEYWORD,
} from '@/lib/tour-options';
import { normalizeTourInclusions } from '@/lib/quotes/client-quote';

function CategorySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [options, setOptions] = useState<{ slug: string; name: string }[]>([
    { slug: 'cultural', name: 'Cultural Trip' },
    { slug: 'festivals', name: 'Festival Tour' },
    { slug: 'trekking', name: 'Trekking' },
    { slug: 'wildlife', name: 'Wildlife' },
  ]);

  useEffect(() => {
    fetch('/api/admin/tour-categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories?.length) {
          setOptions(data.categories.map((c: any) => ({ slug: c.slug, name: c.name })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
    >
      {options.map((o) => (
        <option key={o.slug} value={o.slug}>
          {o.name}
        </option>
      ))}
    </select>
  );
}

function StatusSwitches({
  formData,
  updateField,
}: {
  formData: {
    is_active: boolean;
    is_featured: boolean;
    is_published: boolean;
    show_price: boolean;
  };
  updateField: (field: string, value: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
      <div className="flex items-center gap-2">
        <Switch
          id="tour-active"
          checked={formData.is_active}
          onCheckedChange={(v) => updateField('is_active', v)}
        />
        <Label htmlFor="tour-active" className="cursor-pointer font-normal">
          Active
        </Label>
        <span className="hidden text-xs text-muted-foreground sm:inline">(in admin)</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="tour-featured"
          checked={formData.is_featured}
          onCheckedChange={(v) => updateField('is_featured', v)}
        />
        <Label htmlFor="tour-featured" className="cursor-pointer font-normal">
          Featured
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="tour-published"
          checked={formData.is_published}
          onCheckedChange={(v) => updateField('is_published', v)}
        />
        <Label htmlFor="tour-published" className="cursor-pointer font-normal">
          Published to public
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="tour-show-price"
          checked={formData.show_price}
          onCheckedChange={(v) => updateField('show_price', v)}
        />
        <Label htmlFor="tour-show-price" className="cursor-pointer font-normal">
          Show price publicly
        </Label>
      </div>
    </div>
  );
}

interface TourFormProps {
  tour?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface StepConfig {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const steps: StepConfig[] = [
  { id: 'basic', title: 'Basic Info', description: 'Tour details and pricing', icon: MapPin },
  { id: 'content', title: 'Content', description: 'Descriptions and highlights', icon: Star },
  { id: 'media', title: 'Media', description: 'Images and gallery', icon: Upload },
  { id: 'itinerary', title: 'Itinerary', description: 'Day-by-day plan', icon: Calendar },
  { id: 'pricing', title: 'Pricing & Options', description: 'Inclusions and dates', icon: DollarSign },
  { id: 'seo', title: 'SEO', description: 'Meta information', icon: TrendingUp },
  { id: 'preview', title: 'Preview', description: 'Review your tour', icon: Eye },
];

export function TourForm({ tour, onSubmit, onCancel }: TourFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: tour?.title || '',
    slug: tour?.slug || '',
    tagline: tour?.tagline || '',
    description: tour?.description || '',
    long_description: tour?.long_description || '',
    category: tour?.category || 'cultural',
    duration: tour?.duration || 7,
    price: tour?.price || 0,
    difficulty_level: tour?.difficulty_level || 'moderate',
    max_group_size: tour?.max_group_size || 12,
    min_group_size: tour?.min_group_size || 2,
    hero_image_url: tour?.hero_image_url || '',
    hero_image_focal_x: clampFocal(tour?.hero_image_focal_x),
    hero_image_focal_y: clampFocal(tour?.hero_image_focal_y),
    thumbnail_url: tour?.thumbnail_url || '',
    gallery_urls: tour?.gallery_urls || [],
    highlights: Array.isArray(tour?.highlights) ? tour.highlights : [],
    included_items: Array.isArray(tour?.included_items)
      ? normalizeTourInclusions(tour.included_items)
      : [],
    excluded_items: Array.isArray(tour?.excluded_items) ? tour.excluded_items : [],
    is_featured: tour?.is_featured || false,
    is_active: tour?.is_active ?? true,
    is_published: tour?.is_published ?? true,
    show_price: readShowPrice(tour),
    meta_title: tour?.meta_title || '',
    meta_description: tour?.meta_description || '',
    meta_keywords: tour?.meta_keywords || [],
    itinerary: tour?.itinerary || [],
    locations: tour?.locations || [],
    departure_dates: tour?.departure_dates || [],
    faqs: tour?.faqs || [],
  });

  const [loading, setLoading] = useState(false);
  const [sharingNaked, setSharingNaked] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    field: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const priceCurrency = getCurrencyForCategory(formData.category);
  const pricePrefix = currencySymbol(priceCurrency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate current step
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix the errors before proceeding');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final submission — normalize arrays / itinerary for DB
    setLoading(true);
    try {
      const payload = {
        ...formData,
        highlights: formData.highlights.filter((h: string) => h?.trim()),
        included_items: formData.included_items.filter((h: string) => h?.trim()),
        excluded_items: formData.excluded_items.filter((h: string) => h?.trim()),
        gallery_urls: formData.gallery_urls.filter((u: string) => u?.trim()),
        meta_keywords: syncShowPriceKeywords(formData.meta_keywords, formData.show_price),
        show_price: formData.show_price,
        itinerary: formData.itinerary.map((day: any, index: number) => {
          const base =
            typeof day === 'object' && day !== null
              ? day
              : createEmptyItineraryDay(index + 1);
          return {
            day: index + 1,
            title: base.title || '',
            location: base.location || '',
            description: base.description || '',
            meals: base.meals || '',
            accommodation: base.accommodation || '',
            activities: base.activities || [],
          };
        }),
      };
      await onSubmit(payload);
      toast.success('Tour saved successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save tour';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (stepIndex: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    const step = steps[stepIndex];

    switch (step.id) {
      case 'basic':
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.slug.trim()) errors.slug = 'Slug is required';
        if (!formData.duration || formData.duration < 1) errors.duration = 'Duration must be at least 1 day';
        if (!formData.price || formData.price < 0) errors.price = 'Price must be positive';
        break;
      case 'content':
        if (!formData.description.trim()) errors.description = 'Short description is required';
        if (!formData.long_description.trim()) errors.long_description = 'Detailed description is required';
        break;
      case 'media':
        if (!formData.hero_image_url.trim()) errors.hero_image_url = 'Hero image is required';
        break;
    }

    return errors;
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setValidationErrors({ ...validationErrors, [field]: '' });
  };

  const addArrayItem = (field: string) => {
    setFormData({
      ...formData,
      [field]: [...(formData[field as keyof typeof formData] as any[]), '']
    });
  };

  const removeArrayItem = (field: string, index: number) => {
    const newArray = [...(formData[field as keyof typeof formData] as any[])];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  const updateArrayItem = (field: string, index: number, value: any) => {
    const newArray = [...(formData[field as keyof typeof formData] as any[])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const openMediaPicker = (field: string) => {
    setMediaPickerTarget({ field });
    setMediaPickerOpen(true);
  };

  const mediaUrl = (item: unknown): string => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      const m = item as { secure_url?: string; url?: string; thumbnail_url?: string };
      return m.secure_url || m.url || m.thumbnail_url || '';
    }
    return '';
  };

  const handleMediaSelect = (media: unknown) => {
    if (!mediaPickerTarget) return;

    const { field } = mediaPickerTarget;
    const items = Array.isArray(media) ? media : [media];
    const urls = items.map(mediaUrl).filter(Boolean);

    if (urls.length === 0) {
      toast.error('Could not read selected image URL');
      return;
    }

    if (field === 'gallery_urls') {
      const existing = (formData.gallery_urls || []).filter(Boolean);
      const merged = [...existing];
      for (const url of urls) {
        if (!merged.includes(url)) merged.push(url);
      }
      const next: Record<string, unknown> = { gallery_urls: merged };
      // Auto-fill empty thumbnail from first selected gallery image
      if (!formData.thumbnail_url && merged[0]) {
        next.thumbnail_url = merged[0];
      }
      setFormData({ ...formData, ...next });
    } else {
      const url = urls[0];
      const next: Record<string, unknown> = { [field]: url };
      if (field === 'hero_image_url') {
        next.hero_image_focal_x = 50;
        next.hero_image_focal_y = 50;
        if (!formData.thumbnail_url) {
          next.thumbnail_url = url;
        }
      }
      setFormData({ ...formData, ...next });
      setValidationErrors({ ...validationErrors, [field]: '' });
    }

    setMediaPickerOpen(false);
    setMediaPickerTarget(null);
  };

  const addItineraryDay = () => {
    setFormData({
      ...formData,
      itinerary: [
        ...formData.itinerary,
        createEmptyItineraryDay(formData.itinerary.length + 1),
      ],
    });
  };

  const toggleInclusionItem = (listField: 'included_items' | 'excluded_items', item: string) => {
    const current = formData[listField] as string[];
    const next = current.includes(item)
      ? current.filter((v) => v !== item)
      : [...current, item];
    updateField(listField, next);
  };

  const toggleHighlight = (item: string) => {
    const current = formData.highlights as string[];
    const next = current.includes(item)
      ? current.filter((v) => v !== item)
      : [...current, item];
    updateField('highlights', next);
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    updateField('slug', slug);
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:gap-6">
      {/* Steps Sidebar */}
      <div className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-4 space-y-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const hasError = Object.keys(validationErrors).length > 0 && index === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'w-full rounded-lg border p-3 text-left transition-colors',
                  isActive
                    ? 'border-primary bg-primary/5'
                    : isCompleted
                      ? 'border-transparent bg-muted/50 hover:bg-muted'
                      : 'border-transparent opacity-60 hover:opacity-80'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'relative flex size-8 items-center justify-center rounded-md',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-4 text-primary" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                    {hasError && (
                      <div className="absolute -top-1 -right-1 size-2.5 rounded-full bg-destructive" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-medium', isActive && 'text-primary')}>
                      {step.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-4 space-y-3">
          <StatusSwitches formData={formData} updateField={updateField} />
          {tour?.id ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={sharingNaked}
                onClick={async () => {
                  setSharingNaked(true);
                  try {
                    const res = await fetch(`/api/admin/tours/${tour.id}/naked-share`, {
                      method: 'POST',
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error || 'Failed to create share link');
                    const absolute = `${window.location.origin}${json.path || json.url}`;
                    await navigator.clipboard.writeText(absolute);
                    toast.success('Naked itinerary link copied (no rates)');
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Share link failed');
                  } finally {
                    setSharingNaked(false);
                  }
                }}
              >
                {sharingNaked ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                Copy naked itinerary link
              </Button>
              <p className="text-xs text-muted-foreground">
                Share day-by-day plan with a client — prices hidden. Save the tour first if itinerary changed.
              </p>
            </div>
          ) : null}
        </div>
        <Card className="mb-6">
          <div className="border-b px-4 py-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-semibold">{steps[currentStep].title}</h2>
                <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>

            {/* Mobile Steps Indicator */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="hidden sm:inline">{step.title}</span>
                    {isCompleted && <Check className="ml-1 size-3" />}
                  </button>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-3 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        label="Tour Title"
                        value={formData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="e.g., Cultural Triangle Tour"
                        required
                        error={validationErrors.title}
                      />

                      <div className="space-y-2">
                        <FormField
                          label="URL Slug"
                          value={formData.slug}
                          onChange={(e) => updateField('slug', e.target.value)}
                          placeholder="cultural-triangle-tour"
                          required
                          error={validationErrors.slug}
                        />
                        <button
                          type="button"
                          onClick={generateSlug}
                          className="text-sm text-primary hover:underline"
                        >
                          Generate from title
                        </button>
                      </div>
                    </div>

                    <FormField
                      label="Tagline"
                      value={formData.tagline}
                      onChange={(e) => updateField('tagline', e.target.value)}
                      placeholder="A short catchy phrase"
                    />

                    <div className="grid gap-6 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Tour Category (nav group)</label>
                        <CategorySelect
                          value={formData.category}
                          onChange={(v) => updateField('category', v)}
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {priceCurrency === 'INR'
                            ? 'Regional category → price in INR (₹)'
                            : 'International category → price in USD ($)'}
                        </p>
                      </div>

                      <FormField
                        label="Duration (Days)"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => updateField('duration', parseInt(e.target.value))}
                        min="1"
                        required
                        error={validationErrors.duration}
                      />

                      <div className="space-y-2">
                        <FormField
                          label={`Price (${priceCurrency})`}
                          type="number"
                          value={formData.price}
                          onChange={(e) => updateField('price', parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                          required
                          error={validationErrors.price}
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.show_price
                            ? `Public: ${pricePrefix}${Number(formData.price || 0).toLocaleString()} per person`
                            : 'Public: price hidden (Contact for price)'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                      <FormField
                        label="Difficulty Level"
                        value={formData.difficulty_level}
                        onChange={(e) => updateField('difficulty_level', e.target.value)}
                        select
                        options={[
                          { value: 'easy', label: 'Easy' },
                          { value: 'moderate', label: 'Moderate' },
                          { value: 'challenging', label: 'Challenging' },
                          { value: 'strenuous', label: 'Strenuous' }
                        ]}
                      />

                      <FormField
                        label="Min Group Size"
                        type="number"
                        value={formData.min_group_size}
                        onChange={(e) => updateField('min_group_size', parseInt(e.target.value))}
                        min="1"
                      />

                      <FormField
                        label="Max Group Size"
                        type="number"
                        value={formData.max_group_size}
                        onChange={(e) => updateField('max_group_size', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Content */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <FormField
                      label="Short Description"
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="A brief overview for tour listings..."
                      textarea
                      rows={3}
                      required
                      error={validationErrors.description}
                    />

                    <FormField
                      label="Detailed Description"
                      value={formData.long_description}
                      onChange={(e) => updateField('long_description', e.target.value)}
                      placeholder="Full tour description with details..."
                      textarea
                      rows={8}
                      required
                      error={validationErrors.long_description}
                    />

                    <div>
                      <label className="mb-3 block text-sm font-medium">Tour Highlights</label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {TOUR_HIGHLIGHT_OPTIONS.map((item) => {
                          const checked = formData.highlights.includes(item);
                          return (
                            <label
                              key={item}
                              className={cn(
                                'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                                checked
                                  ? 'border-primary/40 bg-primary/5 text-foreground'
                                  : 'border-border hover:bg-muted/50'
                              )}
                            >
                              <input
                                type="checkbox"
                                className="size-4 accent-primary"
                                checked={checked}
                                onChange={() => toggleHighlight(item)}
                              />
                              <Star
                                className={cn(
                                  'size-4 shrink-0',
                                  checked ? 'text-primary' : 'text-muted-foreground/40'
                                )}
                              />
                              <span>{item}</span>
                            </label>
                          );
                        })}
                      </div>
                      {formData.highlights
                        .filter(
                          (item: string) =>
                            !(TOUR_HIGHLIGHT_OPTIONS as readonly string[]).includes(item)
                        )
                        .map((item: string) => (
                          <div key={`hl-custom-${item}`} className="mt-2 flex items-center gap-2 text-sm">
                            <Star className="size-4 text-primary" />
                            <span className="flex-1">{item}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateField(
                                  'highlights',
                                  formData.highlights.filter((v: string) => v !== item)
                                )
                              }
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Media */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Hero Image</label>
                      <div className="relative h-48 overflow-hidden rounded-xl bg-muted sm:h-64">
                        {formData.hero_image_url ? (
                          <img
                            src={formData.hero_image_url}
                            alt="Hero preview"
                            className="h-full w-full object-cover"
                            style={{
                              objectPosition: `${formData.hero_image_focal_x}% ${formData.hero_image_focal_y}%`,
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Upload className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => openMediaPicker('hero_image_url')}
                          className="absolute top-3 right-3 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white sm:top-4 sm:right-4 sm:px-4 sm:py-2"
                        >
                          Change Image
                        </button>
                      </div>
                      {validationErrors.hero_image_url && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.hero_image_url}</p>
                      )}
                      {formData.hero_image_url && (
                        <div className="mt-4">
                          <ImageFocalPicker
                            imageUrl={formData.hero_image_url}
                            aspect="card"
                            label="Tour card & hero visible area"
                            value={{
                              x: formData.hero_image_focal_x,
                              y: formData.hero_image_focal_y,
                            }}
                            onChange={(focal) => {
                              setFormData((prev) => ({
                                ...prev,
                                hero_image_focal_x: focal.x,
                                hero_image_focal_y: focal.y,
                              }));
                              setValidationErrors((prev) => ({
                                ...prev,
                                hero_image_focal_x: '',
                                hero_image_focal_y: '',
                              }));
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Thumbnail Image</label>
                      <div className="relative h-36 max-w-sm overflow-hidden rounded-xl bg-muted sm:h-40">
                        {formData.thumbnail_url ? (
                          <img
                            src={formData.thumbnail_url}
                            alt="Thumbnail preview"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const el = e.target as HTMLImageElement;
                              if (formData.hero_image_url && el.src !== formData.hero_image_url) {
                                el.src = formData.hero_image_url;
                              }
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => openMediaPicker('thumbnail_url')}
                          className="absolute top-3 right-3 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white"
                        >
                          Change Image
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <label className="block text-sm font-medium">
                          Gallery Images
                          {formData.gallery_urls.length > 0 && (
                            <span className="ml-2 text-muted-foreground">
                              ({formData.gallery_urls.length})
                            </span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() => openMediaPicker('gallery_urls')}
                          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                        >
                          <Plus className="h-4 w-4" />
                          Add Images
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                        {formData.gallery_urls.map((url: string, index: number) => (
                          <div key={`${url}-${index}`} className="group relative">
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <img
                                src={url}
                                alt={`Gallery ${index + 1}`}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeArrayItem('gallery_urls', index)}
                              className="absolute top-2 right-2 rounded-lg bg-red-600 p-2 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {formData.gallery_urls.length === 0 && (
                          <div className="col-span-full rounded-xl border-2 border-dashed py-8 text-center text-muted-foreground">
                            No gallery images yet. Select multiple images and click Insert.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Itinerary */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-sm font-medium">Daily Itinerary</label>
                      <button
                        type="button"
                        onClick={addItineraryDay}
                        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                      >
                        <Plus className="h-4 w-4" />
                        Add Day
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.itinerary.map((day: any, index: number) => {
                        const dayData =
                          typeof day === 'object' && day !== null
                            ? day
                            : createEmptyItineraryDay(index + 1);

                        return (
                          <Card key={index} className="p-3 sm:p-4">
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground sm:h-16 sm:w-16 sm:text-base">
                                D{index + 1}
                              </div>
                              <div className="min-w-0 flex-1 space-y-3">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <FormField
                                    label="Title"
                                    value={dayData.title || ''}
                                    onChange={(e) =>
                                      updateArrayItem('itinerary', index, {
                                        ...dayData,
                                        day: index + 1,
                                        title: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., Arrival in Paro"
                                  />
                                  <FormField
                                    label="Location"
                                    value={dayData.location || ''}
                                    onChange={(e) =>
                                      updateArrayItem('itinerary', index, {
                                        ...dayData,
                                        day: index + 1,
                                        location: e.target.value,
                                      })
                                    }
                                    select
                                    options={[
                                      { value: '', label: 'Select location' },
                                      ...TOUR_LOCATIONS.map((loc) => ({
                                        value: loc,
                                        label: loc,
                                      })),
                                    ]}
                                  />
                                </div>
                                <FormField
                                  label="Description"
                                  value={dayData.description || ''}
                                  onChange={(e) =>
                                    updateArrayItem('itinerary', index, {
                                      ...dayData,
                                      day: index + 1,
                                      description: e.target.value,
                                    })
                                  }
                                  textarea
                                  rows={3}
                                  placeholder="Day activities..."
                                />
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <FormField
                                    label="Meals Included"
                                    value={dayData.meals || ''}
                                    onChange={(e) =>
                                      updateArrayItem('itinerary', index, {
                                        ...dayData,
                                        day: index + 1,
                                        meals: e.target.value,
                                      })
                                    }
                                    select
                                    options={[
                                      { value: '', label: 'Select meals' },
                                      ...MEAL_OPTIONS.map((o) => ({
                                        value: o.value,
                                        label: o.label,
                                      })),
                                    ]}
                                  />
                                  <FormField
                                    label="Accommodation"
                                    value={dayData.accommodation || ''}
                                    onChange={(e) =>
                                      updateArrayItem('itinerary', index, {
                                        ...dayData,
                                        day: index + 1,
                                        accommodation: e.target.value,
                                      })
                                    }
                                    select
                                    options={[
                                      { value: '', label: 'Select accommodation' },
                                      ...ACCOMMODATION_OPTIONS.map((o) => ({
                                        value: o.value,
                                        label: o.label,
                                      })),
                                    ]}
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeArrayItem('itinerary', index)}
                                className="shrink-0 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                    {formData.itinerary.length === 0 && (
                      <div className="rounded-xl border-2 border-dashed py-8 text-center text-muted-foreground">
                        No itinerary days added yet. Click &quot;Add Day&quot; to start planning.
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Pricing & Options */}
                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div>
                      <label className="mb-3 block text-sm font-medium">Included Items</label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {TOUR_INCLUSION_OPTIONS.map((item) => {
                          const checked = formData.included_items.includes(item);
                          return (
                            <label
                              key={`inc-${item}`}
                              className={cn(
                                'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                                checked
                                  ? 'border-green-600/40 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-100'
                                  : 'border-border hover:bg-muted/50'
                              )}
                            >
                              <input
                                type="checkbox"
                                className="size-4 accent-green-600"
                                checked={checked}
                                onChange={() => toggleInclusionItem('included_items', item)}
                              />
                              <Check className={cn('size-4 shrink-0', checked ? 'text-green-600' : 'text-muted-foreground/40')} />
                              <span>{item}</span>
                            </label>
                          );
                        })}
                      </div>
                      {/* Custom extras beyond the preset list */}
                      {formData.included_items
                        .filter((item: string) => !(TOUR_INCLUSION_OPTIONS as readonly string[]).includes(item))
                        .map((item: string) => (
                          <div key={`inc-custom-${item}`} className="mt-2 flex items-center gap-2 text-sm">
                            <Check className="size-4 text-green-600" />
                            <span className="flex-1">{item}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateField(
                                  'included_items',
                                  formData.included_items.filter((v: string) => v !== item)
                                )
                              }
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-medium">Excluded Items</label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {TOUR_INCLUSION_OPTIONS.map((item) => {
                          const checked = formData.excluded_items.includes(item);
                          return (
                            <label
                              key={`exc-${item}`}
                              className={cn(
                                'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                                checked
                                  ? 'border-red-600/40 bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-100'
                                  : 'border-border hover:bg-muted/50'
                              )}
                            >
                              <input
                                type="checkbox"
                                className="size-4 accent-red-600"
                                checked={checked}
                                onChange={() => toggleInclusionItem('excluded_items', item)}
                              />
                              <X className={cn('size-4 shrink-0', checked ? 'text-red-600' : 'text-muted-foreground/40')} />
                              <span>{item}</span>
                            </label>
                          );
                        })}
                      </div>
                      {formData.excluded_items
                        .filter((item: string) => !(TOUR_INCLUSION_OPTIONS as readonly string[]).includes(item))
                        .map((item: string) => (
                          <div key={`exc-custom-${item}`} className="mt-2 flex items-center gap-2 text-sm">
                            <X className="size-4 text-red-600" />
                            <span className="flex-1">{item}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateField(
                                  'excluded_items',
                                  formData.excluded_items.filter((v: string) => v !== item)
                                )
                              }
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Step 6: SEO */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <FormField
                      label="Meta Title"
                      value={formData.meta_title}
                      onChange={(e) => updateField('meta_title', e.target.value)}
                      placeholder="SEO title (60 characters max)"
                      maxLength={60}
                    />

                    <FormField
                      label="Meta Description"
                      value={formData.meta_description}
                      onChange={(e) => updateField('meta_description', e.target.value)}
                      placeholder="SEO description (160 characters max)"
                      textarea
                      rows={3}
                      maxLength={160}
                    />

                    <div>
                      <label className="block text-sm font-medium mb-2">Meta Keywords</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.meta_keywords
                          .filter((keyword: string) => keyword !== HIDE_PRICE_KEYWORD)
                          .map((keyword: string, index: number) => (
                          <span
                            key={`${keyword}-${index}`}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-lg text-sm"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => {
                                const newKeywords = formData.meta_keywords.filter(
                                  (k: string) => k !== keyword
                                );
                                updateField('meta_keywords', newKeywords);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Add keyword and press Enter"
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const target = e.target as HTMLInputElement;
                              if (target.value.trim()) {
                                updateField('meta_keywords', [...formData.meta_keywords, target.value.trim()]);
                                target.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 7: Preview */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card className="overflow-hidden py-0">
                        {formData.hero_image_url && (
                          <div className="relative h-48">
                            <img
                              src={formData.hero_image_url}
                              alt={formData.title}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute top-3 right-3">
                              <span className="rounded-md bg-background/90 px-3 py-1 text-sm font-medium ring-1 ring-border">
                                {formData.show_price
                                  ? formatTourPrice(formData.price, formData.category)
                                  : 'Contact for price'}
                              </span>
                            </div>
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h3 className="mb-1 font-heading text-lg font-semibold">{formData.title}</h3>
                          {formData.tagline && (
                            <p className="mb-2 text-sm text-muted-foreground">{formData.tagline}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="size-4" />
                              {formData.duration} days
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="size-4" />
                              {formData.difficulty_level}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 font-medium">Status</h4>
                          <p className="text-sm text-muted-foreground">
                            Use the Active / Featured / Published switches above the form.
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <li>Active: {formData.is_active ? 'Yes' : 'No'}</li>
                            <li>Featured: {formData.is_featured ? 'Yes' : 'No'}</li>
                            <li>Published: {formData.is_published ? 'Yes' : 'No'}</li>
                            <li>Show price publicly: {formData.show_price ? 'Yes' : 'No'}</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="mb-2 font-medium">Summary</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Duration: {formData.duration} days</p>
                            <p>
                              Price:{' '}
                              {formData.show_price
                                ? `${formatTourPrice(formData.price, formData.category)} (${priceCurrency})`
                                : 'Hidden on public pages'}
                            </p>
                            <p>Group size: {formData.min_group_size}-{formData.max_group_size}</p>
                            <p>Itinerary days: {formData.itinerary.length}</p>
                            <p>Gallery images: {formData.gallery_urls.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
              <Button type="button" onClick={onCancel} variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>

              <div className="flex w-full gap-2 sm:w-auto">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                  >
                    Previous
                  </Button>
                )}

                <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : currentStep === steps.length - 1 ? (
                    <>
                      <Check className="size-4" />
                      Save Tour
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        multiple={mediaPickerTarget?.field === 'gallery_urls'}
        allowedTypes={['image']}
      />
    </div>
  );
}