'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { HeroSlidesManagement } from '@/components/admin/HeroSlidesManagement';

export default function HeroSlidesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="03"
          section="Content"
          title="Hero slides"
          description="Homepage stills and captions."
        />
        <HeroSlidesManagement />
      </div>
    </AdminLayout>
  );
}
