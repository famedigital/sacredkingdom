import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Remove sensitive information from response
    const sanitizedUsers = users?.map(u => ({
      ...u,
      // Don't send password_hash in response
    })) || [];

    return NextResponse.json({ users: sanitizedUsers });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, name, role = 'admin' } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('admin_users')
      .insert({
        email,
        password_hash,
        name,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, email, name, role, created_at, updated_at')
      .single();

    if (createError) throw createError;

    // Log the user creation
    await supabase.from('audit_logs').insert({
      user_id: currentUser.userId,
      user_name: currentUser.name,
      user_email: currentUser.email,
      action: 'create',
      entity_type: 'user',
      entity_id: newUser.id,
      entity_title: email,
      new_values: newUser,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json({
      user: newUser,
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT /api/admin/users - Update user
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, email, name, role, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      email: email || existingUser.email,
      name: name || existingUser.name,
      role: role || existingUser.role,
      updated_at: new Date().toISOString(),
    };

    // If password is provided, hash it
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, name, role, created_at, updated_at')
      .single();

    if (updateError) throw updateError;

    // Log the user update
    await supabase.from('audit_logs').insert({
      user_id: currentUser.userId,
      user_name: currentUser.name,
      user_email: currentUser.email,
      action: 'update',
      entity_type: 'user',
      entity_id: id,
      entity_title: email || existingUser.email,
      old_values: existingUser,
      new_values: updatedUser,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting yourself
    if (userId === currentUser.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user
    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId);

    if (deleteError) throw deleteError;

    // Log the user deletion
    await supabase.from('audit_logs').insert({
      user_id: currentUser.userId,
      user_name: currentUser.name,
      user_email: currentUser.email,
      action: 'delete',
      entity_type: 'user',
      entity_id: userId,
      entity_title: existingUser.email,
      old_values: existingUser,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}