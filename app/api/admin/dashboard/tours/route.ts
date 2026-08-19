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

    if (!hasPermission(adminUser, Permissions.TOUR_READ)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    const { data: tours, error } = await supabase
      .from('tours')
      .select(`
        id,
        title,
        category,
        duration,
        difficulty_level,
        price,
        is_active,
        is_published,
        view_count,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) {
      console.error('Error fetching tours:', error);
      return NextResponse.json(
        { error: 'Error fetching tours' },
        { status: 500 }
      );
    }

    const formattedTours = tours?.map(tour => ({
      id: tour.id,
      title: tour.title,
      category: tour.category,
      duration: tour.duration,
      difficulty: tour.difficulty_level,
      price: tour.price,
      status: tour.is_active && tour.is_published ? 'active' : 'inactive',
      bookings: tour.view_count || 0,
    })) || [];

    return NextResponse.json(formattedTours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
