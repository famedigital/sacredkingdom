'use client';

import { Suspense } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BookingManagement } from '@/components/admin/BookingManagement';

export default function BookingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="02"
          section="Commerce"
          title="Bookings"
          description="View and update tour bookings."
        />
        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
          <BookingManagement />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
