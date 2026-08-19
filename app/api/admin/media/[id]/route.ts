import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { deleteImage, getImageMetadata } from '@/utils/cloudinary/upload';
import { getCurrentUser } from '@/lib/auth/jwt';

// GET /api/admin/media/[id] - Get single media item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: media, error } = await supabase
      .from('media_library')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// PATCH /api/admin/media/[id] - Update media metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, alt_text, caption, tags, folder } = body;

    const { id } = await params;
    const supabase = await createClient();

    // Get current media record
    const { data: currentMedia, error: fetchError } = await supabase
      .from('media_library')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Update media record
    const { data: updatedMedia, error } = await supabase
      .from('media_library')
      .update({
        title: title || currentMedia.title,
        alt_text: alt_text !== undefined ? alt_text : currentMedia.alt_text,
        caption: caption !== undefined ? caption : currentMedia.caption,
        tags: tags || currentMedia.tags,
        folder: folder || currentMedia.folder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log the update
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      user_name: user.name,
      user_email: user.email,
      action: 'update',
      entity_type: 'media',
      entity_id: updatedMedia.id,
      entity_title: updatedMedia.title,
      old_values: currentMedia,
      new_values: updatedMedia,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json(updatedMedia);
  } catch (error) {
    console.error('Media update error:', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

// DELETE /api/admin/media/[id] - Delete media
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    // Get media record before deletion
    const { data: media, error: fetchError } = await supabase
      .from('media_library')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from Cloudinary
    try {
      await deleteImage(media.public_id);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database (soft delete by setting is_active to false)
    const { error: deleteError } = await supabase
      .from('media_library')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Log the deletion
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      user_name: user.name,
      user_email: user.email,
      action: 'delete',
      entity_type: 'media',
      entity_id: media.id,
      entity_title: media.title,
      old_values: media,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Media deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}