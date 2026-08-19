import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';
import { canReadOperations } from '@/lib/ops/access';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canReadOperations(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();
    let query = supabase
      .from('booking_documents')
      .select('*, bookings(booking_number, client_name)')
      .order('created_at', { ascending: false })
      .limit(200);
    const bookingId = request.nextUrl.searchParams.get('booking_id');
    if (bookingId) query = query.eq('booking_id', bookingId);
    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ rows: data || [] });
  } catch (error) {
    console.error('Ops vault error:', error);
    return NextResponse.json({ error: 'Failed to load vault' }, { status: 500 });
  }
}
