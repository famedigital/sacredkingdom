import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { createAdminClient } from '@/utils/supabase/admin';
import { DEFAULT_CRM_ALERT_TEMPLATE } from '@/lib/notifications/crm-alert-template';
import { sendTestCrmAlert } from '@/lib/notifications/crm-alert';

const ALERT_KEYS = [
  'crm_alerts_enabled',
  'crm_alert_whatsapp',
  'crm_alert_email',
  'crm_alert_message_template',
] as const;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createAdminClient();
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [...ALERT_KEYS]);

    const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
    const savedTemplate =
      typeof map.crm_alert_message_template === 'string'
        ? map.crm_alert_message_template
        : '';

    return NextResponse.json({
      settings: {
        crm_alerts_enabled:
          map.crm_alerts_enabled === undefined
            ? true
            : map.crm_alerts_enabled === true ||
              map.crm_alerts_enabled === 'true' ||
              map.crm_alerts_enabled === 1 ||
              map.crm_alerts_enabled === '1',
        crm_alert_whatsapp: String(map.crm_alert_whatsapp || process.env.CRM_ALERT_WHATSAPP || ''),
        crm_alert_email: String(map.crm_alert_email || process.env.CRM_ALERT_EMAIL || ''),
        crm_alert_message_template: savedTemplate.trim()
          ? savedTemplate
          : DEFAULT_CRM_ALERT_TEMPLATE,
      },
      defaultTemplate: DEFAULT_CRM_ALERT_TEMPLATE,
      providers: {
        twilio: Boolean(
          process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_WHATSAPP_FROM
        ),
        callmebot: Boolean(process.env.CALLMEBOT_APIKEY),
        webhook: Boolean(process.env.WHATSAPP_ALERT_WEBHOOK_URL),
        email: Boolean(
          process.env.RESEND_API_KEY ||
            (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
        ),
      },
    });
  } catch (error) {
    console.error('Alert settings GET error:', error);
    return NextResponse.json({ error: 'Failed to load alert settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const supabase = createAdminClient();

    const template = String(body.crm_alert_message_template ?? '').trim();

    const rows = [
      {
        key: 'crm_alerts_enabled',
        value: body.crm_alerts_enabled !== false,
        category: 'alerts',
        description: 'Send WhatsApp/email when a booking or inquiry arrives',
      },
      {
        key: 'crm_alert_whatsapp',
        value: String(body.crm_alert_whatsapp || '').trim(),
        category: 'alerts',
        description: 'WhatsApp number for CRM alerts (E.164, e.g. +97517643416)',
      },
      {
        key: 'crm_alert_email',
        value: String(body.crm_alert_email || '').trim(),
        category: 'alerts',
        description: 'Email for CRM alerts',
      },
      {
        key: 'crm_alert_message_template',
        value: template || DEFAULT_CRM_ALERT_TEMPLATE,
        category: 'alerts',
        description: 'WhatsApp/email alert message template with {{placeholders}}',
      },
    ];

    for (const row of rows) {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', row.key)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            value: row.value,
            category: row.category,
            description: row.description,
            updated_at: new Date().toISOString(),
          })
          .eq('key', row.key);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_settings').insert({
          key: row.key,
          value: row.value,
          category: row.category,
          description: row.description,
          is_public: false,
        });
        if (error) throw error;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Alert settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to save alert settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const results = await sendTestCrmAlert(body.whatsapp, body.email);
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error('Alert test error:', error);
    return NextResponse.json({ error: 'Failed to send test alert' }, { status: 500 });
  }
}
