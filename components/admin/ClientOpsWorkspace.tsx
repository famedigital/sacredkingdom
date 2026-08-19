'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BookingOpsPanel } from '@/components/admin/BookingOpsPanel';
import { authFetch } from '@/lib/auth/fetch';

type ClientBooking = {
  id: string;
  booking_number: string;
  travel_date: string;
  status: string;
  tour_title: string;
};

type ClientFile = {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
};

export function ClientOpsWorkspace({ clientKey }: { clientKey: string }) {
  const [client, setClient] = useState<ClientFile | null>(null);
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await authFetch(`/api/admin/customers/${encodeURIComponent(clientKey)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load client');
        if (cancelled) return;
        setClient(json.client);
        const nextBookings: ClientBooking[] = json.bookings || [];
        setBookings(nextBookings);
        setBookingId((current) =>
          nextBookings.some((b) => b.id === current) ? current : nextBookings[0]?.id || ''
        );
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : 'Failed to load client');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientKey]);

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="mx-auto mb-2 size-6 animate-spin" />
        Loading client file…
      </div>
    );
  }

  if (!client) {
    return <p className="text-sm text-muted-foreground">Client not found.</p>;
  }

  const selected = bookings.find((b) => b.id === bookingId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-accent text-2xl font-medium tracking-tight">{client.name}</h2>
          <p className="text-sm text-muted-foreground">
            {client.email}
            {client.phone ? ` · ${client.phone}` : ''}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{bookings.length} booking{bookings.length === 1 ? '' : 's'}</p>
        </div>
        <Link href="/admin/operations" className="text-sm text-primary hover:underline">
          All clients
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          No bookings yet. Operations tabs appear once a trip is attached to this client.
        </p>
      ) : (
        <>
          <div className="max-w-lg space-y-1.5">
            <label className="text-sm font-medium" htmlFor="ops-booking">
              Trip
            </label>
            <select
              id="ops-booking"
              className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            >
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.booking_number} · {booking.tour_title}
                  {booking.travel_date ? ` · ${booking.travel_date}` : ''}
                </option>
              ))}
            </select>
          </div>
          {selected ? (
            <BookingOpsPanel
              key={selected.id}
              bookingId={selected.id}
              bookingStatus={selected.status}
              variant="client"
            />
          ) : null}
        </>
      )}
    </div>
  );
}
