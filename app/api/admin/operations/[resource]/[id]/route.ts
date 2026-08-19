import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';
import { canManageOperations } from '@/lib/ops/access';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canManageOperations(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { resource, id } = await params;
    const def = getOpsResource(resource);
    if (!def) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });

    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const field of def.fields) {
      if (field.key in body) payload[field.key] = coerce(field, body[field.key]);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.from(def.table).update(payload).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json({ row: data });
  } catch (error) {
    console.error('Ops update error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canManageOperations(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { resource, id } = await params;
    const def = getOpsResource(resource);
    if (!def) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });

    const supabase = createAdminClient();
    const { error } = await supabase.from(def.table).delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Ops delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
