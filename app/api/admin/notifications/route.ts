import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';

export type AdminNotification = {
  id: string;
  type: 'booking' | 'inquiry';
  title: string;
  message: string;
  href: string;
  created_at: string;
  unread: boolean;
};

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}

// GET /api/admin/notifications — live feed + badge counts
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const [
      { count: pendingBookings },
      { count: newInquiries },
      { data: pendingBookingRows },
      { data: newInquiryRows },
    ] = await Promise.all([
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('bookings')
        .select('id, booking_number, client_name, tour_title, created_at, tours(title)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(15),
      supabase
        .from('inquiries')
        .select('id, name, client_name, subject, message, tour_interest, created_at')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(15),
    ]);

    const bookingNotifications: AdminNotification[] = (pendingBookingRows || []).map((b) => {
      const related = b.tours as { title?: string } | { title?: string }[] | null;
      const relatedTitle = Array.isArray(related) ? related[0]?.title : related?.title;
      const tourTitle = b.tour_title || relatedTitle || 'a tour';
      return {
        id: `booking-${b.id}`,
        type: 'booking' as const,
        title: 'New booking request',
        message: `${b.client_name || 'Guest'} — ${tourTitle}${b.booking_number ? ` (${b.booking_number})` : ''}`,
        href: `/admin/bookings?id=${b.id}`,
        created_at: b.created_at,
        unread: true,
      };
    });

    const inquiryNotifications: AdminNotification[] = (newInquiryRows || []).map((inq) => {
      const name = inq.name || inq.client_name || 'Guest';
      const detail = inq.subject || inq.tour_interest || inq.message?.slice(0, 80) || 'New message';
      return {
        id: `inquiry-${inq.id}`,
        type: 'inquiry' as const,
        title: 'New inquiry',
        message: `${name} — ${detail}`,
        href: `/admin/inquiries?id=${inq.id}`,
        created_at: inq.created_at,
        unread: true,
      };
    });

    const notifications = [...bookingNotifications, ...inquiryNotifications]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
      .map((n) => ({
        ...n,
        time: formatRelativeTime(n.created_at),
      }));

    const pending = pendingBookings || 0;
    const inquiries = newInquiries || 0;

    return NextResponse.json({
      notifications,
      counts: {
        pendingBookings: pending,
        newInquiries: inquiries,
        unread: pending + inquiries,
      },
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PATCH /api/admin/notifications — mark new inquiries as read
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || 'mark_inquiries_read';
    const supabase = createAdminClient();

    if (action === 'mark_inquiries_read') {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: 'read', updated_at: new Date().toISOString() })
        .eq('status', 'new');

      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === 'mark_inquiry_read' && body.id) {
      const id = String(body.id).replace(/^inquiry-/, '');
      const { error } = await supabase
        .from('inquiries')
        .update({ status: 'read', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Notifications update error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
