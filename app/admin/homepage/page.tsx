'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { HomePageForm } from '@/components/admin/forms/HomePageForm';

export default function HomepageAdminPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="03"
          section="Content"
          title="Homepage"
          description="FAQ, About Bhutan, company, packages, and Journal sections."
        />
        <HomePageForm />
      </div>
    </AdminLayout>
  );
}
