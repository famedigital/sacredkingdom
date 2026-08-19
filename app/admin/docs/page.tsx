'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminDocumentation } from '@/components/admin/AdminDocumentation';

export default function AdminDocsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="01"
          section="Overview"
          title="Documentation"
          description="How to run the CMS day to day."
        />
        <AdminDocumentation />
      </div>
    </AdminLayout>
  );
}
