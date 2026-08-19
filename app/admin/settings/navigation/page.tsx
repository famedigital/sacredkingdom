'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { SEOManagement } from '@/components/admin/SEOManagement';

export default function NavigationSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="04"
          section="Settings"
          title="SEO"
          description="Site-wide SEO settings. Tour submenu categories are managed under Tours."
        />
        <SEOManagement />
      </div>
    </AdminLayout>
  );
}
