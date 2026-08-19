'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { TourManagement } from '@/components/admin/TourManagement';
import { TourCategoryManager } from '@/components/admin/TourCategoryManager';

export default function ToursPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <AdminPageHeader
          index="03"
          section="Content"
          title="Tours"
          description="Categories power the public Trips submenu. Assign each tour to a category below."
        />
        <TourCategoryManager />
        <TourManagement />
      </div>
    </AdminLayout>
  );
}
