import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    status: 'running',
    checks: {} as Record<string, any>,
    errors: [] as string[]
  };

  try {
    // Check 1: Environment Variables
    diagnostics.checks.environment = {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
      },
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        prefix: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.substring(0, 10) + '...'
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        prefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...'
      }
    };

    // Check 2: Supabase Client Creation
    try {
      const supabase = await createClient();
      diagnostics.checks.supabaseClient = {
        status: 'success',
        message: 'Supabase client created successfully'
      };
    } catch (error) {
      diagnostics.checks.supabaseClient = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      diagnostics.errors.push(`Supabase client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check 3: Database Connection (Test Query)
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('tours')
        .select('id, title, slug, is_active')
        .limit(1);

      diagnostics.checks.databaseConnection = {
        status: error ? 'failed' : 'success',
        resultCount: data?.length || 0,
        error: error ? error.message : null
      };

      if (error) {
        diagnostics.errors.push(`Database query failed: ${error.message}`);
      }

      if (data && data.length > 0) {
        diagnostics.checks.databaseConnection.sampleTour = {
          id: data[0].id,
          title: data[0].title,
          slug: data[0].slug,
          isActive: data[0].is_active
        };
      }
    } catch (error) {
      diagnostics.checks.databaseConnection = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      diagnostics.errors.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check 4: Specific Tour Query (Taktsang)
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('slug', 'taktsang-tigers-nest-trek')
        .eq('is_active', true)
        .single();

      diagnostics.checks.specificTourQuery = {
        status: error ? 'failed' : 'success',
        tourFound: !!data,
        error: error ? error.message : null
      };

      if (error) {
        diagnostics.errors.push(`Specific tour query failed: ${error.message}`);
      }

      if (data) {
        diagnostics.checks.specificTourQuery.tour = {
          id: data.id,
          title: data.title,
          slug: data.slug,
          hasHeroImage: !!data.hero_image_url,
          hasThumbnail: !!data.thumbnail_url,
          hasItinerary: !!(data.itinerary && data.itinerary.length > 0),
          itineraryLength: data.itinerary?.length || 0
        };
      }
    } catch (error) {
      diagnostics.checks.specificTourQuery = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      diagnostics.errors.push(`Specific tour query exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check 5: Test All Active Tours
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('tours')
        .select('id, title, slug')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      diagnostics.checks.allActiveTours = {
        status: error ? 'failed' : 'success',
        count: data?.length || 0,
        error: error ? error.message : null
      };

      if (error) {
        diagnostics.errors.push(`All active tours query failed: ${error.message}`);
      }

      if (data) {
        diagnostics.checks.allActiveTours.tours = data.map(t => ({
          id: t.id,
          title: t.title,
          slug: t.slug
        }));
      }
    } catch (error) {
      diagnostics.checks.allActiveTours = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      diagnostics.errors.push(`All active tours query exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Overall Status
    diagnostics.status = diagnostics.errors.length > 0 ? 'completed_with_errors' : 'completed_successfully';

  } catch (error) {
    diagnostics.status = 'failed';
    diagnostics.errors.push(`Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return NextResponse.json(diagnostics);
}
