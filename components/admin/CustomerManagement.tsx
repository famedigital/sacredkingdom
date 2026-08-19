'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users, Search } from 'lucide-react';
import { toast } from 'sonner';

type Customer = {
  email: string;
  name: string;
  phone?: string | null;
  bookings: number;
  inquiries: number;
  last_contact: string;
  sources: string[];
};

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((r) => r.json())
      .then((data) => setCustomers(data.customers || []))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
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

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full min-h-11 pl-10 pr-4 rounded-xl border border-gray-200"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-500 border border-dashed rounded-2xl">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
          No customers yet — they appear from bookings and contact inquiries
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Bookings</th>
                  <th className="p-4">Inquiries</th>
                  <th className="p-4">Last contact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.email} className="border-t">
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4">{c.email}</td>
                    <td className="p-4">{c.phone || '—'}</td>
                    <td className="p-4">{c.bookings}</td>
                    <td className="p-4">{c.inquiries}</td>
                    <td className="p-4">{new Date(c.last_contact).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((c) => (
              <div key={c.email} className="bg-white border rounded-2xl p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-gray-500">{c.email}</p>
                <p className="text-sm text-gray-500">{c.phone || 'No phone'}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {c.bookings} bookings · {c.inquiries} inquiries ·{' '}
                  {new Date(c.last_contact).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
