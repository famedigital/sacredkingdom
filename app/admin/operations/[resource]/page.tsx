'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getOpsResource } from '@/lib/ops/registry';

const ROSTER_IDS = new Set(['guides', 'vehicles', 'hotels', 'rates', 'sources']);
const CLIENT_SCOPED = new Set(['flights', 'payments', 'expenses']);

export default function OperationsResourcePage() {
  const params = useParams<{ resource: string }>();
  const router = useRouter();
  const resourceId = params.resource;

  useEffect(() => {
    if (ROSTER_IDS.has(resourceId)) {
      router.replace(`/admin/operations/rosters?tab=${resourceId}`);
      return;
    }
    if (CLIENT_SCOPED.has(resourceId) || resourceId === 'vault') {
      router.replace('/admin/operations');
    }
  }, [resourceId, router]);

  if (ROSTER_IDS.has(resourceId) || CLIENT_SCOPED.has(resourceId) || resourceId === 'vault') {
    return (
      <AdminLayout>
        <p className="text-sm text-muted-foreground">Redirecting…</p>
      </AdminLayout>
    );
  }

  if (!getOpsResource(resourceId)) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Unknown operations section.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <p className="text-sm text-muted-foreground">Redirecting…</p>
    </AdminLayout>
  );
}
