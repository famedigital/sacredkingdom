import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Database types
export interface Tour {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  long_description?: string | null;
  hero_image_public_id?: string | null;
  hero_image_url?: string | null;
  hero_image_focal_x?: number | null;
  hero_image_focal_y?: number | null;
  thumbnail_public_id?: string | null;
  thumbnail_url?: string | null;
  gallery_public_ids?: string[] | null;
  gallery_urls?: string[] | null;
  category?: string | null;
  duration?: number | null;
  price?: number | null;
  /** When false, public pages hide the price. Defaults to true. */
  show_price?: boolean | null;
  difficulty_level?: string | null;
  max_group_size?: number | null;
  min_group_size?: number | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
  is_published?: boolean | null;
  tour_type?: string | null;
  duration_nights?: number | null;
  locations?: string[] | Array<Record<string, unknown>> | null;
  highlights?: string[] | null;
  itinerary?: Array<{
    day: string | number;
    title: string;
    location?: string;
    description: string;
    activities?: string[];
    meals?: string;
    accommodation?: string;
  }> | null;
  /** Preferred DB column names */
  included_items?: string[] | null;
  excluded_items?: string[] | null;
  /** Legacy aliases */
  inclusions?: string[] | null;
  exclusions?: string[] | null;
  departure_dates?: unknown[] | null;
  faqs?: Array<{ question: string; answer: string }> | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  best_season?: string[] | null;
  altitude_range?: string | null;
  min_participants?: number | null;
  max_participants?: number | null;
  min_age?: number | null;
  physical_fitness_level?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  author_name: string;
  author_bio?: string | null;
  author_avatar_url?: string | null;
  author_avatar_public_id?: string | null;
  featured_image_url?: string | null;
  featured_image_public_id?: string | null;
  category: string;
  tags: string[];
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  published_at?: string | null;
  status: string; // 'draft' | 'published' | 'archived'
  views: number;
  read_time?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface HeroSlide {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image_public_id: string;
  image_url: string;
  mobile_image_public_id?: string | null;
  mobile_image_url?: string | null;
  image_focal_x?: number | null;
  image_focal_y?: number | null;
  cta_text?: string | null;
  cta_link?: string | null;
  /** Stored in DB as cta_style until title_color column is migrated */
  cta_style?: string | null;
  title_color?: string | null;
  slide_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  image_public_id: string;
  image_url: string;
  is_approved: boolean;
  is_featured: boolean;
}

// Server-side database operations only
// This file should only be imported in Server Components

// Helper function to create Supabase client for read operations (works in Vercel serverless)
const createReadClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use PUBLISHABLE_KEY first as it's the valid working key, fallback to ANON_KEY
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
};

export async function getFeaturedTours(limit: number = 6): Promise<Tour[]> {
  try {
    const supabase = createReadClient();

    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('is_active', true)
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured tours:', error);
    return [];
  }
}

export async function getAllTours(): Promise<Tour[]> {
  try {
    const supabase = createReadClient();

    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('is_active', true)
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all tours:', error);
    return [];
  }
}

export async function getRelatedTours(
  excludeSlug: string,
  category?: string | null,
  limit: number = 4
): Promise<Tour[]> {
  const tours = await getAllTours();
  const others = tours.filter((tour) => tour.slug !== excludeSlug);
  if (!others.length) return [];

  const categoryKey = (category || '').toLowerCase().trim();
  const same = others.filter((tour) => (tour.category || '').toLowerCase().trim() === categoryKey);
  const rest = others.filter((tour) => (tour.category || '').toLowerCase().trim() !== categoryKey);
  return [...same, ...rest].slice(0, limit);
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  try {
    console.log('[DATABASE] Starting getTourBySlug for slug:', slug);

    const supabase = createReadClient();

    console.log('[DATABASE] Supabase client created successfully (read-only)');

    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('is_published', true)
      .single();

    if (error) {
      console.error('[DATABASE] Supabase query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        slug: slug
      });
      return null;
    }

    if (!data) {
      console.log('[DATABASE] No tour found for slug:', slug);
      return null;
    }

    console.log('[DATABASE] Tour found successfully:', {
      id: data.id,
      title: data.title,
      slug: data.slug,
      hasHeroImage: !!data.hero_image_url,
      hasThumbnail: !!data.thumbnail_url
    });

    return data;
  } catch (error) {
    console.error('[DATABASE] Exception in getTourBySlug:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      slug: slug
    });
    return null;
  }
}

export async function getPublishedBlogPosts(limit?: number): Promise<BlogPost[]> {
  try {
    const supabase = createReadClient();

    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching published blog posts:', error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createReadClient();

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return null;
  }
}

export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  try {
    // Use anon/publishable client (same as tours) — reliable on Vercel serverless.
    // The cookie + service-role SSR client often fails in production and returns [].
    const supabase = createReadClient();

    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('slide_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active hero slides:', error);
    return [];
  }
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createReadClient();

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured testimonials:', error);
    return [];
  }
}