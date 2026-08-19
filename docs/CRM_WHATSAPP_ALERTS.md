# CRM WhatsApp / Email Alerts

Get a WhatsApp (and/or email) ping when someone books or inquires — without opening the CRM daily.

## Admin UI

**Admin → Settings → General** → **CRM alerts (WhatsApp + email)**

1. Turn **Enable alerts** on  
2. Enter your WhatsApp number (`+97517643416`)  
3. Optional: alert email  
4. Edit **Message text** (placeholders like `{{name}}`, `{{admin_url}}`)  
5. **Save** → **Send test alert**

### Message placeholders

`{{kind}}` `{{name}}` `{{email}}` `{{phone}}` `{{tour}}` `{{dates}}` `{{group}}` `{{booking_number}}` `{{message}}` `{{admin_url}}` `{{site_url}}`

`{{admin_url}}` uses `NEXT_PUBLIC_SITE_URL` (set this to your production domain in Vercel).

## WhatsApp providers (pick one — set in Vercel env)

### Option A — CallMeBot (easiest for personal phone)

1. Add [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/) on WhatsApp and get an API key  
2. Vercel env:
   ```
   CALLMEBOT_APIKEY=your_key
   CRM_ALERT_WHATSAPP=+97517643416
   ```
3. Redeploy → Send test alert

### Option B — Twilio WhatsApp (more “business” / reliable)

```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
CRM_ALERT_WHATSAPP=+97517643416
```

(Use Twilio sandbox first, then a approved WhatsApp sender.)

### Option C — Make.com / n8n webhook

```
WHATSAPP_ALERT_WEBHOOK_URL=https://hook.make.com/xxxxx
```

POST JSON: `{ phone, message, channel: "whatsapp" }`  
Or use URL placeholders: `...?phone={phone}&text={message}`

## Email (auto-reply + CRM alert backup)

### Option A — Free Gmail SMTP (recommended if you don’t want Resend)

1. Google Account → Security → enable 2-Step Verification  
2. Create an **App password** (not your normal Gmail password)  
3. Vercel env:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   EMAIL_FROM=Wangchuks Bhutan Tours <your@gmail.com>
   CRM_ALERT_EMAIL=your@gmail.com
   ```
4. Redeploy

Works for contact auto-reply, CRM alert emails, and admin password reset.

### Option B — Resend (also has a free tier: 100 emails/day)

```
RESEND_API_KEY=...
EMAIL_FROM=Wangchuks Bhutan Tours <onboarding@resend.dev>
CRM_ALERT_EMAIL=you@wangchuktour.com
```

(or set the alert email in Admin → CRM alerts)

SMTP is preferred when both are set.

## What triggers alerts

- Public **booking / inquire** on a tour → WhatsApp + email  
- Public **contact form** → WhatsApp + email  

Alerts never block the customer form — if WhatsApp fails, the lead is still saved in CRM.

## Optional env toggles

```
CRM_ALERTS_ENABLED=true
CRM_ALERT_WHATSAPP=+97517643416
CRM_ALERT_EMAIL=you@email.com
NEXT_PUBLIC_SITE_URL=https://www.wangchuksbhutantours.bt
```
