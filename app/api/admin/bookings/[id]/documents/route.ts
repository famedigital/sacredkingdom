import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';
import type { BookingDocType } from '@/lib/bookings/operations';

const DOC_TYPES: BookingDocType[] = ['room_voucher', 'sdf', 'invoice', 'payment', 'other'];

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
      .from('booking_documents')
      .select('*')
      .eq('booking_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ documents: data || [] });
  } catch (error) {
    console.error('List booking documents error:', error);
    return NextResponse.json({ error: 'Failed to load documents' }, { status: 500 });
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
    const docType = body.doc_type as BookingDocType;
    const fileUrl = String(body.file_url || '').trim();

    if (!DOC_TYPES.includes(docType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }
    if (!fileUrl) {
      return NextResponse.json({ error: 'file_url is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: booking } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('booking_documents')
      .insert({
        booking_id: id,
        doc_type: docType,
        title: body.title || null,
        file_url: fileUrl,
        file_public_id: body.file_public_id || null,
        file_name: body.file_name || null,
        mime_type: body.mime_type || null,
        file_size: body.file_size ?? null,
        notes: body.notes || null,
        uploaded_by: user.userId,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ document: data }, { status: 201 });
  } catch (error) {
    console.error('Create booking document error:', error);
    const message = error instanceof Error ? error.message : 'Failed to save document';
    return NextResponse.json(
      {
        error: message.includes('booking_documents')
          ? 'Documents table missing. Run migrations/20260722_booking_operations_shares_docs.sql in Supabase.'
          : 'Failed to save document',
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
    const docId = new URL(request.url).searchParams.get('docId');
    if (!docId) return NextResponse.json({ error: 'docId is required' }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('booking_documents')
      .delete()
      .eq('id', docId)
      .eq('booking_id', id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete booking document error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
