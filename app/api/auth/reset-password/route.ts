import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { hashPassword } from '@/lib/auth/jwt';
import { hashResetToken } from '@/lib/auth/password-reset';

const resetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ valid: false, error: 'Missing token' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const hash = hashResetToken(token);

    const { data: user } = await supabase
      .from('admin_users')
      .select('id, email, name, reset_password_expires, is_active')
      .eq('reset_password_token', hash)
      .eq('is_active', true)
      .maybeSingle();

    if (!user?.reset_password_expires) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired reset link' });
    }

    if (new Date(user.reset_password_expires).getTime() < Date.now()) {
      return NextResponse.json({ valid: false, error: 'This reset link has expired' });
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Reset token check error:', error);
    return NextResponse.json({ valid: false, error: 'Unable to verify token' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const supabase = createAdminClient();
    const hash = hashResetToken(token);

    const { data: user } = await supabase
      .from('admin_users')
      .select('id, email, name, reset_password_expires, is_active')
      .eq('reset_password_token', hash)
      .eq('is_active', true)
      .maybeSingle();

    if (!user?.reset_password_expires) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }

    if (new Date(user.reset_password_expires).getTime() < Date.now()) {
      return NextResponse.json({ error: 'This reset link has expired' }, { status: 400 });
    }

    const password_hash = await hashPassword(password);

    const { error } = await supabase
      .from('admin_users')
      .update({
        password_hash,
        reset_password_token: null,
        reset_password_expires: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action: 'password_reset',
      entity_type: 'authentication',
      entity_id: user.id,
      entity_title: user.email,
      ip_address:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json({
      message: 'Password updated. You can sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Unable to reset password' }, { status: 500 });
  }
}
