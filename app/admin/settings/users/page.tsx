'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { UserManager } from '@/components/admin/UserManager';

export default function UsersSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="04"
          section="Settings"
          title="Admin users"
          description="Manage admin accounts and roles."
        />
        <UserManager />
      </div>
    </AdminLayout>
  );
}
