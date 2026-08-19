'use client';

import { useState, useEffect } from 'react';
import { Search, Upload, Image as ImageIcon, Check, Loader2, FolderOpen, Grid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MediaItem {
  public_id: string;
  url: string;
  secure_url: string;
  thumbnail_url?: string; // Optimized thumbnail URL
  format: string;
  width: number;
  height: number;
  resource_type: string;
  folder?: string;
  alt_text?: string;
  caption?: string;
  tags?: string[];
  created_at: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  allowedTypes?: ('image' | 'video')[];
  maxSize?: number; // in bytes
  currentFolder?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  allowedTypes = ['image'],
  maxSize = 5 * 1024 * 1024, // 5MB default
  currentFolder = '/',
}: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [folders, setFolders] = useState<string[]>(['All Images', 'tours', 'blog', 'about', 'hero']);
  const [currentFolderFilter, setCurrentFolderFilter] = useState('All Images');

  // Fetch media from API
  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, currentFolderFilter]);

  // Fetch media from Cloudinary via API
  const fetchMedia = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching media from Cloudinary...');

      const response = await fetch('/api/admin/media');

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, error: ${errorData.error || 'Unknown'}`);
      }

      const data = await response.json();
      console.log('📦 API Response data:', data);

      // Normalize Cloudinary items for the picker
      let fetchedMedia = (data.media || data.images || []).map((item: any) => ({
        public_id: item.public_id,
        url: item.url || item.secure_url,
        secure_url: item.secure_url || item.url,
        thumbnail_url: item.thumbnail_url || item.secure_url || item.url,
        format: item.format || 'jpg',
        width: item.width || 0,
        height: item.height || 0,
        resource_type: item.resource_type || item.type || 'image',
        folder: item.public_id?.includes('/') ? item.public_id.split('/')[0] : undefined,
        tags: item.tags || [],
        created_at: item.created_at || new Date().toISOString(),
      }));

      // Filter by folder if specified
      if (currentFolderFilter && currentFolderFilter !== 'All Images') {
        const beforeFilter = fetchedMedia.length;
        const folderName = currentFolderFilter.toLowerCase();
        fetchedMedia = fetchedMedia.filter((item: MediaItem) => {
          // Check if image starts with folder name followed by /
          const pathParts = item.public_id.split('/');
          const imageFolder = pathParts.length > 1 ? pathParts[0] : null;
          return imageFolder === folderName;
        });
        console.log(`🔍 Filtered to ${fetchedMedia.length} images (from ${beforeFilter}) for folder: ${currentFolderFilter}`);
      }

      // Filter by allowed types (skip type filtering since Cloudinary returns different types)
      // Most Cloudinary images are 'image' type but the filtering might be too strict
      const beforeTypeFilter = fetchedMedia.length;
      // fetchedMedia = fetchedMedia.filter((item: MediaItem) =>
      //   allowedTypes.includes(item.resource_type as any)
      // );
      console.log(`🎯 Skipped type filtering to show all ${fetchedMedia.length} images`);

      setMedia(fetchedMedia);
      setFilteredMedia(fetchedMedia);

      if (fetchedMedia.length === 0) {
        console.warn('⚠️ No images found after filtering');
      }
    } catch (error) {
      console.error('❌ Error fetching media:', error);
      // Set empty arrays on error to prevent crashes
      setMedia([]);
      setFilteredMedia([]);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMedia(media);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = media.filter((item) =>
        item.public_id.toLowerCase().includes(query) ||
        item.alt_text?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
      setFilteredMedia(filtered);
    }
  }, [searchQuery, media]);

  // Handle file upload
  const handleUpload = async (files: FileList) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // Validate file size
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        continue;
      }

      // Validate file type
      if (!allowedTypes.includes(file.type.split('/')[0] as any)) {
        alert(`File type ${file.type} is not allowed`);
        continue;
      }

      try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', currentFolderFilter === 'All Images' ? 'sacred-himalaya' : currentFolderFilter);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const result = await response.json();
        console.log('Upload successful:', result);

        // Refresh media list after upload
        await fetchMedia();
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload file');
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  // Handle media selection
  const toggleSelection = (publicId: string) => {
    const newSelection = new Set(selectedMedia);
    if (newSelection.has(publicId)) {
      newSelection.delete(publicId);
    } else {
      if (!multiple) {
        newSelection.clear(); // Clear previous selection for single select
      }
      newSelection.add(publicId);
    }
    setSelectedMedia(newSelection);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    // Prefer full library, fall back to filtered view so search selections still resolve
    const pool = media.length > 0 ? media : filteredMedia;
    const selectedItems = pool
      .filter((item) => selectedMedia.has(item.public_id))
      .map((item) => ({
        ...item,
        secure_url: item.secure_url || item.url,
        url: item.url || item.secure_url,
        thumbnail_url: item.thumbnail_url || item.secure_url || item.url,
      }))
      .filter((item) => Boolean(item.secure_url || item.url));

    if (selectedItems.length === 0) return;

    if (multiple) {
      onSelect(selectedItems);
    } else {
      onSelect(selectedItems[0]);
    }

    handleClose();
  };

  // Handle close
  const handleClose = () => {
    setSelectedMedia(new Set());
    setSearchQuery('');
    onClose();
  };

  // Get unique folders from media
  const getAvailableFolders = () => {
    const folderSet = new Set<string>();
    media.forEach(item => {
      if (item.folder) folderSet.add(item.folder);
    });
    return Array.from(folderSet).sort();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="flex max-h-[90dvh] w-[calc(100vw-1rem)] max-w-4xl flex-col overflow-x-hidden overflow-y-auto p-3 sm:w-full sm:max-w-4xl sm:p-6" showCloseButton>
        <DialogHeader className="pr-8">
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
      <div className="min-w-0 space-y-4 sm:space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Folder Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          {folders.map((folder) => (
            <Button
              key={folder}
              type="button"
              size="sm"
              variant={currentFolderFilter === folder ? 'default' : 'outline'}
              onClick={() => setCurrentFolderFilter(folder)}
              className="whitespace-nowrap"
            >
              {folder === '/' ? 'All Files' : folder}
            </Button>
          ))}
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            multiple
            accept={allowedTypes.map(type => `${type}/*`).join(',')}
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="hidden"
            id="media-upload"
            disabled={uploading}
          />
          <label
            htmlFor="media-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  {allowedTypes.join(', ')} • Max {maxSize / 1024 / 1024}MB
                </p>
              </>
            )}
          </label>
        </div>

        {/* Media Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-3 text-muted-foreground">Loading media...</span>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No media found. Upload some files to get started!</p>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto'
            : 'space-y-2 max-h-96 overflow-y-auto'
          }>
            <AnimatePresence>
              {filteredMedia.map((item) => (
                <motion.div
                  key={item.public_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => toggleSelection(item.public_id)}
                  className={cn(
                    'relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300',
                    selectedMedia.has(item.public_id)
                      ? 'ring-2 ring-primary shadow-md'
                      : 'border border-border hover:shadow-md'
                  )}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <img
                        src={item.thumbnail_url || item.secure_url || item.url}
                        alt={item.alt_text || item.public_id}
                        className="h-32 w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const el = e.currentTarget;
                          const fallback = item.secure_url || item.url;
                          if (fallback && el.src !== fallback) el.src = fallback;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-xs truncate">{item.public_id.split('/').pop()}</p>
                          <p className="text-white/70 text-xs">
                            {item.width} × {item.height}
                          </p>
                        </div>
                      </div>
                      {selectedMedia.has(item.public_id) && (
                        <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-4 p-3 bg-card rounded-xl border border-border">
                      <img
                        src={item.secure_url}
                        alt={item.alt_text || item.public_id}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.public_id.split('/').pop()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.width} × {item.height} • {item.format.toUpperCase()}
                        </p>
                      </div>
                      {selectedMedia.has(item.public_id) && (
                        <div className="bg-primary rounded-full p-1">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedMedia.size > 0 && (
              <>
                {selectedMedia.size} {selectedMedia.size === 1 ? 'item' : 'items'} selected
              </>
            )}
          </p>
          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedMedia.size === 0}
              className="flex-1 sm:flex-none"
            >
              {selectedMedia.size > 0 ? (
                <>
                  {multiple ? `Insert ${selectedMedia.size} items` : 'Insert selected'}
                </>
              ) : (
                'Select'
              )}
            </Button>
          </div>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}