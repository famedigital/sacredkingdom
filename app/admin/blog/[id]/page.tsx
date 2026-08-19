'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated and fetch post data
    const initialize = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/auth/me');
        if (!authResponse.ok) {
          // Try to refresh token
          console.log('Auth check failed, trying to refresh token...');
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
          });

          if (!refreshResponse.ok) {
            router.push('/admin/login');
            return;
          }
        }

        // Fetch post data
        const postId = params.id as string;
        const postResponse = await fetch(`/api/admin/blog/${postId}`);
        if (postResponse.ok) {
          const postData = await postResponse.json();
          setPost(postData);
        } else {
          setError('Failed to load blog post');
        }
      } catch (error) {
        console.error('Initialization failed:', error);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [params.id, router]);

  const handleCancel = () => {
    router.push('/admin/blog');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="ml-3">Loading blog post...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleCancel}>Back to Blog</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const postId = params.id as string;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="03"
          section="Content"
          title="Edit journal post"
          description={post ? `Editing: ${post.title}` : undefined}
          actions={
            <Button onClick={handleCancel} variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          }
        />

        {/* Editor */}
        <BlogEditor post={post} postId={postId} onCancel={handleCancel} />
      </div>
    </AdminLayout>
  );
}
