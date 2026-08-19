import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  createShareToken,
  sharePath,
  type ShareAudience,
} from '@/lib/bookings/operations';

function withUrl(row: Record<string, unknown>) {
  return {
    ...row,
    url: sharePath(String(row.token)),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('booking_share_links')
      .select('*')
      .eq('booking_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({
      links: (data || []).map((row) => withUrl(row as Record<string, unknown>)),
    });
  } catch (error) {
    console.error('List share links error:', error);
    return NextResponse.json({ error: 'Failed to load share links' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const audience = body.audience as ShareAudience;

    if (audience !== 'client' && audience !== 'staff') {
      return NextResponse.json({ error: 'audience must be client or staff' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: booking } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Reuse active link for same audience when possible
    const { data: existing } = await supabase
      .from('booking_share_links')
      .select('*')
      .eq('booking_id', id)
      .eq('audience', audience)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing && !body.force_new) {
      return NextResponse.json({ link: withUrl(existing as Record<string, unknown>) });
    }

    const token = createShareToken();
    const label =
      body.label ||
      (audience === 'client' ? 'Client naked itinerary' : 'Guide & driver (no rates)');

    const { data, error } = await supabase
      .from('booking_share_links')
      .insert({
        booking_id: id,
        token,
        audience,
        include_rates: false,
        label,
        expires_at: body.expires_at || null,
        is_active: true,
        created_by: user.userId,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ link: withUrl(data as Record<string, unknown>) }, { status: 201 });
  } catch (error) {
    console.error('Create share link error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create share link';
    return NextResponse.json(
      {
        error: message.includes('booking_share_links')
          ? 'Share links table missing. Run migrations/20260722_booking_operations_shares_docs.sql in Supabase.'
          : 'Failed to create share link',
        details: message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const linkId = new URL(request.url).searchParams.get('linkId');
    if (!linkId) return NextResponse.json({ error: 'linkId is required' }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('booking_share_links')
      .update({ is_active: false })
      .eq('id', linkId)
      .eq('booking_id', id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Revoke share link error:', error);
    return NextResponse.json({ error: 'Failed to revoke share link' }, { status: 500 });
  }
}
