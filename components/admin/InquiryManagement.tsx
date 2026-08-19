'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Mail, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Inquiry = {
  id: string;
  name?: string;
  client_name?: string;
  email?: string;
  client_email?: string;
  phone?: string;
  client_phone?: string;
  message?: string;
  status?: string;
  created_at?: string;
  subject?: string;
  tour_interest?: string;
};

const filterSelectClassName =
  'flex h-11 w-full sm:w-44 shrink-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30';

const statusSelectClassName =
  'flex h-9 w-auto min-w-[7.5rem] shrink-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30';

export function InquiryManagement() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [focusId, setFocusId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/inquiries?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id || loading || inquiries.length === 0) return;
    const match = inquiries.find((i) => i.id === id);
    if (match) {
      setFocusId(id);
      router.replace('/admin/inquiries', { scroll: false });
      requestAnimationFrame(() => {
        document.getElementById(`inquiry-${id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
    }
  }, [searchParams, inquiries, loading, router]);

  const updateStatus = async (id: string, next: string) => {
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: next }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Status updated');
      await load();
      window.dispatchEvent(new Event('admin-badges-refresh'));
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search inquiries..."
            className="min-h-11 pl-10"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={filterSelectClassName}
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
        <Button type="button" onClick={load} className="min-h-11 sm:w-auto">
          Search
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...
        </div>
      ) : inquiries.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
          <Mail className="h-10 w-10 mx-auto mb-2 opacity-40" />
          No inquiries yet
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((item) => {
            const name = item.name || item.client_name || 'Unknown';
            const email = item.email || item.client_email || '';
            const phone = item.phone || item.client_phone || '';
            return (
              <Card
                key={item.id}
                id={`inquiry-${item.id}`}
                className={cn(focusId === item.id && 'ring-2 ring-primary')}
              >
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{name}</p>
                      <p className="text-sm text-muted-foreground truncate">{email}</p>
                      {phone ? (
                        <p className="text-xs text-muted-foreground mt-0.5">{phone}</p>
                      ) : null}
                    </div>
                    <select
                      value={item.status || 'new'}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className={statusSelectClassName}
                      aria-label="Inquiry status"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {(item.subject || item.tour_interest) && (
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {[item.subject, item.tour_interest].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {item.message || '—'}
                  </p>

                  <p className="text-xs text-muted-foreground mt-3">
                    {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
