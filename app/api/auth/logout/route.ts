import { NextResponse } from 'next/server';
import { clearAuthCookies, getCurrentUser } from '@/lib/auth/jwt';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST() {
  try {
    const payload = await getCurrentUser();
    if (payload) {
      try {
        const supabase = createAdminClient();
        await supabase.from('audit_logs').insert({
          user_id: payload.userId,
          user_name: payload.name,
          user_email: payload.email,
          action: 'logout',
          entity_type: 'authentication',
        });
      } catch (logError) {
        console.error('Logout audit log failed:', logError);
      }
    }

    await clearAuthCookies();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
