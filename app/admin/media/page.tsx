'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { MediaLibrary } from '@/components/admin/MediaLibrary';

export default function MediaPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="03"
          section="Content"
          title="Media"
          description="Upload, browse, and delete Cloudinary images."
        />
        <div className="rounded-xl border border-primary/20 bg-card p-4 ring-1 ring-foreground/10 md:p-6">
          <MediaLibrary />
        </div>
      </div>
    </AdminLayout>
  );
}
