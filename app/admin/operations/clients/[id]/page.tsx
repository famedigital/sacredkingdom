'use client';

import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ClientOpsWorkspace } from '@/components/admin/ClientOpsWorkspace';

export default function OperationsClientPage() {
  const params = useParams<{ id: string }>();
  const clientKey = decodeURIComponent(params.id || '');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader index="05" section="Operations" title={clientKey ? 'Client file' : 'Client'} />
        {clientKey ? <ClientOpsWorkspace clientKey={clientKey} /> : null}
      </div>
    </AdminLayout>
  );
}
