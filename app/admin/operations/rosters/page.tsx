'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { OpsCrudPage } from '@/components/admin/OpsCrudPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OPS_RESOURCES } from '@/lib/ops/registry';

const ROSTER_IDS = ['guides', 'vehicles', 'hotels', 'rates', 'sources'] as const;

function RostersTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requested = searchParams.get('tab');
  const tab = ROSTER_IDS.includes(requested as (typeof ROSTER_IDS)[number]) ? requested! : 'guides';
  const resources = OPS_RESOURCES.filter((item) =>
    ROSTER_IDS.includes(item.id as (typeof ROSTER_IDS)[number])
  );

  return (
    <Tabs value={tab} onValueChange={(value) => router.replace(`/admin/operations/rosters?tab=${value}`)}>
      <TabsList variant="line" className="flex-wrap">
        {resources.map((resource) => (
          <TabsTrigger key={resource.id} value={resource.id}>
            {resource.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {resources.map((resource) => (
        <TabsContent key={resource.id} value={resource.id} className="pt-4">
          <OpsCrudPage resource={resource} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default function OperationsRostersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="05"
          section="Operations"
          title="Rosters"
          description="Company-wide guides, cars, hotels, rates, and sources used on every client file."
        />
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading rosters…</p>}>
          <RostersTabs />
        </Suspense>
      </div>
    </AdminLayout>
  );
}
