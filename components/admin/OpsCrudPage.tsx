'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { emptyOpsRecord, type OpsResource } from '@/lib/ops/registry';
import { authFetch } from '@/lib/auth/fetch';

type BookingOption = { id: string; label: string };

function displayValue(value: unknown) {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export function OpsCrudPage({
  resource,
  bookingId,
}: {
  resource: OpsResource;
  bookingId?: string;
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(emptyOpsRecord(resource));
  const [saving, setSaving] = useState(false);

  const needsBookings = resource.fields.some((field) => field.booking) && !bookingId;

  const load = async () => {
    setLoading(true);
    try {
      const [res, bookingRes] = await Promise.all([
        authFetch(
          bookingId
            ? `/api/admin/operations/${resource.id}?booking_id=${encodeURIComponent(bookingId)}`
            : `/api/admin/operations/${resource.id}`
        ),
        needsBookings ? authFetch('/api/admin/bookings?limit=100') : Promise.resolve(null),
      ]);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setRows(json.rows || []);
      if (bookingRes) {
        const bookingJson = await bookingRes.json();
        setBookings(
          (bookingJson.bookings || []).map((b: { id: string; booking_number?: string; client_name?: string }) => ({
            id: b.id,
            label: `${b.booking_number || b.id} — ${b.client_name || 'Guest'}`,
          }))
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource.id, bookingId]);

  const openCreate = () => {
    setEditingId(null);
    const next = emptyOpsRecord(resource);
    if (bookingId) next.booking_id = bookingId;
    setForm(next);
    setOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingId(String(row.id));
    const next = emptyOpsRecord(resource);
    for (const field of resource.fields) {
      next[field.key] = row[field.key] ?? next[field.key];
    }
    setForm(next);
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/operations/${resource.id}/${editingId}`
        : `/api/admin/operations/${resource.id}`;
      const res = await authFetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      toast.success(editingId ? 'Updated' : 'Created');
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this record?')) return;
    const res = await authFetch(`/api/admin/operations/${resource.id}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Delete failed');
      return;
    }
    toast.success('Deleted');
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const columns = resource.fields.filter((field) => !(bookingId && field.booking)).slice(0, 5);

  return (
    <Card className="shadow-none">
      <CardHeader className="flex-row items-center justify-end">
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((field) => (
                  <TableHead key={field.key}>{field.label}</TableHead>
                ))}
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={String(row.id)}>
                  {columns.map((field) => (
                    <TableCell key={field.key}>
                      {field.booking
                        ? bookings.find((b) => b.id === row[field.key])?.label || displayValue(row[field.key])
                        : displayValue(row[field.key])}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => openEdit(row)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(String(row.id))}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? `Edit ${resource.title}` : `Add ${resource.title}`}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {resource.fields
              .filter((field) => !(bookingId && field.booking))
              .map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label>{field.label}</Label>
                {field.booking ? (
                  <select
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    value={String(form[field.key] || '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  >
                    <option value="">Select booking</option>
                    {bookings.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    value={String(form[field.key] ?? '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  />
                ) : field.type === 'boolean' ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(form[field.key])}
                      onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.checked }))}
                    />
                    Yes
                  </label>
                ) : field.type === 'select' ? (
                  <select
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    value={String(form[field.key] || '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  >
                    {(field.options || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    value={String(form[field.key] ?? '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
