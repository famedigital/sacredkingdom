'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, Loader2, MessageSquare, Mail, Save, Send, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CRM_ALERT_PLACEHOLDERS,
  DEFAULT_CRM_ALERT_TEMPLATE,
} from '@/lib/notifications/crm-alert-template';

type AlertSettings = {
  crm_alerts_enabled: boolean;
  crm_alert_whatsapp: string;
  crm_alert_email: string;
  crm_alert_message_template: string;
};

type Providers = {
  twilio: boolean;
  callmebot: boolean;
  webhook: boolean;
  email: boolean;
};

export function CrmAlertsForm() {
  const [settings, setSettings] = useState<AlertSettings>({
    crm_alerts_enabled: true,
    crm_alert_whatsapp: '',
    crm_alert_email: '',
    crm_alert_message_template: DEFAULT_CRM_ALERT_TEMPLATE,
  });
  const [defaultTemplate, setDefaultTemplate] = useState(DEFAULT_CRM_ALERT_TEMPLATE);
  const [providers, setProviders] = useState<Providers>({
    twilio: false,
    callmebot: false,
    webhook: false,
    email: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/alerts')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            crm_alerts_enabled: data.settings.crm_alerts_enabled !== false,
            crm_alert_whatsapp: data.settings.crm_alert_whatsapp || '',
            crm_alert_email: data.settings.crm_alert_email || '',
            crm_alert_message_template:
              data.settings.crm_alert_message_template || DEFAULT_CRM_ALERT_TEMPLATE,
          });
        }
        if (data.defaultTemplate) setDefaultTemplate(data.defaultTemplate);
        if (data.providers) setProviders(data.providers);
      })
      .catch(() => toast.error('Failed to load alert settings'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      toast.success('CRM alert settings saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      await save();
      const res = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: settings.crm_alert_whatsapp,
          email: settings.crm_alert_email,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Test failed');

      const wa = json.results?.whatsapp;
      const em = json.results?.email;
      if (wa?.sent || em?.sent) {
        toast.success('Test alert sent — check WhatsApp/email');
      } else {
        toast.error(
          wa?.error ||
            em?.error ||
            'No provider sent. Configure Twilio, CallMeBot, Gmail SMTP, or Resend env vars.'
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  const anyWhatsAppProvider = providers.twilio || providers.callmebot || providers.webhook;

  return (
    <Card className="space-y-6 p-6">
      <div>
        <h3 className="font-heading mb-1 flex items-center gap-2 text-xl font-bold">
          <Bell className="h-5 w-5 text-primary" />
          CRM alerts (WhatsApp + email)
        </h3>
        <p className="text-sm text-muted-foreground">
          Get notified on your phone when a booking or inquiry arrives — even if you don&apos;t open
          the CRM.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <Switch
          id="crm-alerts-enabled"
          checked={settings.crm_alerts_enabled}
          onCheckedChange={(v) => setSettings((s) => ({ ...s, crm_alerts_enabled: v }))}
        />
        <Label htmlFor="crm-alerts-enabled" className="cursor-pointer font-normal">
          Enable alerts for new bookings & inquiries
        </Label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" /> WhatsApp number
          </div>
          <FormField
            label=""
            value={settings.crm_alert_whatsapp}
            onChange={(e) => setSettings((s) => ({ ...s, crm_alert_whatsapp: e.target.value }))}
            placeholder="+97517643416"
          />
          <p className="text-xs text-muted-foreground">Use full country code, no spaces preferred.</p>
        </div>
        <div className="space-y-1">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium">
            <Mail className="h-4 w-4" /> Alert email (backup)
          </div>
          <FormField
            label=""
            value={settings.crm_alert_email}
            onChange={(e) => setSettings((s) => ({ ...s, crm_alert_email: e.target.value }))}
            placeholder="you@sacredhimalayatravel.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="crm-alert-template" className="text-sm font-medium">
            Message text
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() =>
              setSettings((s) => ({
                ...s,
                crm_alert_message_template: defaultTemplate,
              }))
            }
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to default
          </Button>
        </div>
        <Textarea
          id="crm-alert-template"
          value={settings.crm_alert_message_template}
          onChange={(e) =>
            setSettings((s) => ({ ...s, crm_alert_message_template: e.target.value }))
          }
          rows={12}
          className="font-mono text-sm"
          placeholder={defaultTemplate}
        />
        <p className="text-xs text-muted-foreground">
          Use placeholders — empty fields (phone, tour, etc.) are omitted automatically.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CRM_ALERT_PLACEHOLDERS.map((token) => (
            <button
              key={token}
              type="button"
              className="rounded border border-border bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              onClick={() =>
                setSettings((s) => ({
                  ...s,
                  crm_alert_message_template: `${s.crm_alert_message_template}${
                    s.crm_alert_message_template.endsWith(' ') ||
                    s.crm_alert_message_template.endsWith('\n') ||
                    !s.crm_alert_message_template
                      ? ''
                      : ' '
                  }${token}`,
                }))
              }
            >
              {token}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          <code className="rounded bg-muted px-1">&#123;&#123;admin_url&#125;&#125;</code> uses{' '}
          <code className="rounded bg-muted px-1">NEXT_PUBLIC_SITE_URL</code> from Vercel (set to
          your production domain).
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm">
        <p className="mb-2 font-medium">Provider status (Vercel env)</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>Twilio WhatsApp: {providers.twilio ? '✅ ready' : '⬜ not set'}</li>
          <li>CallMeBot (simple): {providers.callmebot ? '✅ ready' : '⬜ not set'}</li>
          <li>Custom webhook: {providers.webhook ? '✅ ready' : '⬜ not set'}</li>
          <li>Email (Gmail SMTP / Resend): {providers.email ? '✅ ready' : '⬜ not set'}</li>
        </ul>
        {!anyWhatsAppProvider ? (
          <p className="mt-3 text-amber-700 dark:text-amber-400">
            WhatsApp needs one provider in Vercel env — easiest start: CallMeBot (free personal alerts).
            See docs/CRM_WHATSAPP_ALERTS.md
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
        <Button type="button" variant="outline" onClick={sendTest} disabled={testing}>
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send test alert
        </Button>
      </div>
    </Card>
  );
}
