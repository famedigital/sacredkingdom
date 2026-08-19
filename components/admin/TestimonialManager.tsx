'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Loader2, Save, Plus, Trash2, Edit3, Check, X, Star, MessageSquare, ThumbsUp, ThumbsDown, Calendar, Filter, Search } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { StaggerChildren } from '@/components/ui/scroll-reveal';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface Testimonial {
  id?: string;
  clientName: string;
  clientEmail?: string;
  tourName: string;
  rating: number;
  testimonial: string;
  date: string;
  isApproved: boolean;
  isFeatured: boolean;
  response?: string;
  source?: string;
  imageUrl?: string;
}

export function TestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [editForm, setEditForm] = useState<Testimonial>({
    clientName: '',
    tourName: '',
    rating: 5,
    testimonial: '',
    date: new Date().toISOString().split('T')[0],
    isApproved: true,
    isFeatured: false,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from your API
      // For now, using mock data
      const mockTestimonials: Testimonial[] = [
        {
          id: '1',
          clientName: 'Sarah Johnson',
          clientEmail: 'sarah.j@email.com',
          tourName: 'Cultural Triangle Experience',
          rating: 5,
          testimonial: 'An absolutely incredible journey! The guides were knowledgeable and the itinerary was perfectly balanced. Bhutan exceeded all my expectations.',
          date: '2024-01-15',
          isApproved: true,
          isFeatured: true,
          response: 'Thank you so much, Sarah! We\'re thrilled you had an amazing experience exploring Bhutan with us.',
        },
        {
          id: '2',
          clientName: 'Michael Chen',
          clientEmail: 'mchen@email.com',
          tourName: 'Druk Path Trek',
          rating: 5,
          testimonial: 'The trek was challenging but incredibly rewarding. The views of the Himalayas were breathtaking. Our guide Karma was exceptional!',
          date: '2024-02-20',
          isApproved: true,
          isFeatured: true,
        },
        {
          id: '3',
          clientName: 'Emily Rodriguez',
          clientEmail: 'emily.r@email.com',
          tourName: 'Festival Tour',
          rating: 4,
          testimonial: 'Amazing experience during the Paro Tsechu! The cultural insights and access to festivals were unforgettable. Highly recommend.',
          date: '2024-03-10',
          isApproved: true,
          isFeatured: false,
        },
        {
          id: '4',
          clientName: 'David Thompson',
          clientEmail: 'dthompson@email.com',
          tourName: 'Spiritual Bhutan',
          rating: 5,
          testimonial: 'A transformative journey. The monastery visits and meditation sessions were deeply meaningful. Thank you for this spiritual experience.',
          date: '2024-03-25',
          isApproved: false,
          isFeatured: false,
        },
        {
          id: '5',
          clientName: 'Lisa Wang',
          clientEmail: 'lisaw@email.com',
          tourName: 'Cultural Triangle Experience',
          rating: 4,
          testimonial: 'Wonderful trip with great accommodations. The only suggestion would be to spend more time in Punakha.',
          date: '2024-04-05',
          isApproved: false,
          isFeatured: false,
        },
      ];

      setTestimonials(mockTestimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (testimonial: Testimonial) => {
    try {
      setSaving(true);

      // In a real implementation, this would save to your API
      if (testimonial.id) {
        setTestimonials(prev => prev.map(t => t.id === testimonial.id ? testimonial : t));
        toast.success('Testimonial updated successfully!');
        setEditingId(null);
      } else {
        const newTestimonial = { ...testimonial, id: Date.now().toString() };
        setTestimonials(prev => [...prev, newTestimonial]);
        toast.success('Testimonial created successfully!');
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      // In a real implementation, this would delete from your API
      setTestimonials(prev => prev.filter(t => t.id !== id));
      toast.success('Testimonial deleted successfully!');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const approveTestimonial = async (id: string) => {
    try {
      setTestimonials(prev => prev.map(t =>
        t.id === id ? { ...t, isApproved: true } : t
      ));
      toast.success('Testimonial approved and published!');
    } catch (error) {
      console.error('Error approving testimonial:', error);
      toast.error('Failed to approve testimonial');
    }
  };

  const rejectTestimonial = async (id: string) => {
    try {
      setTestimonials(prev => prev.map(t =>
        t.id === id ? { ...t, isApproved: false } : t
      ));
      toast.success('Testimonial rejected and hidden!');
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      toast.error('Failed to reject testimonial');
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      setTestimonials(prev => prev.map(t =>
        t.id === id ? { ...t, isFeatured: !t.isFeatured } : t
      ));
      toast.success('Featured status updated!');
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update featured status');
    }
  };

  const startEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id || null);
    setEditForm(testimonial);
  };

  const resetForm = () => {
    setEditForm({
      clientName: '',
      tourName: '',
      rating: 5,
      testimonial: '',
      date: new Date().toISOString().split('T')[0],
      isApproved: true,
      isFeatured: false,
    });
  };

  // Filter testimonials
  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = !searchQuery ||
      testimonial.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.tourName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.testimonial.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'approved' && testimonial.isApproved) ||
      (filterStatus === 'pending' && !testimonial.isApproved);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: testimonials.length,
    approved: testimonials.filter(t => t.isApproved).length,
    pending: testimonials.filter(t => !t.isApproved).length,
    featured: testimonials.filter(t => t.isFeatured).length,
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
          <h2 className="font-heading text-2xl font-bold">Testimonial Management</h2>
          <p className="text-muted-foreground">Manage customer reviews and testimonials</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="min-w-[140px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-prayer-red">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.featured}</div>
          <div className="text-sm text-muted-foreground">Featured</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-transparent py-2 pr-4 pl-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === 'all' ? 'bg-white shadow-sm' : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === 'approved' ? 'bg-white shadow-sm' : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === 'pending' ? 'bg-white shadow-sm' : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </Card>

      {/* Add New Testimonial Form */}
      {showAddForm && (
        <ScrollReveal>
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold">Add New Testimonial</h3>
              <p className="text-muted-foreground text-sm">Add a customer testimonial manually</p>
            </div>

            <TestimonialForm
              testimonial={editForm}
              onSave={handleSave}
              onCancel={() => {
                setShowAddForm(false);
                resetForm();
              }}
              saving={saving}
            />
          </Card>
        </ScrollReveal>
      )}

      {/* Testimonials List */}
      <StaggerChildren>
        <div className="space-y-4">
          {filteredTestimonials.map((testimonial, index) => (
            <ScrollReveal key={testimonial.id} delay={index * 50}>
              {editingId === testimonial.id ? (
                <Card className="p-6">
                  <TestimonialForm
                    testimonial={editForm}
                    onSave={handleSave}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                  />
                </Card>
              ) : (
                <Card className="hover:shadow-md transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-prayer-red to-monastery-red flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.clientName.charAt(0)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h4 className="font-heading font-bold text-lg">{testimonial.clientName}</h4>
                            <p className="text-sm text-muted-foreground">{testimonial.tourName}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {testimonial.isFeatured && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-0">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {testimonial.isApproved ? (
                              <Badge className="bg-green-100 text-green-700 border-0">
                                <Check className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                                <X className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Testimonial Text */}
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          "{testimonial.testimonial}"
                        </p>

                        {/* Response */}
                        {testimonial.response && (
                          <div className="bg-muted/50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Response:</span> {testimonial.response}
                            </p>
                          </div>
                        )}

                        {/* Date & Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(testimonial.date).toLocaleDateString()}
                          </div>

                          <div className="flex items-center gap-2">
                            {!testimonial.isApproved && (
                              <>
                                <Button
                                  onClick={() => approveTestimonial(testimonial.id!)}
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => rejectTestimonial(testimonial.id!)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <ThumbsDown className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}

                            {testimonial.isApproved && (
                              <Button
                                onClick={() => toggleFeatured(testimonial.id!)}
                                size="sm"
                                variant="outline"
                                className={testimonial.isFeatured ? 'text-yellow-600' : ''}
                              >
                                <Star className="h-3 w-3 mr-1" />
                                {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
                              </Button>
                            )}

                            <Button
                              onClick={() => startEdit(testimonial)}
                              size="sm"
                              variant="outline"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>

                            <Button
                              onClick={() => handleDelete(testimonial.id!)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
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

      {filteredTestimonials.length === 0 && !showAddForm && (
        <div className="py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-2xl font-bold mb-3">No Testimonials Found</h3>
          <p className="text-muted-foreground mb-8 text-lg">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Start collecting customer feedback!'}
          </p>
          {(searchQuery || filterStatus !== 'all') && (
            <Button
              onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
              variant="outline"
              className="min-w-[140px]"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface TestimonialFormProps {
  testimonial: Testimonial;
  onSave: (testimonial: Testimonial) => void;
  onCancel: () => void;
  saving: boolean;
}

function TestimonialForm({ testimonial, onSave, onCancel, saving }: TestimonialFormProps) {
  const [formData, setFormData] = useState<Testimonial>(testimonial);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: keyof Testimonial, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Client Name"
          value={formData.clientName}
          onChange={(e) => updateField('clientName', e.target.value)}
          placeholder="e.g., John Doe"
          required
        />

        <FormField
          label="Email (Optional)"
          type="email"
          value={formData.clientEmail || ''}
          onChange={(e) => updateField('clientEmail', e.target.value)}
          placeholder="client@email.com"
        />
      </div>

      <FormField
        label="Tour Name"
        value={formData.tourName}
        onChange={(e) => updateField('tourName', e.target.value)}
        placeholder="e.g., Cultural Triangle Experience"
        required
      />

      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => updateField('rating', rating)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`h-6 w-6 ${
                  rating <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">({formData.rating}/5)</span>
        </div>
      </div>

      <FormField
        label="Testimonial"
        value={formData.testimonial}
        onChange={(e) => updateField('testimonial', e.target.value)}
        placeholder="Customer's review..."
        textarea
        rows={4}
        required
      />

      <FormField
        label="Response (Optional)"
        value={formData.response || ''}
        onChange={(e) => updateField('response', e.target.value)}
        placeholder="Your response to the testimonial..."
        textarea
        rows={2}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full px-4 py-3 rounded-xl shadow-sm focus:shadow-sm transition-all outline-none bg-white"
            required
          />
        </div>

        <div className="space-y-3 pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isApproved}
              onChange={(e) => updateField('isApproved', e.target.checked)}
              className="w-4 h-4 text-prayer-red rounded"
            />
            <span className="text-sm font-medium">Approved (visible on website)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => updateField('isFeatured', e.target.checked)}
              className="w-4 h-4 text-prayer-red rounded"
            />
            <span className="text-sm font-medium">Featured (show in homepage)</span>
          </label>
        </div>
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
              Save Testimonial
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