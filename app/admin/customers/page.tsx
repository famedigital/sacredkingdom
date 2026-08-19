'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { CustomerManagement } from '@/components/admin/CustomerManagement';

export default function CustomersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="02"
          section="Commerce"
          title="Customers"
          description="Derived from bookings and inquiries."
        />
        <CustomerManagement />
      </div>
    </AdminLayout>
  );
}
