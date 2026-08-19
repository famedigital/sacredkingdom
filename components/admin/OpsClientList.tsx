'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Plus, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { opsClientHref } from '@/lib/ops/client-key';
import { authFetch } from '@/lib/auth/fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Customer = {
  id?: string;
  email: string;
  name: string;
  phone?: string | null;
  bookings: number;
  inquiries: number;
  last_contact: string;
};

type TourOption = { id: string; title: string };

export function OpsClientList() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tours, setTours] = useState<TourOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    tour_id: '',
    travel_date: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [custRes, tourRes] = await Promise.all([
        authFetch('/api/admin/customers'),
        authFetch('/api/admin/tours?limit=100'),
      ]);
      const custJson = await custRes.json();
      if (!custRes.ok) throw new Error(custJson.error || 'Failed to load clients');
      setCustomers(custJson.customers || []);
      if (tourRes.ok) {
        const tourJson = await tourRes.json();
        setTours((tourJson.tours || []).map((t: { id: string; title: string }) => ({ id: t.id, title: t.title })));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    );
  });

  const createClient = async () => {
    setSaving(true);
    try {
      const res = await authFetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          tour_id: form.tour_id || null,
          travel_date: form.travel_date || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not add client');
      toast.success(form.tour_id ? 'Client added with a trip' : 'Client added');
      setOpen(false);
      setForm({ name: '', email: '', phone: '', tour_id: '', travel_date: '' });
      if (json.href) {
        router.push(json.href);
        return;
      }
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add client');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="mx-auto mb-2 size-6 animate-spin" />
        Loading clients…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="h-11 w-full rounded-xl border border-border bg-background pr-4 pl-10 text-sm"
          />
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Add client
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-12 text-center text-muted-foreground">
          <Users className="mx-auto mb-2 size-10 opacity-40" />
          No clients yet. Use Add client to create Mr A, then open the file.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id || c.email} className="border-t border-border">
                  <td className="p-4 font-medium">
                    <Link href={opsClientHref(c)} className="hover:text-primary hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-4">{c.email}</td>
                  <td className="p-4">{c.phone || '—'}</td>
                  <td className="p-4">{c.bookings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ops-client-name">Name</Label>
              <Input
                id="ops-client-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Mr A"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ops-client-email">Email</Label>
              <Input
                id="ops-client-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="guest@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ops-client-phone">Phone</Label>
              <Input
                id="ops-client-phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+975 …"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ops-client-tour">Trip (optional)</Label>
              <select
                id="ops-client-tour"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={form.tour_id}
                onChange={(e) => setForm((prev) => ({ ...prev, tour_id: e.target.value }))}
              >
                <option value="">No trip yet</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.title}
                  </option>
                ))}
              </select>
            </div>
            {form.tour_id ? (
              <div className="space-y-1.5">
                <Label htmlFor="ops-client-date">Travel date</Label>
                <Input
                  id="ops-client-date"
                  type="date"
                  value={form.travel_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, travel_date: e.target.value }))}
                />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={createClient} disabled={saving || !form.name.trim() || !form.email.trim()}>
              {saving ? 'Saving…' : 'Save client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
