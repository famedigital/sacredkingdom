import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAuthError, requireAuth } from '@/lib/auth/require-auth';

function revalidateBlogPages(slug?: string | null) {
  revalidatePath('/blog');
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .neq('status', 'archived')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status === 'published') query = query.eq('status', 'published');
    else if (status === 'draft') query = query.eq('status', 'draft');
    if (category && category !== 'all') query = query.eq('category', category);
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: posts, error, count } = await query;
    if (error) throw error;

    const mappedPosts = (posts || []).map((post) => ({
      ...post,
      featured_image: post.featured_image_url,
      is_published: post.status === 'published',
      published_date: post.published_at,
      author: post.author_name,
    }));

    return NextResponse.json({
      posts: mappedPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Blog list error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const { is_featured, ...cleanBody } = body;
    const insertData: Record<string, unknown> = {};

    if (!cleanBody.slug) {
      insertData.slug = String(cleanBody.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    } else {
      insertData.slug = cleanBody.slug;
    }

    if (cleanBody.title !== undefined) insertData.title = cleanBody.title;
    if (cleanBody.content !== undefined) insertData.content = cleanBody.content;
    if (cleanBody.excerpt !== undefined) insertData.excerpt = cleanBody.excerpt;
    insertData.author_name = cleanBody.author_name || auth.name;
    if (cleanBody.author_bio !== undefined) insertData.author_bio = cleanBody.author_bio;
    if (cleanBody.category !== undefined) insertData.category = cleanBody.category;
    if (cleanBody.tags !== undefined) insertData.tags = cleanBody.tags;
    if (cleanBody.meta_description !== undefined) insertData.meta_description = cleanBody.meta_description;
    if (cleanBody.meta_keywords !== undefined) insertData.meta_keywords = cleanBody.meta_keywords;
    if (cleanBody.featured_image !== undefined) insertData.featured_image_url = cleanBody.featured_image;
    if (cleanBody.featured_image_public_id !== undefined) {
      insertData.featured_image_public_id = cleanBody.featured_image_public_id;
    }

    if (cleanBody.is_published !== undefined) {
      insertData.status = cleanBody.is_published ? 'published' : 'draft';
    } else if (cleanBody.status !== undefined) {
      insertData.status = cleanBody.status;
    } else {
      insertData.status = 'draft';
    }

    if (cleanBody.published_date !== undefined) {
      insertData.published_at = cleanBody.published_date;
    } else if (cleanBody.is_published) {
      insertData.published_at = new Date().toISOString();
    }

    if (!cleanBody.read_time && cleanBody.content) {
      insertData.read_time = Math.ceil(String(cleanBody.content).split(/\s+/).length / 200);
    } else if (cleanBody.read_time !== undefined) {
      insertData.read_time = cleanBody.read_time;
    }

    insertData.created_by = auth.userId;
    insertData.updated_by = auth.userId;

    const supabase = createAdminClient();
    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    revalidateBlogPages(post.slug);

    return NextResponse.json(
      {
        ...post,
        featured_image: post.featured_image_url,
        is_published: post.status === 'published',
        published_date: post.published_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Blog post creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create blog post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
