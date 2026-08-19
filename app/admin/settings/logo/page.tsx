'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BrandLogoForm } from '@/components/admin/forms/BrandLogoForm';

export default function LogoSettingsPage() {
  return (
    <AdminLayout lockScroll>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <div className="shrink-0">
          <AdminPageHeader
            index="04"
            section="Settings"
            title="Logo"
            description="Preview stays fixed on the right — scroll settings on the left."
          />
        </div>
        <BrandLogoForm />
      </div>
    </AdminLayout>
  );
}
