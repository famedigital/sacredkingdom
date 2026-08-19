import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';
import { createShareToken, tourNakedSharePath } from '@/lib/bookings/operations';

/** Ensure a tour has a naked itinerary share token and return the public URL. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: tour, error } = await supabase
      .from('tours')
      .select('id, title, slug, naked_share_token')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 });

    let token = tour.naked_share_token as string | null;
    if (!token) {
      token = createShareToken();
      const { error: updateError } = await supabase
        .from('tours')
        .update({
          naked_share_token: token,
          updated_at: new Date().toISOString(),
          updated_by: user.userId,
        })
        .eq('id', id);

      if (updateError) {
        const message = updateError.message || '';
        if (message.includes('naked_share_token')) {
          return NextResponse.json(
            {
              error:
                'naked_share_token column missing. Run migrations/20260722_booking_operations_shares_docs.sql in Supabase.',
              details: message,
            },
            { status: 500 }
          );
        }
        throw updateError;
      }
    }

    const path = tourNakedSharePath(token);
    revalidatePath(`/share/tour/${token}`);

    return NextResponse.json({
      token,
      path,
      url: path,
      title: tour.title,
      slug: tour.slug,
    });
  } catch (error) {
    console.error('Tour naked share error:', error);
    return NextResponse.json({ error: 'Failed to create naked share link' }, { status: 500 });
  }
}
