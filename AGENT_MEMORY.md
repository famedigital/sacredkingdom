# Sacred Kingdom Travel — agent memory

**Last updated:** 2026-08-20  
**Status:** Live app + admin CMS + Operations client files. Not mock data.

## Identity

| | |
|---|---|
| Client | Sacred Kingdom Travel (Bhutan inbound) |
| Workspace | `c:\GitHub\sacred himalayan` |
| GitHub | https://github.com/famedigital/sacredkingdom.git |
| Default branch | `master` |
| GitHub CLI (push) | `famedigital` |
| Package name | `sacred-kingdom-travel` |
| Founder | Kinzang Coth — portrait `public/images/founder-kinzang-coth.jpg` (not monastery stock) |

Legacy names in the DB (Wangchuk Tours, Sacred Himalaya) must **never** show on the public site. Use `normalizeCompanyName`.

## Stack

- Next.js **16.2.9** App Router, React 19, TypeScript, Tailwind **4**, shadcn/ui
- Auth: custom JWT + httpOnly cookies (`lib/auth/jwt.ts`). Access ~12h, refresh ~30d. When refreshing, **strip `exp` / `iat` / `nbf`** via `signingPayload` or `jwt.sign` throws and the admin gets 401.
- Admin APIs: `requireAuth` / `getCurrentUser`; DB writes via `createAdminClient()` (service role).
- Supabase (Postgres): project **`ugsjyzuyorfwzxfonpbz`** — URL only in `.env.local`, never commit keys.
- Cloudinary cloud **`hqxti5zm`**, folder **`sacred-himalaya/`**. Partner logos: `sacred-himalaya/partners/*` (transparent PNGs).
- Admin login path: `/admin/login`. Local admin email historically `admin@sacredkingdom.travel` — password lives in Supabase `admin_users`, **not in git**.

## Brand (public)

- Black `#0A0A0A`, gold `#C4A35A` / `#E8D5A3`, ivory `#F4F1EA`
- Mega menu hover: gold wash + border (`megaRowClass` in `PublicMegaMenu.tsx`)
- Destinations “three stills”: **mosaic** (Paro large, Punakha/Haa stacked) in `DestinationPortraits.tsx` — not a gallery plate
- Partners: wash-dusk bar → thin ticker → centered static row (`PartnersMarquee.tsx`)
- Do not put partner marks on white cards

## Operations (how clients work)

Sidebar: **Clients** `/admin/operations` and **Rosters** `/admin/operations/rosters`. Old `/admin/operations/guides` (etc.) redirect via `app/admin/operations/[resource]/page.tsx`.

1. List: `OpsClientList` — search + **Add client** (name, email, optional phone, optional tour + travel date).
2. Create: `POST /api/admin/customers` → `upsertMasterClient` (`lib/clients/upsert.ts`). Optional tour creates a pending `bookings` row.
3. File: `/admin/operations/clients/[id]` (`opsClientHref` in `lib/ops/client-key.ts`) — booking switcher + tabs: Guide, Car, Hotels, Flights, Payments, Expenses, Docs, Source, Rates.
4. Rates persist as `Rate: {name}` in `booking_operations.internal_notes` (no extra table).
5. Alternate create path: Tours → Clients → `POST /api/admin/tours/[id]/clients`.
6. Bookings dialog: “Open in Operations” uses `opsClientHref`.

Master table: `clients` (`migrations/20260722_master_clients_itinerary.sql`). If missing, GET customers falls back to bookings/inquiries; POST add-client fails until the migration is run.

Rosters (guides, cars, hotels, …) stay on `/admin/operations/rosters?tab=`.

## Public + CMS map

- Public: `/` `/tours` `/tours/[slug]` `/about` `/contact` `/blog` `/journal` `/bhutan` `/experience` `/travel-info` `/faq` `/privacy` `/terms`
- Admin: sidebar in `components/admin/AdminSidebar.tsx`
- In-app staff manual: `/admin/docs` (`AdminDocumentation.tsx`)
- Operator SQL after `DEPLOY_DATABASE.sql`: files in `migrations/`

## Dev

```bash
npm run dev    # if 3000 is taken, Next picks 3001/3003 — check the terminal
npm run build
```

Do not commit `.env*`. Do not put Cloudinary API secrets or Supabase service-role keys in markdown.

## Do not regress

- JWT refresh must use a clean signing payload (no `exp` on the object passed to `jwt.sign`)
- Contact page: declare `officeHoursNote` before `contactItems` (TDZ)
- Founder image is SKT portrait, not `download-5.jpeg`
- CSS class `.gold-rule {` brace must stay valid
