'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ContactSettingsForm } from '@/components/admin/forms/ContactSettingsForm';
import { CrmAlertsForm } from '@/components/admin/forms/CrmAlertsForm';

export default function GeneralSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="04"
          section="Settings"
          title="General & contact"
          description="Contact details, CRM alerts, and general site settings."
        />
        <CrmAlertsForm />
        <ContactSettingsForm />
      </div>
    </AdminLayout>
  );
}
