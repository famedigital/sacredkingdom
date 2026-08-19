'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { MobileNavForm } from '@/components/admin/forms/MobileNavForm';

export default function MobileNavSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="04"
          section="Settings"
          title="Mobile menu"
          description="Toggle between the app-style footer menu and a top bar with burger + logo."
        />
        <MobileNavForm />
      </div>
    </AdminLayout>
  );
}
