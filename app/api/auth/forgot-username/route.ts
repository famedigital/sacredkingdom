import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/utils/supabase/admin';
import { getAppBaseUrl } from '@/lib/auth/password-reset';
import { loginEmailReminderEmail, sendEmail } from '@/lib/email/send';

const schema = z.object({
  // Name as registered on the admin account, or an email they think they used
  identifier: z.string().min(2).max(255),
});

/**
 * Reminds an admin of their login email (username for this CMS is the email).
 * Always returns a generic success message.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Enter your name or the email you think you used' },
        { status: 400 }
      );
    }

    const identifier = parsed.data.identifier.trim();
    const supabase = createAdminClient();
    const baseUrl = getAppBaseUrl(request.url);
    const loginUrl = `${baseUrl}/admin/login`;

    const looksLikeEmail = identifier.includes('@');

    let user:
      | { id: string; email: string; name: string | null; is_active: boolean }
      | null = null;

    if (looksLikeEmail) {
      const { data } = await supabase
        .from('admin_users')
        .select('id, email, name, is_active')
        .eq('email', identifier.toLowerCase())
        .eq('is_active', true)
        .maybeSingle();
      user = data;
    } else {
      // Exact name match first, then case-insensitive ilike
      const { data: exact } = await supabase
        .from('admin_users')
        .select('id, email, name, is_active')
        .eq('is_active', true)
        .ilike('name', identifier)
        .limit(2);

      if (exact && exact.length === 1) {
        user = exact[0];
      }
    }

    if (user) {
      const mail = await loginEmailReminderEmail({
        name: user.name || 'Admin',
        loginEmail: user.email,
        loginUrl,
      });

      const result = await sendEmail({
        to: user.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });

      if (!result.sent && result.provider === 'none') {
        console.warn('Login email reminder not sent — configure RESEND_API_KEY', {
          userId: user.id,
        });
      }

      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          message:
            'If we found a matching admin account, we emailed the login address. (Dev: details below.)',
          loginEmail: user.email,
          loginUrl,
        });
      }
    }

    return NextResponse.json({
      message:
        'If we found a matching admin account, we emailed your login address. Check your inbox and spam folder.',
    });
  } catch (error) {
    console.error('Forgot username error:', error);
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 });
  }
}
