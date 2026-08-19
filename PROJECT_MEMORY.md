# Sacred Kingdom Travel — project memory

**Last updated:** 2026-08-20  
**GitHub:** https://github.com/famedigital/sacredkingdom.git (`master`)

This file is for architecture and where to edit. Credentials stay in `.env.local` / Vercel — **never paste keys here**.

## What this app is

Next.js 16 App Router site + JWT admin CMS for Sacred Kingdom Travel. Public pages read Supabase (tours, blog, hero, settings). Admin mutates the same DB. Operations is a **client file** (one guest → their bookings → guide/car/hotels/flights/payments/docs).

## Environment (names only)

Copy values from the operator’s `.env.local` into Vercel. Required:

- `NEXT_PUBLIC_SUPABASE_URL` — live project `https://ugsjyzuyorfwzxfonpbz.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` and/or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — live cloud `hqxti5zm`
- `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL` (production origin)
- Optional mail: `SMTP_*` or `RESEND_API_KEY`

Old docs that mention `iqbwlmoadphkuewubszd` or Cloudinary `hckgrdeh` are **legacy**. Do not restore those as “the” backend.

## Auth

| File | Role |
|---|---|
| `lib/auth/jwt.ts` | Sign/verify; `signingPayload` strips `exp`/`iat`/`nbf` |
| `lib/auth/require-auth.ts` | API gate |
| `lib/auth/fetch.ts` | Browser `authFetch` with refresh |
| `app/api/auth/login/route.ts` | Login |
| `app/api/auth/refresh/route.ts` | Refresh |
| `middleware.ts` | Route protection |

Admin users table: `admin_users`. Manage in `/admin/settings/users`.

## Data model (ops)

```
clients (master, unique email)
  └── bookings (engagement: tour + travel date + itinerary_override)
        ├── booking_operations (guide, vehicle, hotels, notes/rates)
        ├── flights / payments / expenses (CRUD APIs, filter ?booking_id=)
        └── documents + share links
```

Rosters (`ops_guides`, `ops_vehicles`, `ops_hotels`, …) defined in `lib/ops/registry.ts`.

## Key files

| Area | Path |
|---|---|
| Brand name | `lib/brand-defaults.ts` |
| Logo / Cloudinary ids | `lib/brand-logo.ts` |
| Client upsert | `lib/clients/upsert.ts` |
| Ops client URL | `lib/ops/client-key.ts` |
| Clients list + add | `components/admin/OpsClientList.tsx` |
| Client file | `components/admin/ClientOpsWorkspace.tsx` |
| Booking ops tabs | `components/admin/BookingOpsPanel.tsx` |
| Customers API | `app/api/admin/customers/route.ts` (`GET` + `POST`) |
| Tour-scoped clients | `app/api/admin/tours/[id]/clients/route.ts` |
| Destinations mosaic | `components/public/DestinationPortraits.tsx` |
| Partners | `components/public/PartnersMarquee.tsx` |
| Founder | `components/public/FounderPortrait.tsx` |
| Schema | `migrations/*.sql`, `DEPLOY_DATABASE.sql` |

## UI verification

When changing admin or public UI, exercise the flow in the browser (or curl authenticated APIs). A screenshot is not enough. If no browser tools, say so and use `curl` / the running `npm run dev` port from the terminal.
