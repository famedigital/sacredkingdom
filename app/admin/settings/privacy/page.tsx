'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LegalPageForm } from '@/components/admin/forms/LegalPageForm';
import { PRIVACY_DEFAULTS } from '@/lib/content/legal';

export default function PrivacySettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="04"
          section="Settings"
          title="Privacy"
          description="Sections appear on /privacy in the order below."
        />
        <LegalPageForm
          pageType="privacy"
          defaults={PRIVACY_DEFAULTS}
          heading="Privacy Policy"
          description="Sections appear on /privacy in the order below."
        />
      </div>
    </AdminLayout>
  );
}
