'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AppearanceForm } from '@/components/admin/forms/AppearanceForm';

export default function AppearanceSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="04"
          section="Settings"
          title="Appearance"
          description="Public palettes and homepage layout templates. Changes apply on the next page load."
        />
        <AppearanceForm />
      </div>
    </AdminLayout>
  );
}
