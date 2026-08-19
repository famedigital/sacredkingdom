# Run in Supabase SQL Editor (in order)

1. [`migrations/20260722_booking_operations_shares_docs.sql`](./migrations/20260722_booking_operations_shares_docs.sql)  
   Ops · share links · documents · tour naked share token

2. [`migrations/20260722_master_clients_itinerary.sql`](./migrations/20260722_master_clients_itinerary.sql)  
   Master `clients` table · `bookings.client_id` · `bookings.itinerary_override`

## Model

```
tours (package)
  └── bookings (client engagement under that tour)
        ├── client_id → clients (master person profile)
        ├── itinerary_override (custom days for this client)
        ├── booking_operations (guide / driver / hotels)
        ├── booking_documents (SDF / invoices / vouchers / payments)
        └── booking_share_links (naked client / staff no-rates)
```

Public booking/inquire on a tour auto-creates/links the master client.

Full notes: [`docs/TOUR_OPS_AND_ITINERARY_SHARING.md`](./docs/TOUR_OPS_AND_ITINERARY_SHARING.md)
