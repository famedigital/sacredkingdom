'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BOOKING_DOC_TYPE_LABELS } from '@/lib/bookings/operations';
import { authFetch } from '@/lib/auth/fetch';

type VaultRow = {
  id: string;
  title?: string | null;
  doc_type: string;
  file_url: string;
  file_name?: string | null;
  bookings?: { booking_number?: string; client_name?: string } | null;
};

export default function OpsVaultPage() {
  const [rows, setRows] = useState<VaultRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch('/api/admin/operations/vault');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load vault');
        setRows(json.rows || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load vault');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          index="05"
          section="Operations"
          title="Docs vault"
          description="Files stored under sacred-himalaya/ops and booking documents."
        />
        <Card className="shadow-none">
        <CardHeader>
          <CardDescription>
            Upload from a booking’s Documents tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.bookings?.booking_number || '—'}
                      {row.bookings?.client_name ? ` · ${row.bookings.client_name}` : ''}
                    </TableCell>
                    <TableCell>
                      {BOOKING_DOC_TYPE_LABELS[row.doc_type as keyof typeof BOOKING_DOC_TYPE_LABELS] ||
                        row.doc_type}
                    </TableCell>
                    <TableCell>{row.title || row.file_name || 'Document'}</TableCell>
                    <TableCell>
                      <a href={row.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Open
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}
