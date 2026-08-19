import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';
import { hasPermission, Permissions, type AdminUser } from '@/lib/auth/rbac';

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser: AdminUser = {
      id: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
    };

    if (!hasPermission(adminUser, Permissions.INQUIRY_READ)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching inquiries:', error);
      return NextResponse.json(
        { error: 'Error fetching inquiries' },
        { status: 500 }
      );
    }

    const formattedInquiries = inquiries?.map(inquiry => ({
      id: inquiry.inquiry_number,
      name: inquiry.name,
      email: inquiry.email,
      subject: inquiry.subject || 'General Inquiry',
      message: inquiry.message,
      date: new Date(inquiry.created_at).toISOString().split('T')[0],
      status: inquiry.status || 'new',
    })) || [];

    return NextResponse.json(formattedInquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
