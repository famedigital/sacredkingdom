import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { uploadMultipleImages, deleteImage } from '@/utils/cloudinary/upload';
import { getCurrentUser } from '@/lib/auth/jwt';

// POST /api/admin/media/bulk — bulk upload
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'sacred-himalaya';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const base64Files = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return `data:${file.type};base64,${buffer.toString('base64')}`;
      })
    );

    const uploadResults = await uploadMultipleImages(base64Files, { folder });
    const supabase = createAdminClient();

    const mediaRecords = await Promise.all(
      uploadResults.map(async (result, index) => {
        const file = files[index];
        const { data, error } = await supabase
          .from('media_library')
          .insert({
            public_id: result.publicId,
            url: result.url,
            secure_url: result.secureUrl,
            format: result.format,
            width: result.width,
            height: result.height,
            resource_type: result.resourceType,
            folder,
            title: file.name,
            file_size: file.size,
            uploaded_by: user.userId,
            metadata: {
              original_filename: file.name,
              mime_type: file.type,
            },
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      })
    );

    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      user_name: user.name,
      user_email: user.email,
      action: 'create',
      entity_type: 'media_bulk',
      new_values: { count: mediaRecords.length, ids: mediaRecords.map((m) => m.id) },
      ip_address:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json(
      {
        media: mediaRecords,
        count: mediaRecords.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/media/bulk
 * Body: { publicIds: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const publicIds = Array.isArray(body.publicIds)
      ? body.publicIds.filter((id: unknown) => typeof id === 'string' && String(id).trim())
      : [];

    if (publicIds.length === 0) {
      return NextResponse.json({ error: 'No images selected' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const results: Array<{ publicId: string; ok: boolean; error?: string }> = [];

    for (const publicId of publicIds) {
      try {
        const cloudResult = await deleteImage(publicId);
        const resultCode = cloudResult?.result;
        const cloudOk = resultCode === 'ok' || resultCode === 'not found';

        if (!cloudOk) {
          results.push({
            publicId,
            ok: false,
            error: `Cloudinary: ${resultCode || 'failed'}`,
          });
          continue;
        }

        await supabase
          .from('media_library')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('public_id', publicId);

        results.push({ publicId, ok: true });
      } catch (err) {
        results.push({
          publicId,
          ok: false,
          error: err instanceof Error ? err.message : 'Delete failed',
        });
      }
    }

    const deleted = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok);

    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      user_name: user.name,
      user_email: user.email,
      action: 'delete',
      entity_type: 'media_bulk',
      new_values: { deleted, failed: failed.length, publicIds },
      ip_address:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    if (deleted === 0) {
      return NextResponse.json(
        { error: 'Could not delete any images', results },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Deleted ${deleted} image${deleted === 1 ? '' : 's'}`,
      deleted,
      failed,
      results,
    });
  } catch (error) {
    console.error('Bulk media delete error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
