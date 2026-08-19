'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LegalPageForm } from '@/components/admin/forms/LegalPageForm';
import { TERMS_DEFAULTS } from '@/lib/content/legal';

export default function TermsSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="04"
          section="Settings"
          title="Terms"
          description="Sections appear on /terms in the order below."
        />
        <LegalPageForm
          pageType="terms"
          defaults={TERMS_DEFAULTS}
          heading="Terms & Conditions"
          description="Sections appear on /terms in the order below."
        />
      </div>
    </AdminLayout>
  );
}
