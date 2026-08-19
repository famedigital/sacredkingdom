'use client';

import { BlogManagement } from '@/components/admin/BlogManagement';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function BlogManagementPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="03"
          section="Content"
          title="Journal"
          description="Stories published on /journal."
        />
        <BlogManagement />
      </div>
    </AdminLayout>
  );
}
