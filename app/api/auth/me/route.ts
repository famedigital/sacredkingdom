import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { createAdminClient } from '@/utils/supabase/admin';
import { normalizePermissions, type AdminUser } from '@/lib/auth/rbac';

export async function GET() {
  try {
    const payload = await getCurrentUser();

    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, avatar_url, permissions, is_active, email_verified, created_at')
      .eq('id', payload.userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      console.error('Database error fetching user:', error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const adminUser: AdminUser = {
      id: user.id,
      email: user.email,
      name: user.name || 'Admin',
      role: user.role || 'admin',
      permissions: normalizePermissions(user.permissions),
    };

    return NextResponse.json({ user: adminUser });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
