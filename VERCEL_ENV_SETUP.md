# Vercel environment variables

Do **not** paste API secrets, service-role JWTs, or Cloudinary URL passwords into this file or into git.

## Where to set them

Vercel project → Settings → Environment Variables (Production, Preview, Development as needed). Values come from the operator’s local `.env.local`.

## Names to add

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
JWT_SECRET
NEXT_PUBLIC_APP_URL
```

Optional (password reset / contact mail):

```
SMTP_HOST
SMTP_USER
SMTP_PASS
RESEND_API_KEY
```

## Live project refs (public)

These are **not secrets**. Keys still stay in Vercel / `.env.local`.

- Supabase: `https://ugsjyzuyorfwzxfonpbz.supabase.co`
- Cloudinary cloud name: `hqxti5zm` (uploads under `sacred-himalaya/`)

After changing env, redeploy.

`.env.local` is gitignored. Do not commit it.
