import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { comparePassword, generateAuthTokens, setAuthCookies } from '@/lib/auth/jwt';
import { normalizePermissions } from '@/lib/auth/rbac';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const supabase = createAdminClient();

    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      console.error('Login user lookup failed:', userError?.message || 'User not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const tokens = generateAuthTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || 'Admin',
      permissions: normalizePermissions(user.permissions),
    });

    await setAuthCookies(tokens);

    await supabase
      .from('admin_users')
      .update({
        last_login_at: new Date().toISOString(),
        last_login_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      })
      .eq('id', user.id);

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action: 'login',
      entity_type: 'authentication',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    const { password_hash, verification_token, reset_password_token, reset_password_expires, ...safeUser } = user;

    return NextResponse.json({
      user: safeUser,
      tokens: {
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
