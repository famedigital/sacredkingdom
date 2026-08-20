'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Eye,
  Edit,
  Mail,
  Calendar,
  Users,
  Check,
  X,
  Clock,
  Download,
  Plus,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { BookingPayment } from '@/lib/bookings/payments';
import { openInvoicePrintWindow } from '@/lib/bookings/invoice';
import { parseQuoteFromNotes } from '@/lib/quotes/client-quote';
import { BookingOpsPanel } from '@/components/admin/BookingOpsPanel';
import { opsClientHref } from '@/lib/ops/client-key';

interface Booking {
  id: string;
  booking_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  tour_id: string;
  tour: {
    title: string;
    category: string;
    duration: number;
    price?: number | null;
  } | null;
  tour_title?: string | null;
  number_of_adults: number;
  number_of_children: number;
  total_travelers: number;
  travel_date: string;
  total_amount: number;
  deposit_amount: number;
  deposit_paid: boolean;
  payment_status: string;
  status: string;
  assigned_to?: string;
  created_at: string;
  client_id?: string | null;
  payments?: BookingPayment[];
  amount_paid?: number;
  balance_due?: number;
  suggested_total?: number | null;
}

type PaymentDialogMode = 'confirm' | 'add';

export function BookingManagement() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [savingAmount, setSavingAmount] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentDialogMode>('add');
  const [paymentTarget, setPaymentTarget] = useState<Booking | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [savingPayment, setSavingPayment] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [filterStatus, filterDateFrom, filterDateTo, searchQuery]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id || loading || bookings.length === 0) return;
    const match = bookings.find((b) => b.id === id);
    if (match) {
      setFocusId(id);
      openDetailModal(match);
      router.replace('/admin/bookings', { scroll: false });
    }
  }, [searchParams, bookings, loading]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      if (filterDateFrom) params.append('date_from', filterDateFrom);
      if (filterDateTo) params.append('date_to', filterDateTo);

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const patchBooking = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
  };

  const updateBookingStatus = async (id: string, status: string) => {
    if (status === 'confirmed') {
      const booking = bookings.find((b) => b.id === id);
      if (booking) openPaymentDialog(booking, 'confirm');
      return;
    }
    try {
      await patchBooking({ id, status });
      toast.success(`Booking marked ${status}`);
      await fetchBookings();
      window.dispatchEvent(new Event('admin-badges-refresh'));
    } catch {
      toast.error('Failed to update booking');
    }
  };

  const openPaymentDialog = (booking: Booking, mode: PaymentDialogMode) => {
    setPaymentTarget(booking);
    setPaymentMode(mode);
    const baseTotal = Number(booking.total_amount || booking.suggested_total || 0);
    const suggested =
      mode === 'confirm' && !(booking.amount_paid || booking.deposit_amount) && baseTotal > 0
        ? Math.round(baseTotal * 0.3 * 100) / 100
        : '';
    setPaymentAmount(suggested ? String(suggested) : '');
    setPaymentNote('');
    setPaymentMethod('bank');
    setPaymentDialogOpen(true);
  };

  const submitPaymentDialog = async () => {
    if (!paymentTarget) return;
    const amount = Number(paymentAmount);
    if (paymentAmount !== '' && (!Number.isFinite(amount) || amount < 0)) {
      toast.error('Enter a valid deposit amount');
      return;
    }

    try {
      setSavingPayment(true);
      const updated = await patchBooking({
        id: paymentTarget.id,
        action: paymentMode === 'confirm' ? 'confirm' : 'add_payment',
        payment:
          amount > 0
            ? {
                amount,
                note: paymentNote || undefined,
                method: paymentMethod || 'deposit',
              }
            : undefined,
      });
      toast.success(
        paymentMode === 'confirm'
          ? amount > 0
            ? 'Booking confirmed with deposit recorded'
            : 'Booking confirmed'
          : 'Deposit recorded'
      );
      setPaymentDialogOpen(false);
      await fetchBookings();
      window.dispatchEvent(new Event('admin-badges-refresh'));
      if (showDetailModal) {
        setSelectedBooking(updated);
        setEditTotalAmount(String(updated.total_amount ?? 0));
      }
    } catch {
      toast.error('Could not save deposit');
    } finally {
      setSavingPayment(false);
    }
  };

  const openDetailModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditTotalAmount(
      String(
        Number(booking.total_amount) > 0
          ? booking.total_amount
          : booking.suggested_total || 0
      )
    );
    setShowDetailModal(true);
  };

  const saveTotalAmount = async () => {
    if (!selectedBooking) return;
    const next = Number(editTotalAmount);
    if (!Number.isFinite(next) || next < 0) {
      toast.error('Enter a valid total amount');
      return;
    }
    try {
      setSavingAmount(true);
      const updated = await patchBooking({
        id: selectedBooking.id,
        total_amount: Math.round(next * 100) / 100,
      });
      setSelectedBooking(updated);
      toast.success('Total amount updated');
      await fetchBookings();
    } catch {
      toast.error('Could not update amount');
    } finally {
      setSavingAmount(false);
    }
  };

  const applySuggestedTotal = () => {
    if (selectedBooking?.suggested_total != null) {
      setEditTotalAmount(String(selectedBooking.suggested_total));
    }
  };

  const downloadInvoice = async (booking: Booking) => {
    try {
      const total =
        Number(booking.total_amount) > 0
          ? Number(booking.total_amount)
          : Number(booking.suggested_total || 0);
      let quote = null;
      try {
        const opsRes = await fetch(`/api/admin/bookings/${booking.id}/operations`);
        if (opsRes.ok) {
          const opsJson = await opsRes.json();
          quote = parseQuoteFromNotes(opsJson.operations?.internal_notes);
        }
      } catch {
        /* invoice still opens without quote lines */
      }
      await openInvoicePrintWindow({
        ...booking,
        total_amount: total,
        payments: booking.payments || [],
        quote,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not open invoice');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const tourTitle = (booking: Booking) =>
    booking.tour?.title || booking.tour_title || 'Custom tour';

  const amountPaid = (booking: Booking) =>
    Number(booking.amount_paid ?? booking.deposit_amount ?? 0);

  const displayTotal = (booking: Booking) => {
    const total = Number(booking.total_amount || 0);
    if (total > 0) return total;
    return Number(booking.suggested_total || 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      case 'completed':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'partial':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'pending':
        return 'bg-muted text-muted-foreground';
      case 'refunded':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const inputClassName =
    'flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30';

  const BookingActions = ({ booking }: { booking: Booking }) => (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => openDetailModal(booking)}
        title="View details"
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => openPaymentDialog(booking, 'add')}
        title="Add deposit"
      >
        <Banknote className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => downloadInvoice(booking)}
        title="Download invoice"
      >
        <Download className="w-4 h-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
          title="Quick actions"
        >
          <Edit className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
            <Check className="w-4 h-4 text-green-600" />
            Confirm + deposit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openPaymentDialog(booking, 'add')}>
            <Plus className="w-4 h-4" />
            Record deposit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => downloadInvoice(booking)}>
            <Download className="w-4 h-4" />
            Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'completed')}>
            <Check className="w-4 h-4 text-blue-600" />
            Mark complete
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
            <X className="w-4 h-4 text-destructive" />
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{bookings.length} bookings</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={inputClassName}
              >
                <option value="all">All status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className={inputClassName}
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className={inputClassName}
              />
            </div>
          </CardContent>
        </Card>

        <div className="wash-dusk -mx-4 grid grid-cols-2 gap-3 px-4 py-6 md:-mx-6 md:grid-cols-4 md:gap-6 md:px-6">
          {[
            {
              label: 'Pending',
              value: bookings.filter((b) => b.status === 'pending').length,
            },
            {
              label: 'Confirmed',
              value: bookings.filter((b) => b.status === 'confirmed').length,
            },
            {
              label: 'Completed',
              value: bookings.filter((b) => b.status === 'completed').length,
            },
            {
              label: 'Cancelled',
              value: bookings.filter((b) => b.status === 'cancelled').length,
            },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card shadow-none">
              <CardContent className="p-4 md:p-6">
                <div className="mb-2 flex items-center justify-between md:mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary md:h-12 md:w-12">
                    <Calendar className="h-4 w-4 text-primary-foreground md:h-6 md:w-6" />
                  </div>
                  <span className="font-accent text-xl font-medium md:text-2xl">{stat.value}</span>
                </div>
                <div className="text-xs text-muted-foreground md:text-sm">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : bookings.length > 0 ? (
          <>
            <div className="space-y-3 md:hidden">
              {bookings.map((booking) => (
                <Card
                  key={booking.id}
                  className={cn(focusId === booking.id && 'ring-2 ring-primary')}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {booking.client_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.booking_number}</p>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium line-clamp-2">{tourTitle(booking)}</p>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(booking.travel_date)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {booking.total_travelers || 0}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Total
                        </p>
                        <p className="text-sm font-semibold">
                          ${displayTotal(booking).toLocaleString()}
                        </p>
                        {!booking.total_amount && booking.suggested_total ? (
                          <p className="text-[10px] text-amber-600">from tour</p>
                        ) : null}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Paid
                        </p>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                          ${amountPaid(booking).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Due
                        </p>
                        <p className="text-sm font-semibold">
                          $
                          {Math.max(
                            0,
                            displayTotal(booking) - amountPaid(booking)
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${getPaymentStatusColor(booking.payment_status)}`}
                      >
                        {booking.payment_status}
                      </span>
                      <BookingActions booking={booking} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="hidden md:block overflow-hidden py-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                        Booking #
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                        Client
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                        Tour
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                        Travel
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                        Amount
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                        Status
                      </th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className={cn(
                          'border-b border-border hover:bg-muted/50',
                          focusId === booking.id && 'bg-primary/5'
                        )}
                      >
                        <td className="py-4 px-6 font-medium">{booking.booking_number}</td>
                        <td className="py-4 px-6">
                          <div className="font-medium">{booking.client_name}</div>
                          <div className="text-sm text-muted-foreground">{booking.client_email}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">{tourTitle(booking)}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {booking.tour?.category}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {formatDate(booking.travel_date)}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            {booking.total_travelers || 0} travelers
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium">
                            ${displayTotal(booking).toLocaleString()}
                          </div>
                          {!booking.total_amount && booking.suggested_total ? (
                            <div className="text-xs text-amber-600">Suggested from tour price</div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              Paid ${amountPaid(booking).toLocaleString()} · Due $
                              {Math.max(
                                0,
                                displayTotal(booking) - amountPaid(booking)
                              ).toLocaleString()}
                            </div>
                          )}
                          <span
                            className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${getPaymentStatusColor(booking.payment_status)}`}
                          >
                            {booking.payment_status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <BookingActions booking={booking} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                Bookings will appear here once customers start booking tours
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Booking {selectedBooking.booking_number}</DialogTitle>
                <DialogDescription>
                  {selectedBooking.client_name} · {tourTitle(selectedBooking)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <span
                      className={`mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedBooking.status)}`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <span
                      className={`mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusColor(selectedBooking.payment_status)}`}
                    >
                      {selectedBooking.payment_status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Email: </span>
                    {selectedBooking.client_email}
                  </p>
                  {selectedBooking.client_phone && (
                    <p>
                      <span className="text-muted-foreground">Phone: </span>
                      {selectedBooking.client_phone}
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground">Travel: </span>
                    {formatDate(selectedBooking.travel_date)} ·{' '}
                    {selectedBooking.total_travelers || 0} travelers
                  </p>
                </div>

                <div className="space-y-3 rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm">Tour total (USD)</h3>
                    {selectedBooking.suggested_total != null && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={applySuggestedTotal}
                      >
                        Use tour price (${selectedBooking.suggested_total.toLocaleString()})
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editTotalAmount}
                      onChange={(e) => setEditTotalAmount(e.target.value)}
                      className="sm:flex-1"
                    />
                    <Button
                      type="button"
                      onClick={saveTotalAmount}
                      disabled={savingAmount}
                      className="sm:w-auto"
                    >
                      {savingAmount ? 'Saving…' : 'Save amount'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-sm">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Paid</p>
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        ${amountPaid(selectedBooking).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Balance</p>
                      <p className="font-semibold">
                        $
                        {Math.max(
                          0,
                          Number(editTotalAmount || 0) - amountPaid(selectedBooking)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Deposit history</h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openPaymentDialog(selectedBooking, 'add')}
                    >
                      <Plus className="w-4 h-4" />
                      Add deposit
                    </Button>
                  </div>
                  {(selectedBooking.payments?.length || 0) === 0 ? (
                    <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-4 text-center">
                      No deposits recorded yet
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedBooking.payments!.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">${p.amount.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(p.paid_at)}
                              {p.method ? ` · ${p.method}` : ''}
                              {p.note ? ` · ${p.note}` : ''}
                            </p>
                          </div>
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-border p-3">
                  <h3 className="mb-3 font-semibold text-sm">Operations · Documents · Share</h3>
                  <BookingOpsPanel
                    bookingId={selectedBooking.id}
                    bookingStatus={selectedBooking.status}
                    operationsHref={opsClientHref({
                      id: selectedBooking.client_id,
                      email: selectedBooking.client_email,
                    })}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    window.open(`mailto:${selectedBooking.client_email}`, '_blank')
                  }
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <div className="flex gap-2">
                  {selectedBooking.status === 'pending' && (
                    <Button
                      type="button"
                      onClick={() => openPaymentDialog(selectedBooking, 'confirm')}
                    >
                      <Check className="w-4 h-4" />
                      Confirm
                    </Button>
                  )}
                  <Button type="button" onClick={() => downloadInvoice(selectedBooking)}>
                    <Download className="w-4 h-4" />
                    Invoice
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentMode === 'confirm' ? 'Confirm booking' : 'Record deposit'}
            </DialogTitle>
            <DialogDescription>
              {paymentTarget
                ? `${paymentTarget.booking_number} · ${paymentTarget.client_name}. You can leave amount blank to confirm without a deposit, or add another installment anytime.`
                : 'Enter deposit details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {paymentTarget && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tour total</span>
                  <span className="font-medium">
                    ${displayTotal(paymentTarget).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already paid</span>
                  <span className="font-medium">
                    ${amountPaid(paymentTarget).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance due</span>
                  <span className="font-medium">
                    $
                    {Math.max(
                      0,
                      displayTotal(paymentTarget) - amountPaid(paymentTarget)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Deposit amount (USD)</Label>
              <Input
                id="deposit-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 500"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit-method">Method</Label>
              <select
                id="deposit-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={inputClassName}
              >
                <option value="bank">Bank transfer</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="western_union">Western Union</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit-note">Note (optional)</Label>
              <Input
                id="deposit-note"
                placeholder="Reference / receipt #"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              disabled={savingPayment}
            >
              Cancel
            </Button>
            <Button type="button" onClick={submitPaymentDialog} disabled={savingPayment}>
              {savingPayment ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : paymentMode === 'confirm' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {paymentMode === 'confirm' ? 'Confirm booking' : 'Save deposit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
