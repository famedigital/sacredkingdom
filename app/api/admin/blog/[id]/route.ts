import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAuthError, requireAuth } from '@/lib/auth/require-auth';

function revalidateBlogPages(slug?: string | null) {
  revalidatePath('/blog');
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...post,
      featured_image: post.featured_image_url,
      is_published: post.status === 'published',
      published_date: post.published_at,
    });
  } catch (error) {
    console.error('Blog post fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const { is_featured, ...cleanBody } = body;
    const updateData: Record<string, unknown> = { updated_by: auth.userId };

    if (cleanBody.title !== undefined) updateData.title = cleanBody.title;
    if (cleanBody.slug !== undefined) updateData.slug = cleanBody.slug;
    if (cleanBody.content !== undefined) updateData.content = cleanBody.content;
    if (cleanBody.excerpt !== undefined) updateData.excerpt = cleanBody.excerpt;
    if (cleanBody.author_name !== undefined) updateData.author_name = cleanBody.author_name;
    if (cleanBody.author_bio !== undefined) updateData.author_bio = cleanBody.author_bio;
    if (cleanBody.category !== undefined) updateData.category = cleanBody.category;
    if (cleanBody.tags !== undefined) updateData.tags = cleanBody.tags;
    if (cleanBody.meta_description !== undefined) updateData.meta_description = cleanBody.meta_description;
    if (cleanBody.meta_keywords !== undefined) updateData.meta_keywords = cleanBody.meta_keywords;
    if (cleanBody.read_time !== undefined) updateData.read_time = cleanBody.read_time;
    if (cleanBody.featured_image !== undefined) updateData.featured_image_url = cleanBody.featured_image;
    if (cleanBody.featured_image_public_id !== undefined) {
      updateData.featured_image_public_id = cleanBody.featured_image_public_id;
    }

    if (cleanBody.is_published !== undefined) {
      updateData.status = cleanBody.is_published ? 'published' : 'draft';
    } else if (cleanBody.status !== undefined) {
      updateData.status = cleanBody.status;
    }

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: currentPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, slug, published_at')
      .eq('id', id)
      .single();

    if (fetchError || !currentPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Keep an existing publish date; only set one when newly publishing
    if (cleanBody.published_date) {
      updateData.published_at = cleanBody.published_date;
    } else if (cleanBody.is_published === true && !currentPost.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    if (cleanBody.content && !cleanBody.read_time) {
      updateData.read_time = Math.ceil(String(cleanBody.content).split(/\s+/).length / 200);
    }

    const { data: updatedPost, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidateBlogPages(updatedPost.slug);
    if (currentPost.slug && currentPost.slug !== updatedPost.slug) {
      revalidateBlogPages(currentPost.slug);
    }

    return NextResponse.json({
      ...updatedPost,
      featured_image: updatedPost.featured_image_url,
      is_published: updatedPost.status === 'published',
      published_date: updatedPost.published_at,
    });
  } catch (error) {
    console.error('Blog post update error:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;

    revalidateBlogPages(post.slug);

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Blog post deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
