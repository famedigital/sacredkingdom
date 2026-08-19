'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Clock,
  TrendingUp,
  MapPin,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TourForm } from '@/components/admin/TourForm';
import { TourClientsPanel } from '@/components/admin/TourClientsPanel';
import { formatTourPrice, isTourPriceVisible } from '@/lib/tour-options';
import { authFetch } from '@/lib/auth/fetch';

interface Tour {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  hero_image_url: string;
  thumbnail_url: string;
  category: string;
  duration: number;
  price: number;
  show_price?: boolean | null;
  difficulty_level: string;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  created_at: string;
  [key: string]: unknown;
}

type TourCategory = { slug: string; name: string };

export function TourManagement() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTours, setSelectedTours] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'bulk' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clientsTour, setClientsTour] = useState<Tour | null>(null);
  const [categories, setCategories] = useState<TourCategory[]>([
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
          setCategories(
            data.categories.map((c: { slug: string; name: string }) => ({
              slug: c.slug,
              name: c.name,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchTours();
  }, [filterCategory, filterStatus, searchQuery]);

  const categoryLabel = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name || slug;

  const fetchTours = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);

      const response = await authFetch(`/api/admin/tours?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch tours');
      setTours(data.tours || []);
    } catch (error) {
      console.error('Failed to fetch tours:', error);
      toast.error('Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: Record<string, unknown>) => {
    const response = await authFetch('/api/admin/tours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create tour');
    }
    await fetchTours();
    setShowCreateModal(false);
  };

  const handleUpdate = async (formData: Record<string, unknown>) => {
    if (!editingTour) return;
    const response = await authFetch(`/api/admin/tours/${editingTour.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update tour');
    }
    await fetchTours();
    setShowEditModal(false);
    setEditingTour(null);
  };

  const openEditModal = async (tour: Tour) => {
    setEditLoading(true);
    setShowEditModal(true);
    try {
      const response = await authFetch(`/api/admin/tours/${tour.id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load tour');
      setEditingTour(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load tour';
      toast.error(message);
      setShowEditModal(false);
      setEditingTour(null);
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget === 'bulk') {
        await Promise.all(
          Array.from(selectedTours).map((id) =>
            authFetch(`/api/admin/tours/${id}`, { method: 'DELETE' })
          )
        );
        setSelectedTours(new Set());
        toast.success('Tours deleted');
      } else if (deleteId) {
        const response = await authFetch(`/api/admin/tours/${deleteId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Delete failed');
        toast.success('Tour deleted');
      }
      await fetchTours();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete');
    } finally {
      setDeleteTarget(null);
      setDeleteId(null);
    }
  };

  const toggleSelectTour = (id: string) => {
    const next = new Set(selectedTours);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTours(next);
  };

  const selectAll = () => {
    if (selectedTours.size === tours.length) {
      setSelectedTours(new Set());
    } else {
      setSelectedTours(new Set(tours.map((t) => t.id)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">Tour packages</h2>
          <p className="mt-1 text-sm text-muted-foreground">{tours.length} tours</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4" />
          Add New Tour
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {selectedTours.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteTarget('bulk')}
            >
              <Trash2 className="size-4" />
              Delete ({selectedTours.size})
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : tours.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-full flex items-center gap-2 p-2">
            <input
              type="checkbox"
              checked={selectedTours.size === tours.length && tours.length > 0}
              onChange={selectAll}
              className="size-4 rounded border-input"
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>

          {tours.map((tour) => (
            <div
              key={tour.id}
              className={`relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md ${
                selectedTours.has(tour.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedTours.has(tour.id)}
                  onChange={() => toggleSelectTour(tour.id)}
                  className="size-4 rounded border-input"
                />
              </div>

              <div className="relative h-48">
                <img
                  src={tour.hero_image_url || tour.thumbnail_url || '/placeholder.jpg'}
                  alt={tour.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                  <span className="rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium ring-1 ring-border backdrop-blur-sm">
                    {categoryLabel(tour.category)}
                  </span>
                  {tour.is_featured && (
                    <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                      Featured
                    </span>
                  )}
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-medium text-white ${
                      tour.is_active ? 'bg-emerald-600' : 'bg-muted-foreground'
                    }`}
                  >
                    {tour.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="absolute right-3 bottom-3 rounded-md bg-card px-3 py-1 ring-1 ring-border">
                  <div className="text-lg font-semibold text-primary">
                    {isTourPriceVisible(tour)
                      ? formatTourPrice(tour.price, tour.category)
                      : 'Hidden'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isTourPriceVisible(tour) ? 'per person' : 'not shown publicly'}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h3 className="mb-2 line-clamp-2 font-heading text-lg font-semibold">{tour.title}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{tour.tagline}</p>

                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-4" />
                    <span>{tour.duration}d</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="size-4" />
                    <span className="capitalize">{tour.difficulty_level}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="size-4" />
                    <span>{tour.view_count}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-border pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`/tours/${tour.slug}`, '_blank')}
                  >
                    <Eye className="size-4" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(tour)}
                  >
                    <Edit className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setClientsTour(tour)}
                  >
                    <Users className="size-4" />
                    Clients
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setDeleteId(tour.id);
                      setDeleteTarget('single');
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-card py-12 text-center ring-1 ring-foreground/10">
          <MapPin className="mx-auto mb-4 size-12 text-muted-foreground/40" />
          <h3 className="mb-2 font-heading text-lg font-medium">No tours found</h3>
          <p className="mb-6 text-sm text-muted-foreground">Create your first tour to get started</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="size-4" />
            Create Tour
          </Button>
        </div>
      )}

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent
          className="flex max-h-[92dvh] w-[calc(100vw-1rem)] max-w-6xl flex-col gap-3 overflow-x-hidden overflow-y-auto p-3 sm:w-full sm:max-w-6xl sm:p-6"
          showCloseButton
        >
          <DialogHeader className="pr-8">
            <DialogTitle>Create New Tour</DialogTitle>
          </DialogHeader>
          <div className="min-w-0">
            <TourForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!clientsTour} onOpenChange={(open) => !open && setClientsTour(null)}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-1rem)] max-w-3xl overflow-y-auto sm:w-full">
          <DialogHeader>
            <DialogTitle>Tour clients</DialogTitle>
          </DialogHeader>
          {clientsTour ? (
            <TourClientsPanel tourId={clientsTour.id} tourTitle={clientsTour.title} />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setEditingTour(null);
        }}
      >
        <DialogContent
          className="flex max-h-[92dvh] w-[calc(100vw-1rem)] max-w-6xl flex-col gap-3 overflow-x-hidden overflow-y-auto p-3 sm:w-full sm:max-w-6xl sm:p-6"
          showCloseButton
        >
          <DialogHeader className="pr-8">
            <DialogTitle>Edit Tour</DialogTitle>
          </DialogHeader>
          {editLoading || !editingTour ? (
            <div className="flex h-48 items-center justify-center">
              <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="min-w-0">
              <TourForm
                key={editingTour.id}
                tour={editingTour}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditingTour(null);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tour{deleteTarget === 'bulk' ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget === 'bulk'
                ? `This will permanently delete ${selectedTours.size} selected tour(s).`
                : 'This will permanently delete this tour. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
