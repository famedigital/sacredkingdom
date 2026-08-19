'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Loader2,
  Image as ImageIcon,
  Check,
  Square,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authFetch } from '@/lib/auth/fetch';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  public_id: string;
  url: string;
  secure_url: string;
  thumbnail_url?: string;
  name?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  created_at?: string;
}

export function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/admin/media?maxResults=200');
      if (!response.ok) throw new Error('Failed to load media');
      const data = await response.json();
      const items = (data.media || data.images || []).map(
        (item: Record<string, string | number | undefined>) => ({
          ...item,
          id: String(item.id || item.public_id),
          public_id: String(item.public_id),
          secure_url: String(item.secure_url || item.url || ''),
          url: String(item.url || item.secure_url || ''),
          thumbnail_url: item.thumbnail_url
            ? String(item.thumbnail_url)
            : undefined,
          name: item.name ? String(item.name) : undefined,
        })
      ) as MediaItem[];
      setMedia(items);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load media library');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const filtered = media.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.public_id.toLowerCase().includes(q) ||
      (item.name || '').toLowerCase().includes(q)
    );
  });

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((item) => selected.has(item.public_id));

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'sacred-himalaya');
        const response = await authFetch('/api/upload', { method: 'POST', body: formData });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error || `Failed to upload ${file.name}`);
        }
      }
      toast.success(`Uploaded ${files.length} image${files.length === 1 ? '' : 's'}`);
      await fetchMedia();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deletePublicIds = async (publicIds: string[]) => {
    if (publicIds.length === 0) return;
    const label =
      publicIds.length === 1
        ? 'Delete this image from Cloudinary?'
        : `Delete ${publicIds.length} images from Cloudinary? This cannot be undone.`;
    if (!confirm(label)) return;

    setDeleting(true);
    try {
      const res = await authFetch('/api/admin/media/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || 'Delete failed');
      }

      const failed = (data as { failed?: unknown[] }).failed;
      if (Array.isArray(failed) && failed.length > 0) {
        toast.warning(
          `Deleted ${(data as { deleted?: number }).deleted || 0}; ${failed.length} failed`
        );
      } else {
        toast.success((data as { message?: string }).message || 'Deleted');
      }

      setSelected((prev) => {
        const next = new Set(prev);
        publicIds.forEach((id) => next.delete(id));
        return next;
      });
      await fetchMedia();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSelected = () => deletePublicIds(Array.from(selected));

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success('URL copied');
  };

  const toggle = (id: string) => {
    setSelectionMode(true);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectionMode(true);
    setSelected(new Set(filtered.map((item) => item.public_id)));
  };

  const clearSelection = () => {
    setSelected(new Set());
    setSelectionMode(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images..."
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filtered.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={allFilteredSelected ? clearSelection : selectAllFiltered}
            >
              {allFilteredSelected ? (
                <>
                  <CheckSquare className="size-4" />
                  Clear selection
                </>
              ) : (
                <>
                  <Square className="size-4" />
                  Select all ({filtered.length})
                </>
              )}
            </Button>
          )}

          {selected.size > 0 && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete ({selected.size})
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <p className="text-sm text-muted-foreground">
          {selected.size} selected — tap images to add/remove, or use Delete.
        </p>
      )}

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          <Loader2 className="mx-auto mb-3 size-8 animate-spin" />
          Loading media…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <ImageIcon className="mx-auto mb-3 size-12 opacity-40" />
          <p className="font-medium">No images yet</p>
          <p className="mt-1 text-sm">Upload images to use across blog, hero, and tours.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => {
            const isSelected = selected.has(item.public_id);
            return (
              <div
                key={item.public_id}
                className={cn(
                  'group relative overflow-hidden rounded-xl border bg-card',
                  isSelected ? 'border-primary ring-2 ring-primary' : 'border-border'
                )}
              >
                <button
                  type="button"
                  className="block aspect-square w-full"
                  onClick={() => toggle(item.public_id)}
                  title={selectionMode || isSelected ? 'Toggle selection' : 'Select image'}
                >
                  <img
                    src={item.thumbnail_url || item.secure_url}
                    alt={item.name || item.public_id}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>

                <div
                  className={cn(
                    'absolute top-2 left-2 flex size-6 items-center justify-center rounded-md border bg-background/90',
                    isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  )}
                >
                  {isSelected ? <Check className="size-3.5" /> : null}
                </div>

                <div className="flex items-center gap-1 p-2">
                  <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {item.name || item.public_id}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copyUrl(item.secure_url)}
                    title="Copy URL"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    disabled={deleting}
                    onClick={() => deletePublicIds([item.public_id])}
                    title="Delete image"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
