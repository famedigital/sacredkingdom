'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Engagement = {
  id: string;
  booking_number: string;
  client_id?: string | null;
  client_name: string;
  client_email: string;
  client_phone?: string | null;
  status: string;
  travel_date?: string | null;
  total_amount?: number | null;
  has_custom_itinerary?: boolean;
  master_client?: { id: string; name: string; email: string } | null;
  created_at: string;
};

export function TourClientsPanel({ tourId, tourTitle }: { tourId: string; tourTitle?: string }) {
  const router = useRouter();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    travel_date: '',
    number_of_adults: '2',
    notes: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}/clients`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setEngagements(json.engagements || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  const createClient = async () => {
    setCreating(true);
    try {
      const res = await fetch(`/api/admin/tours/${tourId}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          travel_date: form.travel_date || null,
          number_of_adults: form.number_of_adults,
          notes: form.notes || null,
          copy_itinerary: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Create failed');
      toast.success('Client created under this tour (linked to master client)');
      setShowForm(false);
      setForm({
        name: '',
        email: '',
        phone: '',
        travel_date: '',
        number_of_adults: '2',
        notes: '',
      });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setCreating(false);
    }
  };

  const openBooking = (bookingId: string) => {
    router.push(`/admin/bookings?focus=${bookingId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold">Clients on this tour</h3>
          <p className="text-sm text-muted-foreground">
            {tourTitle
              ? `Engagements for “${tourTitle}” — each links to a master client with ops, docs, and custom itinerary.`
              : 'Each booking links to a master client profile.'}
          </p>
        </div>
        <Button type="button" size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          Add client
        </Button>
      </div>

      {showForm ? (
        <div className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Travel date</Label>
            <Input
              type="date"
              value={form.travel_date}
              onChange={(e) => setForm((f) => ({ ...f, travel_date: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Adults</Label>
            <Input
              type="number"
              min="1"
              value={form.number_of_adults}
              onChange={(e) => setForm((f) => ({ ...f, number_of_adults: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="button" onClick={createClient} disabled={creating || !form.name || !form.email}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create under tour
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Creates/updates master client by email, copies package itinerary for customization, and
              opens as a booking engagement.
            </p>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : engagements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
          No clients yet. They appear when someone books this tour, or add one manually above.
        </div>
      ) : (
        <ul className="space-y-2">
          {engagements.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {e.client_name}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {e.booking_number}
                  </span>
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {e.client_email}
                  {e.client_phone ? ` · ${e.client_phone}` : ''}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="capitalize">{e.status}</span>
                  {e.travel_date ? ` · ${e.travel_date}` : ''}
                  {e.has_custom_itinerary ? ' · custom itinerary' : ''}
                  {e.master_client ? ' · linked master client' : ''}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => openBooking(e.id)}>
                <ExternalLink className="h-4 w-4" />
                Ops · Docs · Itinerary
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
