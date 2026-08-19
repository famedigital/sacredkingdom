'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSection } from '@/components/admin/AdminSection';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="01"
          section="Overview"
          title="Analytics"
          description="Performance metrics and insights."
        />
        <AdminSection>
          <Card className="shadow-none">
            <CardContent className="p-6">
              <div className="py-12 text-center text-muted-foreground">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="font-heading text-lg font-medium">Analytics dashboard coming soon</p>
                <p className="mt-2 text-sm">This panel is not live yet.</p>
              </div>
            </CardContent>
          </Card>
        </AdminSection>
      </div>
    </AdminLayout>
  );
}
