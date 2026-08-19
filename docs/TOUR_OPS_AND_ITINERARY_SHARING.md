# Tour publish · Clients · Naked itinerary · Operations

**Status:** Shipped (2026-08). See `AGENT_MEMORY.md` for current paths.

**SQL (Supabase, if tables are missing):**

1. `migrations/20260722_booking_operations_shares_docs.sql`
2. `migrations/20260722_master_clients_itinerary.sql`
3. Other files in `migrations/` as needed (`20260819_operations_department.sql`, etc.)

## Model

```
Master client (clients)
   └── Engagement (bookings) — tour + travel date
         ├── itinerary_override
         ├── booking_operations (guide, car, hotels, Rate: lines in notes)
         ├── flights / payments / expenses
         └── documents + share links
```

## How to add a client

1. **Operations → Clients → Add client** (`POST /api/admin/customers`) — optional tour.
2. **Tours → Clients** on a package (`POST /api/admin/tours/[id]/clients`).
3. Public book / inquire (upserts master client + engagement).

Open the file at `/admin/operations/clients/{id-or-email}` (`opsClientHref`).

Rosters: `/admin/operations/rosters`.
