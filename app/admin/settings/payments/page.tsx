'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { FAQManager } from '@/components/admin/FAQManager';

export default function PaymentsSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="03"
          section="Content"
          title="FAQ"
          description="Manage answers shown on the public FAQ page."
        />
        <FAQManager />
      </div>
    </AdminLayout>
  );
}
