'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSection } from '@/components/admin/AdminSection';
import { OpsClientList } from '@/components/admin/OpsClientList';

export default function OperationsIndexPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="05"
          section="Operations"
          title="Clients"
          description="Add a client, then open their file for guide, car, hotels, flights, payments, expenses, and documents."
        />
        <AdminSection>
          <OpsClientList />
        </AdminSection>
      </div>
    </AdminLayout>
  );
}
