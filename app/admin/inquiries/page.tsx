'use client';

import { Suspense } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { InquiryManagement } from '@/components/admin/InquiryManagement';

export default function InquiriesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="02"
          section="Commerce"
          title="Inquiries"
          description="Messages from the public contact form."
        />
        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
          <InquiryManagement />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
