'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AboutPageForm } from '@/components/admin/forms/AboutPageForm';

export default function SiteSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="03"
          section="Content"
          title="About page"
          description="Edit About page content shown on the public site."
        />
        <AboutPageForm />
      </div>
    </AdminLayout>
  );
}
