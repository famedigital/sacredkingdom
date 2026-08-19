import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken, verifyToken } from '@/lib/auth/jwt';
import { createAdminClient } from '@/utils/supabase/admin';
import { normalizePermissions, type AdminUser } from '@/lib/auth/rbac';

export async function POST(_request: NextRequest) {
  try {
    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    const payload = verifyToken(newAccessToken);
    if (!payload) {
      return NextResponse.json({ error: 'Failed to verify new token' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, avatar_url, permissions, is_active')
      .eq('id', payload.userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const adminUser: AdminUser = {
      id: user.id,
      email: user.email,
      name: user.name || 'Admin',
      role: user.role || 'admin',
      permissions: normalizePermissions(user.permissions),
    };

    return NextResponse.json({
      user: adminUser,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
