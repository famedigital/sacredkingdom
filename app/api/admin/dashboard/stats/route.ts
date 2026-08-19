import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCurrentUser } from '@/lib/auth/jwt';
import { hasPermission, Permissions, type AdminUser } from '@/lib/auth/rbac';

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser: AdminUser = {
      id: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
    };

    if (!hasPermission(adminUser, Permissions.ANALYTICS_VIEW)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    const { count: pendingBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: confirmedBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed');

    const { count: cancelledBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled');

    const { count: activeTours } = await supabase
      .from('tours')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: totalInquiries } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    const { data: bookings } = await supabase
      .from('bookings')
      .select('total_amount')
      .eq('payment_status', 'paid');

    const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: monthlyBookings } = await supabase
      .from('bookings')
      .select('total_amount')
      .eq('payment_status', 'paid')
      .gte('created_at', firstDayOfMonth.toISOString());

    const monthlyRevenue = monthlyBookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

    return NextResponse.json({
      totalBookings: totalBookings || 0,
      pendingBookings: pendingBookings || 0,
      confirmedBookings: confirmedBookings || 0,
      cancelledBookings: cancelledBookings || 0,
      totalRevenue,
      monthlyRevenue,
      activeTours: activeTours || 0,
      totalInquiries: totalInquiries || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
