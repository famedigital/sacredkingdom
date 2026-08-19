import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { createResetToken, getAppBaseUrl } from '@/lib/auth/password-reset';
import { passwordResetEmail, sendEmail } from '@/lib/email/send';

const schema = z.object({
  email: z.string().email(),
});

/**
 * Always returns a generic success message to avoid account enumeration.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const supabase = createAdminClient();
    const baseUrl = getAppBaseUrl(request.url);

    const { data: user } = await supabase
      .from('admin_users')
      .select('id, email, name, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();

    if (user) {
      const { token, hash, expiresAt } = createResetToken();

      await supabase
        .from('admin_users')
        .update({
          reset_password_token: hash,
          reset_password_expires: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`;
      const mail = await passwordResetEmail({
        name: user.name || 'Admin',
        resetUrl,
      });

      const result = await sendEmail({
        to: user.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });

      if (!result.sent && result.provider === 'none') {
        console.warn(
          'Password reset created but email was not sent. Configure RESEND_API_KEY.',
          { userId: user.id }
        );
      }

      // In non-production, return the link so local testing works without Resend
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          message:
            'If an account exists for that email, a reset link has been sent. (Dev: link included below.)',
          resetUrl,
        });
      }
    }

    return NextResponse.json({
      message:
        'If an admin account exists for that email, we sent password reset instructions. Check your inbox and spam folder.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 });
  }
}
