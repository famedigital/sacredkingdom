import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  createPaymentEntry,
  derivePaymentStatus,
  parsePaymentLedger,
  serializePaymentLedger,
  sumPayments,
  type BookingPayment,
} from '@/lib/bookings/payments';

function mapBooking(row: Record<string, unknown>) {
  const { payments, cleanNotes } = parsePaymentLedger(
    typeof row.notes === 'string' ? row.notes : null
  );
  const tours = row.tours as {
    title?: string;
    category?: string;
    duration?: number;
    price?: number | null;
  } | null;
  const amountPaid = sumPayments(payments);
  const totalAmount = Number(row.total_amount || 0);
  const travelers =
    Number(row.total_travelers) ||
    Number(row.number_of_adults || 0) + Number(row.number_of_children || 0) ||
    1;
  const tourUnitPrice = Number(tours?.price || 0);
  const suggestedTotal =
    tourUnitPrice > 0 ? Math.round(tourUnitPrice * travelers * 100) / 100 : null;

  return {
    ...row,
    tour: tours
      ? {
          title: tours.title,
          category: tours.category,
          duration: tours.duration,
          price: tours.price ?? null,
        }
      : row.tour_title
        ? { title: row.tour_title, category: null, duration: null, price: null }
        : null,
    tours: undefined,
    notes: cleanNotes,
    payments,
    amount_paid: amountPaid,
    balance_due: Math.max(0, totalAmount - amountPaid),
    suggested_total: suggestedTotal,
  };
}

// GET /api/admin/bookings - List all bookings
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const clientId = searchParams.get('client_id');
    const clientEmail = searchParams.get('client_email');
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from('bookings')
      .select('*, tours(title, category, duration, price)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(
        `client_name.ilike.%${search}%,client_email.ilike.%${search}%,booking_number.ilike.%${search}%`
      );
    }
    if (dateFrom) {
      query = query.gte('travel_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('travel_date', dateTo);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (clientEmail) {
      query = query.ilike('client_email', clientEmail);
    }

    const { data: bookings, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      bookings: (bookings || []).map((b) => mapBooking(b as Record<string, unknown>)),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Bookings list error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// PATCH /api/admin/bookings - Update booking / add payment / confirm
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, payment, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { payments, cleanNotes } = parsePaymentLedger(currentBooking.notes);
    let nextPayments: BookingPayment[] = payments;
    const payload: Record<string, unknown> = {
      updated_by: user.userId,
      updated_at: new Date().toISOString(),
    };

    if (action === 'add_payment' || action === 'confirm') {
      const amount = Number(payment?.amount);
      if (Number.isFinite(amount) && amount > 0) {
        nextPayments = [
          ...payments,
          createPaymentEntry({
            amount,
            note: payment?.note,
            method: payment?.method || 'deposit',
            paid_at: payment?.paid_at,
          }),
        ];
      }

      if (action === 'confirm') {
        payload.status = 'confirmed';
        payload.confirmation_date = new Date().toISOString();
      }
    } else if (action === 'remove_payment' && payment?.id) {
      nextPayments = payments.filter((p) => p.id !== payment.id);
    } else {
      const allowed = [
        'status',
        'payment_status',
        'deposit_paid',
        'deposit_amount',
        'total_amount',
        'travel_date',
        'custom_requests',
      ] as const;
      for (const key of allowed) {
        if (updates[key] !== undefined) payload[key] = updates[key];
      }
      if (typeof updates.notes === 'string') {
        payload.notes = serializePaymentLedger(payments, updates.notes);
      }
    }

    if (
      action === 'add_payment' ||
      action === 'confirm' ||
      action === 'remove_payment' ||
      nextPayments !== payments ||
      payload.total_amount !== undefined
    ) {
      const amountPaid = sumPayments(nextPayments);
      const totalAmount = Number(
        payload.total_amount !== undefined
          ? payload.total_amount
          : currentBooking.total_amount || 0
      );
      if (action === 'add_payment' || action === 'confirm' || action === 'remove_payment' || nextPayments !== payments) {
        payload.notes = serializePaymentLedger(
          nextPayments,
          typeof updates.notes === 'string' ? updates.notes : cleanNotes
        );
        payload.deposit_amount = amountPaid;
        payload.deposit_paid = amountPaid > 0;
        payload.deposit_paid_at =
          amountPaid > 0
            ? nextPayments[nextPayments.length - 1]?.paid_at || new Date().toISOString()
            : null;
      }
      payload.fully_paid = totalAmount > 0 && amountPaid >= totalAmount;
      payload.payment_status = derivePaymentStatus(totalAmount, amountPaid);
    }

    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update(payload)
      .eq('id', id)
      .select('*, tours(title, category, duration, price)')
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      user_name: user.name,
      user_email: user.email,
      action: action || 'update',
      entity_type: 'booking',
      entity_id: updatedBooking.id,
      entity_title: updatedBooking.booking_number,
      old_values: currentBooking,
      new_values: updatedBooking,
      ip_address:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json(mapBooking(updatedBooking as Record<string, unknown>));
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
