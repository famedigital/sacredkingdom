import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage } from '@/utils/cloudinary/upload';
import { getCurrentUser } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'sacred-himalaya';
    const publicId = (formData.get('publicId') as string) || undefined;
    const resourceTypeParam = (formData.get('resourceType') as string) || 'auto';
    const resourceType =
      resourceTypeParam === 'image' ||
      resourceTypeParam === 'video' ||
      resourceTypeParam === 'raw' ||
      resourceTypeParam === 'auto'
        ? resourceTypeParam
        : 'auto';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || 'application/octet-stream';
    const base64 = `data:${mime};base64,${buffer.toString('base64')}`;

    const result = await uploadImage(base64, {
      folder,
      publicId,
      overwrite: true,
      resourceType,
    });

    return NextResponse.json({
      ...result,
      secure_url: (result as any).secure_url || (result as any).secureUrl || (result as any).url,
      url: (result as any).secure_url || (result as any).secureUrl || (result as any).url,
      public_id: (result as any).public_id || (result as any).publicId,
      mime_type: mime,
      file_name: file.name,
      file_size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({ error: 'No publicId provided' }, { status: 400 });
    }

    const result = await deleteImage(publicId);
    const resultCode = (result as { result?: string })?.result;
    if (resultCode && resultCode !== 'ok' && resultCode !== 'not found') {
      return NextResponse.json(
        { error: `Cloudinary delete failed: ${resultCode}` },
        { status: 500 }
      );
    }

    // Soft-delete from media_library when present
    try {
      const { createAdminClient } = await import('@/utils/supabase/admin');
      const supabase = createAdminClient();
      await supabase
        .from('media_library')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('public_id', publicId);
    } catch {
      // DB sync is best-effort — Cloudinary delete is primary
    }

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
