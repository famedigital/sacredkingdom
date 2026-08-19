'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Plus, Trash2, Edit3, Check, X, GripVertical, Search, Filter } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { StaggerChildren } from '@/components/ui/scroll-reveal';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

const categories = ['General', 'Safety', 'Preparation', 'Booking', 'Health', 'Culture'];

export function FAQManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FAQ>({
    question: '',
    answer: '',
    category: 'General',
    sort_order: 0,
    is_active: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content/faqs');
      const data = await response.json();

      if (response.ok) {
        setFaqs(data.faqs || []);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (faq: FAQ) => {
    try {
      setSaving(true);

      const isUpdate = !!faq.id;
      const url = '/api/admin/content/faqs';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq)
      });

      if (response.ok) {
        toast.success(isUpdate ? 'FAQ updated successfully!' : 'FAQ created successfully!');

        if (isUpdate) {
          setFaqs(prev => prev.map(f => f.id === faq.id ? faq : f));
          setEditingId(null);
        } else {
          const { data } = await response.json();
          setFaqs(prev => [...prev, data.faq]);
          setShowAddForm(false);
          resetForm();
        }
      } else {
        throw new Error('Failed to save FAQ');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const response = await fetch(`/api/admin/content/faqs?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('FAQ deleted successfully!');
        setFaqs(prev => prev.filter(f => f.id !== id));
      } else {
        throw new Error('Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  const startEdit = (faq: FAQ) => {
    setEditingId(faq.id || null);
    setEditForm(faq);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setEditForm({
      question: '',
      answer: '',
      category: 'General',
      sort_order: faqs.length + 1,
      is_active: true
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newFaqs = [...faqs];
    [newFaqs[index - 1], newFaqs[index]] = [newFaqs[index], newFaqs[index - 1]];

    // Update sort orders
    newFaqs.forEach((f, i) => f.sort_order = i + 1);
    setFaqs(newFaqs);

    // Save reordering
    Promise.all(newFaqs.map(f =>
      fetch('/api/admin/content/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f)
      })
    ));
  };

  const moveDown = (index: number) => {
    if (index === faqs.length - 1) return;
    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];

    // Update sort orders
    newFaqs.forEach((f, i) => f.sort_order = i + 1);
    setFaqs(newFaqs);

    // Save reordering
    Promise.all(newFaqs.map(f =>
      fetch('/api/admin/content/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f)
      })
    ));
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">FAQ Management</h2>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="min-w-[140px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button
              type="button"
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'secondary'}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                type="button"
                size="sm"
                variant={selectedCategory === category ? 'default' : 'secondary'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Add New FAQ Form */}
      {showAddForm && (
        <ScrollReveal>
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="font-heading text-xl font-bold">Add New FAQ</h3>
            </div>

            <div className="space-y-4">
              <FormField
                label="Question"
                value={editForm.question}
                onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                placeholder="e.g., What is the best time to visit Bhutan?"
                required
              />

              <FormField
                label="Answer"
                value={editForm.answer}
                onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                placeholder="Provide a detailed answer..."
                textarea
                rows={4}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-input text-primary focus-visible:ring-ring/50"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active (visible on website)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleSave(editForm)}
                  disabled={saving || !editForm.question || !editForm.answer}
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
                      Save FAQ
                    </>
                  )}
                </Button>
                <Button
                  onClick={cancelEdit}
                  variant="outline"
                  className="min-w-[120px]"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </ScrollReveal>
      )}

      {/* FAQs by Category */}
      <StaggerChildren>
        {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
          <ScrollReveal key={category}>
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="font-heading text-xl font-bold">{category}</h3>
                <p className="text-muted-foreground text-sm">{categoryFaqs.length} questions</p>
              </div>

              <div className="space-y-3">
                {categoryFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl transition-all ${
                      !faq.is_active ? 'bg-muted/30 opacity-60' : 'bg-muted/50'
                    }`}
                  >
                    {editingId === faq.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <FormField
                          label="Question"
                          value={editForm.question}
                          onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                          textarea
                          rows={2}
                        />

                        <FormField
                          label="Answer"
                          value={editForm.answer}
                          onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                          textarea
                          rows={4}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                            >
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2 pt-6">
                            <input
                              type="checkbox"
                              checked={editForm.is_active}
                              onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                              className="w-4 h-4 rounded border-input text-primary"
                            />
                            <label className="text-sm font-medium">Active</label>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleSave(editForm)}
                            disabled={saving}
                            className="min-w-[100px]"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            className="min-w-[100px]"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-1 pt-2">
                          <button
                            onClick={() => moveUp(filteredFaqs.indexOf(faq))}
                            disabled={index === 0}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base mb-2">{faq.question}</h4>
                              <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              {!faq.is_active && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => startEdit(faq)}
                                className="text-primary"
                                title="Edit"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(faq.id!)}
                                className="text-destructive hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </ScrollReveal>
        ))}
      </StaggerChildren>

      {filteredFaqs.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">No FAQs found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Get started by adding your first FAQ.'}
          </p>
        </div>
      )}
    </div>
  );
}