'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Loader2, Save, Plus, Trash2, Edit3, GripVertical, Eye, EyeOff, Calendar, Image as ImageIcon } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { StaggerChildren } from '@/components/ui/scroll-reveal';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import Image from 'next/image';

interface HeroSlide {
  id?: string;
  title: string;
  subtitle: string;
  description?: string;
  backgroundImage: string;
  mobileBackgroundImage?: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  sortOrder: number;
}

export function HeroSliderManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    field: string;
  } | null>(null);

  const [editForm, setEditForm] = useState<HeroSlide>({
    title: '',
    subtitle: '',
    description: '',
    backgroundImage: '',
    mobileBackgroundImage: '',
    ctaText: '',
    ctaLink: '',
    isActive: true,
    sortOrder: slides.length + 1,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from your API
      // For now, using mock data
      const mockSlides: HeroSlide[] = [
        {
          id: '1',
          title: 'Discover the Last Shangri-La',
          subtitle: 'Experience authentic Bhutanese culture and breathtaking Himalayan landscapes',
          description: 'Join us on an unforgettable journey through the Land of the Thunder Dragon',
          backgroundImage: 'https://res.cloudinary.com/hqxti5zm/image/upload/v1787140716/sacred-himalaya/generated-taktsang.png',
          mobileBackgroundImage: 'https://res.cloudinary.com/hqxti5zm/image/upload/v1787140716/sacred-himalaya/generated-taktsang.png',
          ctaText: 'Explore Tours',
          ctaLink: '/tours',
          isActive: true,
          sortOrder: 1,
        },
        {
          id: '2',
          title: 'Cultural Triangle Experience',
          subtitle: 'Immerse yourself in Bhutan\'s rich spiritual heritage',
          description: 'Visit ancient monasteries and experience traditional festivals',
          backgroundImage: 'https://res.cloudinary.com/hqxti5zm/image/upload/v1787140718/sacred-himalaya/generated-punakha.png',
          mobileBackgroundImage: 'https://res.cloudinary.com/hqxti5zm/image/upload/v1787140718/sacred-himalaya/generated-punakha.png',
          ctaText: 'Learn More',
          ctaLink: '/tours/cultural-triangle',
          isActive: true,
          sortOrder: 2,
        },
        {
          id: '3',
          title: 'Trek the Himalayas',
          subtitle: 'Challenge yourself on Bhutan\'s most scenic trails',
          description: 'From gentle walks to challenging high-altitude treks',
          backgroundImage: 'https://res.cloudinary.com/hqxti5zm/image/upload/v1787140688/sacred-himalaya/hero-2.jpg',
          mobileBackgroundImage: 'https://res.cloudinary.com/hqxti5zm/image/upload/v1787140688/sacred-himalaya/hero-2.jpg',
          ctaText: 'View Treks',
          ctaLink: '/tours?category=trekking',
          isActive: true,
          sortOrder: 3,
        },
      ];

      setSlides(mockSlides);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (slide: HeroSlide) => {
    try {
      setSaving(true);

      // In a real implementation, this would save to your API
      // For now, just updating local state
      if (slide.id) {
        setSlides(prev => prev.map(s => s.id === slide.id ? slide : s));
        toast.success('Slide updated successfully!');
        setEditingId(null);
      } else {
        const newSlide = { ...slide, id: Date.now().toString() };
        setSlides(prev => [...prev, newSlide]);
        toast.success('Slide created successfully!');
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      toast.error('Failed to save slide');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      // In a real implementation, this would delete from your API
      setSlides(prev => prev.filter(s => s.id !== id));
      toast.success('Slide deleted successfully!');
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Failed to delete slide');
    }
  };

  const toggleActive = async (id: string) => {
    try {
      setSlides(prev => prev.map(s =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      ));
      toast.success('Slide status updated!');
    } catch (error) {
      console.error('Error toggling slide:', error);
      toast.error('Failed to update slide status');
    }
  };

  const startEdit = (slide: HeroSlide) => {
    setEditingId(slide.id || null);
    setEditForm(slide);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];

    // Update sort orders
    newSlides.forEach((s, i) => s.sortOrder = i + 1);
    setSlides(newSlides);
  };

  const moveDown = (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];

    // Update sort orders
    newSlides.forEach((s, i) => s.sortOrder = i + 1);
    setSlides(newSlides);
  };

  const openMediaPicker = (field: string) => {
    setMediaPickerTarget({ field });
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (media: any) => {
    if (!mediaPickerTarget) return;

    const { field } = mediaPickerTarget;
    const imageUrl = typeof media === 'string' ? media : media.secure_url;

    setEditForm({ ...editForm, [field]: imageUrl });
    setMediaPickerOpen(false);
  };

  const resetForm = () => {
    setEditForm({
      title: '',
      subtitle: '',
      description: '',
      backgroundImage: '',
      mobileBackgroundImage: '',
      ctaText: '',
      ctaLink: '',
      isActive: true,
      sortOrder: slides.length + 1,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-prayer-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">Hero Slider Management</h2>
          <p className="text-muted-foreground">Manage homepage hero slides and banners</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="min-w-[140px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-prayer-red">{slides.length}</div>
          <div className="text-sm text-muted-foreground">Total Slides</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {slides.filter(s => s.isActive).length}
          </div>
          <div className="text-sm text-muted-foreground">Active</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {slides.filter(s => !s.isActive).length}
          </div>
          <div className="text-sm text-muted-foreground">Inactive</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">15s</div>
          <div className="text-sm text-muted-foreground">Auto-rotate</div>
        </Card>
      </div>

      {/* Add New Slide Form */}
      {showAddForm && (
        <ScrollReveal>
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold">Add New Slide</h3>
              <p className="text-muted-foreground text-sm">Create a new hero slide for the homepage</p>
            </div>

            <SlideForm
              slide={editForm}
              onSave={handleSave}
              onCancel={() => {
                setShowAddForm(false);
                resetForm();
              }}
              saving={saving}
              onMediaPicker={openMediaPicker}
            />
          </Card>
        </ScrollReveal>
      )}

      {/* Slides List */}
      <StaggerChildren>
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <ScrollReveal key={slide.id}>
              {editingId === slide.id ? (
                <Card className="p-6">
                  <SlideForm
                    slide={editForm}
                    onSave={handleSave}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                    onMediaPicker={openMediaPicker}
                  />
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Slide Preview */}
                    <div className="relative w-full md:w-80 h-48 md:h-auto flex-shrink-0">
                      <Image
                        src={slide.backgroundImage}
                        alt={slide.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-white font-bold text-lg line-clamp-2">{slide.title}</h4>
                        <p className="text-white/90 text-sm line-clamp-1">{slide.subtitle}</p>
                      </div>
                      {!slide.isActive && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-black/50 text-white">
                            Inactive
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Slide Info & Actions */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                            {slide.isActive ? (
                              <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">Inactive</Badge>
                            )}
                          </div>
                          <h4 className="font-heading font-bold text-lg mb-1">{slide.title}</h4>
                          <p className="text-muted-foreground text-sm line-clamp-2">{slide.subtitle}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                            title="Move Up"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === slides.length - 1}
                            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                            title="Move Down"
                          >
                            <GripVertical className="h-4 w-4 rotate-180" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">CTA:</span> {slide.ctaText}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Link:</span> {slide.ctaLink}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => startEdit(slide)}
                            size="sm"
                            variant="outline"
                            className="min-w-[80px]"
                          >
                            <Edit3 className="h-3 w-3 mr-2" />
                            Edit
                          </Button>

                          <Button
                            onClick={() => toggleActive(slide.id!)}
                            size="sm"
                            variant="outline"
                            className="min-w-[80px]"
                          >
                            {slide.isActive ? (
                              <>
                                <EyeOff className="h-3 w-3 mr-2" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-2" />
                                Show
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={() => handleDelete(slide.id!)}
                            size="sm"
                            variant="outline"
                            className="min-w-[80px] text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </ScrollReveal>
          ))}
        </div>
      </StaggerChildren>

      {slides.length === 0 && !showAddForm && (
        <div className="py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-2xl font-bold mb-3">No Hero Slides Yet</h3>
          <p className="text-muted-foreground mb-8 text-lg">
            Get started by adding your first hero slide
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="min-w-[140px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Slide
          </Button>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        multiple={false}
        allowedTypes={['image']}
      />
    </div>
  );
}

interface SlideFormProps {
  slide: HeroSlide;
  onSave: (slide: HeroSlide) => void;
  onCancel: () => void;
  saving: boolean;
  onMediaPicker: (field: string) => void;
}

function SlideForm({ slide, onSave, onCancel, saving, onMediaPicker }: SlideFormProps) {
  const [formData, setFormData] = useState<HeroSlide>(slide);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: keyof HeroSlide, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Title"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Hero slide title"
          required
        />

        <FormField
          label="Subtitle"
          value={formData.subtitle}
          onChange={(e) => updateField('subtitle', e.target.value)}
          placeholder="Supporting text"
          required
        />
      </div>

      <FormField
        label="Description (Optional)"
        value={formData.description || ''}
        onChange={(e) => updateField('description', e.target.value)}
        placeholder="Additional details"
        textarea
        rows={2}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="CTA Button Text"
          value={formData.ctaText}
          onChange={(e) => updateField('ctaText', e.target.value)}
          placeholder="e.g., Explore Tours"
          required
        />

        <FormField
          label="CTA Link"
          value={formData.ctaLink}
          onChange={(e) => updateField('ctaLink', e.target.value)}
          placeholder="e.g., /tours"
          required
        />
      </div>

      {/* Desktop Background Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Desktop Background Image</label>
        <div className="relative rounded-xl overflow-hidden h-48 bg-muted">
          {formData.backgroundImage ? (
            <Image
              src={formData.backgroundImage}
              alt="Desktop background preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <button
            type="button"
            onClick={() => onMediaPicker('backgroundImage')}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Change Image
          </button>
        </div>
      </div>

      {/* Mobile Background Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Mobile Background Image</label>
        <div className="relative rounded-xl overflow-hidden h-32 bg-muted">
          {formData.mobileBackgroundImage ? (
            <Image
              src={formData.mobileBackgroundImage}
              alt="Mobile background preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <button
            type="button"
            onClick={() => onMediaPicker('mobileBackgroundImage')}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Change Image
          </button>
        </div>
      </div>

      {/* Scheduling */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">Start Date (Optional)</label>
          <input
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => updateField('startDate', e.target.value)}
            className="w-full px-4 py-3 rounded-xl shadow-sm focus:shadow-sm transition-all outline-none bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
          <input
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => updateField('endDate', e.target.value)}
            className="w-full px-4 py-3 rounded-xl shadow-sm focus:shadow-sm transition-all outline-none bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => updateField('isActive', e.target.checked)}
          className="w-4 h-4 text-prayer-red rounded"
        />
        <label className="text-sm font-medium">Active (visible on website)</label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Slide
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="min-w-[120px]"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}