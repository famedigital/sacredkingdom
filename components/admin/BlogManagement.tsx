'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, Clock, Star, Loader2, FileText } from 'lucide-react';
import { BlogEditor } from './BlogEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authFetch } from '@/lib/auth/fetch';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string; // Keep as featured_image for consistency with BlogEditor
  featured_image_public_id?: string;
  author_name: string; // Changed from author to match BlogEditor interface
  author_bio?: string;
  category: string;
  tags: string[];
  published_date?: string;
  is_published: boolean;
  read_time?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  views?: number;
  created_at?: string;
}

export function BlogManagement() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, [filterStatus, filterCategory, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await authFetch(`/api/admin/blog?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error: any) {
      console.error('Failed to fetch blog posts:', error);
      setError(error.message || 'An error occurred while fetching posts');
      toast.error('Failed to load blog posts', {
        description: error.message || 'Please try again later',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPosts.size === 0) {
      toast.error('No posts selected', {
        description: 'Please select at least one post to delete.',
        duration: 3000,
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedPosts.size} post(s)?`)) {
      return;
    }

    try {
      // Add all selected posts to deleting state
      setDeleting(new Set(selectedPosts));

      const deletePromises = Array.from(selectedPosts).map(async (id) => {
        const response = await authFetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to delete post ${id}`);
        }
        return id;
      });

      await Promise.all(deletePromises);

      setSelectedPosts(new Set());
      await fetchPosts();

      toast.success(`${selectedPosts.size} post(s) deleted successfully!`, {
        description: 'The posts have been removed.',
        duration: 4000,
      });
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete posts', {
        description: error.message || 'An error occurred while deleting. Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleting(new Set());
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      // Add to deleting state
      setDeleting(new Set([id]));

      const response = await authFetch(`/api/admin/blog/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete post');
      }

      await fetchPosts();

      toast.success('Post deleted successfully!', {
        description: 'The post has been removed.',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete post', {
        description: error.message || 'An error occurred while deleting. Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleting(new Set());
    }
  };

  const toggleSelectPost = (id: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPosts(newSelected);
  };

  const selectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map(p => p.id)));
    }
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished
      ? 'text-green-700 bg-green-500/10 dark:text-green-400'
      : 'text-amber-700 bg-amber-500/10 dark:text-amber-400';
  };

  const selectClassName =
    'flex h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30';

  return (
        <Card className="transition-shadow">
      <CardContent className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">{posts.length} posts</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button type="button" variant="outline" className="hidden sm:flex">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button type="button" onClick={() => router.push('/admin/blog/new')}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Post</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={selectClassName}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={selectClassName}
          >
            <option value="all">All Categories</option>
            <option value="travel">Travel</option>
            <option value="culture">Culture</option>
            <option value="trekking">Trekking</option>
            <option value="festival">Festival</option>
          </select>

          {/* Actions */}
          {selectedPosts.size > 0 && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Delete ({selectedPosts.size})</span>
              <span className="sm:hidden">Del ({selectedPosts.size})</span>
            </Button>
          )}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading blog posts...</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <p className="text-destructive">{error}</p>
            <Button type="button" variant="outline" className="mt-4" onClick={() => fetchPosts()}>
              Try Again
            </Button>
          </div>
      ) : posts.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="cursor-pointer transition-shadow hover:shadow-md py-0"
              onClick={() => window.location.href = `/admin/blog/${post.id}`}
            >
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl flex-shrink-0 bg-primary">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm sm:text-base truncate">{post.title}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">{post.excerpt}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={`${getStatusColor(post.is_published)} text-xs`}>
                      {post.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">{formatDate(post.published_date || post.created_at || 'No date')}</span>
                    <span className="xs:hidden">{new Date(post.published_date || post.created_at || 'No date').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    {post.views} views
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/admin/blog/${post.id}`;
                    }}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/admin/blog/${post.id}`;
                    }}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post.id);
                    }}
                    disabled={deleting.has(post.id)}
                    className="text-destructive hover:text-destructive"
                    title="Delete"
                  >
                    {deleting.has(post.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>No blog posts yet. Create your first blog post to get started!</p>
          <Button type="button" className="mt-4 mx-auto" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Create Your First Post
          </Button>
        </div>
      )}

      {/* Create Post Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => { if (!open) setShowCreateModal(false); }}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto w-full" showCloseButton>
          <DialogHeader>
            <DialogTitle>Create New Blog Post</DialogTitle>
          </DialogHeader>
        <div className="h-full overflow-y-auto">
          <BlogEditor
            isNewPost={true}
            onSave={async (post) => {
              try {
                const response = await authFetch('/api/admin/blog', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(post),
                });

                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  throw new Error(errorData.error || 'Failed to create blog post');
                }

                await fetchPosts();
                setShowCreateModal(false);
                toast.success('Blog post created successfully!', {
                  description: 'Your new post has been added.',
                  duration: 4000,
                });
              } catch (error: any) {
                console.error('Create error:', error);
                toast.error('Failed to create blog post', {
                  description: error.message || 'An error occurred while creating. Please try again.',
                  duration: 5000,
                });
                throw error;
              }
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Modal */}
      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowEditModal(false);
            setEditingPost(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto w-full" showCloseButton>
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>
        <div className="h-full overflow-y-auto">
          {editingPost && (
            <BlogEditor
              post={editingPost}
              postId={editingPost.id}
              isNewPost={false}
              onSave={async (post) => {
                try {
                  const response = await authFetch(`/api/admin/blog/${editingPost.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(post),
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to update blog post');
                  }

                  await fetchPosts();
                  setShowEditModal(false);
                  setEditingPost(null);
                  toast.success('Blog post updated successfully!', {
                    description: 'Your changes have been saved.',
                    duration: 4000,
                  });
                } catch (error: any) {
                  console.error('Update error:', error);
                  toast.error('Failed to update blog post', {
                    description: error.message || 'An error occurred while updating. Please try again.',
                    duration: 5000,
                  });
                  throw error;
                }
              }}
              onCancel={() => {
                setShowEditModal(false);
                setEditingPost(null);
              }}
            />
          )}
        </div>
        </DialogContent>
      </Dialog>
      </CardContent>
    </Card>
  );
}
