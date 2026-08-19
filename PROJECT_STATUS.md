# Sacred Kingdom Travel — status

**Updated:** 2026-08-20

## Done

- Public folio site (home, tours, about, contact, blog/journal, legal)
- JWT admin CMS: tours, blog, media (Cloudinary), bookings, inquiries, customers, settings, hero, homepage
- Master `clients` + tour engagements (`bookings`)
- Operations: client list, add client, client file tabs, rosters
- Itinerary override + naked share links
- GitHub: `famedigital/sacredkingdom` (`master`)
- Brand: Sacred Kingdom Travel; founder Kinzang Coth portrait on About

## Not mock

Admin is wired to Supabase. `lib/mock-data/` is leftover sample content — do not treat it as the live source of truth.

## Operator follow-ups

- Keep Vercel env in sync with `.env.local` (names in `VERCEL_ENV_SETUP.md`)
- Run any unapplied files in `migrations/` on the live Supabase project
- Change default admin password in `admin_users` if it is still a seed value
- Custom domain / production URL: set `NEXT_PUBLIC_APP_URL`

## Local

```bash
cd "c:\GitHub\sacred himalayan"
npm run dev
```

Login: `/admin/login`. If port 3000 is busy, use the port printed in the terminal.

## Git

```bash
gh auth switch --user famedigital
git push origin master
```

Do not force-push `master` unless the operator explicitly asks.
