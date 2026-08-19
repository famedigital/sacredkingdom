'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { MediaPickerModal } from './MediaPickerModal';
import { RichTextEditor, type RichTextEditorHandle } from './RichTextEditor';
import { FormField, FormTextarea } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { BlogMarkdown } from '@/components/public/BlogMarkdown';
import { estimateReadTimeMinutes } from '@/lib/blog-content';
import {
  Save,
  Eye,
  Image as ImageIcon,
  FileText,
  Search,
  Calendar,
  User,
  Tag,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  featured_image_public_id?: string;
  category: string;
  tags: string[];
  author_name: string;
  author_bio?: string;
  is_published: boolean;
  published_date?: string;
  read_time?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
}

interface BlogEditorProps {
  post?: BlogPost;
  postId?: string;
  isNewPost?: boolean;
  onSave?: (post: BlogPost) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Blog editor with a Google Docs–style rich text writing experience.
 */
export function BlogEditor({ post, postId, isNewPost, onSave, onCancel }: BlogEditorProps) {
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [formData, setFormData] = useState<BlogPost>(
    post || {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: '',
      tags: [],
      author_name: '',
      is_published: false,
    }
  );

  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<'featured' | 'insert'>('featured');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [seoPreview, setSeoPreview] = useState(false);
  const [contentReady, setContentReady] = useState(Boolean(isNewPost || post));

  // Auto-fill author from logged-in admin
  useEffect(() => {
    if (!isNewPost && formData.author_name) return;
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.name && !formData.author_name) {
          setFormData((prev) => ({ ...prev, author_name: data.user.name }));
        }
      })
      .catch(() => {});
  }, [isNewPost]);

  // Fetch post data when postId is provided (editing existing post)
  useEffect(() => {
    if (post) {
      setFormData(post);
      setContentReady(true);
      return;
    }
    if (postId && !post) {
      const fetchPost = async () => {
        try {
          const response = await fetch(`/api/admin/blog/${postId}`);
          if (response.ok) {
            const postData = await response.json();
            setFormData(postData);
            setContentReady(true);
          } else {
            console.error('Failed to fetch blog post');
            toast.error('Failed to load blog post');
          }
        } catch (error) {
          console.error('Error fetching blog post:', error);
          toast.error('Failed to load blog post');
        }
      };

      fetchPost();
    }
  }, [postId, post]);

  // Auto-save status indicator (local UX only)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (autoSaveStatus === 'unsaved') {
        setAutoSaveStatus('saving');
        setTimeout(() => setAutoSaveStatus('saved'), 600);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSaveStatus]);

  const handleChange = (field: keyof BlogPost, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setAutoSaveStatus('unsaved');
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    handleChange('title', value);
    const newSlug = generateSlug(value);
    if (!formData.slug || formData.slug === '' || generateSlug(formData.title) === formData.slug) {
      handleChange('slug', newSlug);
    }
  };

  const handleMediaSelect = (media: unknown) => {
    if (mediaPickerMode === 'insert') {
      const items = Array.isArray(media) ? media : [media];
      items.forEach((m: { alt_text?: string; name?: string; secure_url?: string; url?: string }) => {
        const url = m.secure_url || m.url;
        if (url) {
          editorRef.current?.insertImage(url, m.alt_text || m.name || 'Image');
        }
      });
    } else {
      const item = (Array.isArray(media) ? media[0] : media) as {
        secure_url?: string;
        url?: string;
        public_id?: string;
      } | null;
      if (item) {
        handleChange('featured_image', item.secure_url || item.url);
        handleChange('featured_image_public_id', item.public_id);
      }
    }
    setShowMediaPicker(false);
  };

  const openFeaturedPicker = () => {
    setMediaPickerMode('featured');
    setShowMediaPicker(true);
  };

  const openInsertPicker = () => {
    setMediaPickerMode('insert');
    setShowMediaPicker(true);
  };

  const handleSave = async (publish: boolean = false) => {
    try {
      setSaving(true);
      const postToSave = {
        ...formData,
        is_published: publish,
        read_time: estimateReadTimeMinutes(formData.content),
        published_date:
          publish && !formData.published_date ? new Date().toISOString() : formData.published_date,
      };

      if (onSave) {
        await onSave(postToSave);
        if (publish) {
          toast.success('Post published successfully!', {
            description: 'Your blog post is now live.',
            duration: 4000,
          });
        } else {
          toast.success('Draft saved successfully!', {
            description: 'Your changes have been saved.',
            duration: 3000,
          });
        }
      } else {
        const url = isNewPost ? '/api/admin/blog' : `/api/admin/blog/${postId}`;
        const method = isNewPost ? 'POST' : 'PUT';

        const { authFetch } = await import('@/lib/auth/fetch');
        const response = await authFetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postToSave),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to save blog post');
        }

        if (publish) {
          toast.success('Post published successfully!', {
            description: 'Your blog post is now live.',
            duration: 4000,
            action: {
              label: 'View Post',
              onClick: () => window.open(`/blog/${postToSave.slug}`, '_blank'),
            },
          });
        } else {
          toast.success('Draft saved successfully!', {
            description: 'Your changes have been saved.',
            duration: 3000,
          });
        }

        if (isNewPost && onCancel) {
          setTimeout(() => onCancel(), 1500);
        }
      }
    } catch (error: unknown) {
      console.error('Save error:', error);
      toast.error('Failed to save blog post', {
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while saving. Please try again.',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    'Travel Guide',
    'Cultural',
    'Festival',
    'Trekking',
    'Adventure',
    'Spiritual',
    'Food & Culture',
  ];

  const SEOPreview = () => (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
            {formData.featured_image ? (
              <img
                src={formData.featured_image}
                alt=""
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-primary hover:underline">
              sacredkingdom.travel/journal/{formData.slug || 'your-post-slug'}
            </p>
            <p className="truncate font-medium text-foreground">
              {formData.meta_title || formData.title || 'Your Post Title'}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {formData.meta_description ||
                formData.excerpt ||
                'Your post description will appear here...'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-sm ${
              autoSaveStatus === 'saved'
                ? 'text-green-600'
                : autoSaveStatus === 'saving'
                  ? 'text-amber-600'
                  : 'text-muted-foreground'
            }`}
          >
            {autoSaveStatus === 'saved' && <CheckCircle className="h-4 w-4" />}
            {autoSaveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
            {autoSaveStatus === 'unsaved' && <XCircle className="h-4 w-4" />}
            <span className="hidden xs:inline">
              {autoSaveStatus === 'saved'
                ? 'All changes saved'
                : autoSaveStatus === 'saving'
                  ? 'Saving...'
                  : 'Unsaved changes'}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex-1 text-xs sm:flex-none sm:text-sm"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>

          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              className="flex-1 text-xs sm:flex-none sm:text-sm"
            >
              Cancel
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex-1 text-xs sm:flex-none sm:text-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="hidden sm:inline">Save Draft</span>
            <span className="sm:hidden">Draft</span>
          </Button>

          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex-1 text-xs sm:flex-none sm:text-sm"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {formData.is_published ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            <div className="space-y-4">
              <FormField
                label="Post Title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter your post title..."
                className="text-2xl font-bold"
              />

              <FormField
                label="Short summary (shown on blog list)"
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                placeholder="One or two sentences about this post..."
              />

              <details className="rounded-lg border border-border bg-card px-4 py-3">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  Advanced: web address (URL slug)
                </summary>
                <div className="mt-3">
                  <FormField
                    label="URL Slug"
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="your-post-slug"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Created automatically from the title. Only change this if you need a custom
                    link.
                  </p>
                </div>
              </details>
            </div>

            {contentReady ? (
              <RichTextEditor
                key={formData.id || postId || 'new-post'}
                ref={editorRef}
                content={formData.content}
                onChange={(html) => handleChange('content', html)}
                onRequestImage={openInsertPicker}
                placeholder="Start writing your story here… Use the toolbar above to bold, add headings, lists, and images — just like Google Docs."
              />
            ) : (
              <div className="flex min-h-[480px] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading post…
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <label className="mb-3 block text-sm font-medium">Cover image</label>
                <button
                  type="button"
                  onClick={openFeaturedPicker}
                  className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary/50"
                >
                  {formData.featured_image ? (
                    <img
                      src={formData.featured_image}
                      alt="Featured"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to add image</span>
                    </>
                  )}
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <label className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <label className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  Tags
                </label>
                <Input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) =>
                    handleChange(
                      'tags',
                      e.target.value.split(',').map((t) => t.trim())
                    )
                  }
                  placeholder="Enter tags separated by commas"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <label className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Author
                </label>
                <FormField
                  value={formData.author_name}
                  onChange={(e) => handleChange('author_name', e.target.value)}
                  placeholder="Author name (auto from login)"
                  readOnly
                  className="bg-muted/50"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Set automatically from your admin account
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <label className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Publishing
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={formData.is_published}
                      onCheckedChange={(checked) =>
                        handleChange('is_published', checked === true)
                      }
                    />
                    Published post
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <button
                  type="button"
                  onClick={() => setSeoPreview(!seoPreview)}
                  className="mb-3 flex items-center gap-2 text-sm font-medium"
                >
                  <Search className="h-4 w-4" />
                  SEO Preview
                </button>
                {seoPreview && (
                  <div className="space-y-3">
                    <FormField
                      label="SEO Title"
                      value={formData.meta_title || ''}
                      onChange={(e) => handleChange('meta_title', e.target.value)}
                      placeholder="Custom SEO title"
                    />
                    <FormTextarea
                      label="Meta Description"
                      value={formData.meta_description || ''}
                      onChange={(e) => handleChange('meta_description', e.target.value)}
                      placeholder="Meta description for search engines"
                      rows={3}
                    />
                    <SEOPreview />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimated read time:</span>
                  <span className="font-medium">
                    {estimateReadTimeMinutes(formData.content)} min
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8">
            <h1 className="mb-4 text-4xl font-bold">{formData.title}</h1>
            <div className="mb-8 flex items-center gap-4 text-sm text-muted-foreground">
              <span>By {formData.author_name}</span>
              <span>•</span>
              <span>{formData.category}</span>
              <span>•</span>
              <span>{estimateReadTimeMinutes(formData.content)} min read</span>
            </div>
            {formData.featured_image && (
              <img
                src={formData.featured_image}
                alt={formData.title}
                className="mb-8 h-96 w-full rounded-xl object-cover"
              />
            )}
            <BlogMarkdown content={formData.content} />
          </CardContent>
        </Card>
      )}

      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        multiple={mediaPickerMode === 'insert'}
        allowedTypes={['image']}
        currentFolder="blog"
      />
    </div>
  );
}
