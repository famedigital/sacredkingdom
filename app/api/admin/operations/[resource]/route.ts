import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';
import { canManageOperations, canReadOperations } from '@/lib/ops/access';
import { getOpsResource, type OpsField } from '@/lib/ops/registry';

function coerce(field: OpsField, value: unknown) {
  if (field.type === 'boolean') return Boolean(value);
  if (value === '' || value == null) return null;
  if (field.type === 'number') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return String(value);
}

function toPayload(fields: OpsField[], body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    payload[field.key] = coerce(field, body[field.key]);
  }
  return payload;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canReadOperations(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { resource } = await params;
    const def = getOpsResource(resource);
    if (!def) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });

    const bookingId = request.nextUrl.searchParams.get('booking_id');
    const supabase = createAdminClient();
    let query = supabase.from(def.table).select('*').order('created_at', { ascending: false });
    if (bookingId && def.fields.some((field) => field.booking)) {
      query = query.eq('booking_id', bookingId);
    }
    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ rows: data || [] });
  } catch (error) {
    console.error('Ops list error:', error);
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json(
      {
        error: message.includes('does not exist') || message.includes('schema cache')
          ? 'Operations tables missing. Run migrations/20260819_operations_department.sql in the Supabase SQL editor.'
          : 'Failed to load operations data',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canManageOperations(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { resource } = await params;
    const def = getOpsResource(resource);
    if (!def) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });

    const body = (await request.json()) as Record<string, unknown>;
    const payload = toPayload(def.fields, body);
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(def.table).insert(payload).select().single();
    if (error) throw error;

    return NextResponse.json({ row: data });
  } catch (error) {
    console.error('Ops create error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
