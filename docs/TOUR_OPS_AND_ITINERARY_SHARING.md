# Tour Publish · Clients · Naked Itinerary · Booking Operations

**Status:** In progress  
**Branch:** `cursor/tour-ops-share-docs-0d14`  
**SQL (run both in Supabase, in order):**
1. `migrations/20260722_booking_operations_shares_docs.sql`
2. `migrations/20260722_master_clients_itinerary.sql`

---

## Data model (what you asked for)

```
Master client (clients)
   ↑ linked by email / client_id
Tour package (tours)
   └── Engagement (bookings)  ← created when client books OR admin adds client under tour
         ├── Custom itinerary (itinerary_override)
         ├── Operations (guide, driver, hotels)
         ├── Documents (SDF, invoices, payments, vouchers)
         └── Share links (client naked / guide-driver no rates)
```

- **Master client** = one person across the CRM (email unique).
- **Under a tour** = all bookings/engagements for that package.
- Booking or inquire on a tour → upserts master client + creates engagement under that tour.
- Admin → Tours → **Clients** → add client manually (same flow).
- Open engagement → Ops · Itinerary · Documents · Share.

---

## Goals

1. **Publish tour to public or not**
2. **Naked itinerary + share link** (no rates)
3. **Operations** after confirm — guide, driver, hotels, vouchers
4. **Staff share** without rates
5. **Documents** — SDF, invoices, payments, room vouchers
6. **Clients under tour** linked to master client + per-client itinerary changes

---

## Admin UX

### Tours
- Published to public switch (enforced on `/tours`)
- Copy naked itinerary link (package)
- **Clients** button → list engagements + Add client

### Bookings detail
- Operations · Itinerary · Documents · Share tabs

---

## Deploy checklist

1. Run both SQL migrations in Supabase
2. Deploy app
3. Tours → Clients → Add client (or book from public site)
4. Open booking → customize itinerary / ops / docs / share
