import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { getCloudinaryImages } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const maxResults = parseInt(searchParams.get('maxResults') || '100');
    const resourceType = searchParams.get('resource_type') || 'image';

    const images = await getCloudinaryImages({
      folder: folder || undefined,
      tags,
      maxResults,
      resource_type: resourceType,
    });

    const media = images.map((img) => ({
      id: img.public_id,
      public_id: img.public_id,
      url: img.secure_url,
      secure_url: img.secure_url,
      thumbnail_url: img.secure_url.replace('/upload/', '/upload/c_fill,w_200,h_200,q_auto/'),
      name: img.public_id.split('/').pop(),
      type: img.resource_type,
      format: img.format,
      created_at: img.created_at,
      width: img.width,
      height: img.height,
      bytes: img.bytes,
      tags: img.tags || [],
    }));

    return NextResponse.json({
      media,
      images: media,
      total: media.length,
      folder: folder || 'sacred-himalaya',
    });
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch media from Cloudinary',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
