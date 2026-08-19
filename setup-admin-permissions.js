/**
 * Setup Admin User Permissions Script
 * Run this script to initialize admin users with proper RBAC permissions
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const allPermissions = [
  "blog.create",
  "blog.read",
  "blog.edit",
  "blog.delete",
  "blog.publish",
  "tour.create",
  "tour.read",
  "tour.edit",
  "tour.delete",
  "tour.publish",
  "user.manage",
  "user.read",
  "settings.edit",
  "settings.read",
  "booking.manage",
  "booking.read",
  "inquiry.manage",
  "inquiry.read",
  "analytics.view",
  "media.upload",
  "media.delete",
  "media.manage"
];

const editorPermissions = [
  "blog.create",
  "blog.read",
  "blog.edit",
  "blog.delete",
  "blog.publish",
  "tour.create",
  "tour.read",
  "tour.edit",
  "tour.delete",
  "tour.publish",
  "media.upload",
  "media.manage"
];

const viewerPermissions = [
  "blog.read",
  "tour.read",
  "user.read",
  "settings.read",
  "booking.read",
  "inquiry.read",
  "analytics.view"
];

async function hashPassword(password) {
  const bcrypt = require('bcrypt');
  return await bcrypt.hash(password, 12);
}

async function setupAdminUsers() {
  try {
    console.log('Setting up admin users with RBAC permissions...');

    // Update existing admin users with full permissions
    const { data: existingAdmins, error: updateError } = await supabase
      .from('admin_users')
      .update({ permissions: allPermissions })
      .eq('role', 'admin')
      .select();

    if (updateError) {
      console.error('Error updating existing admins:', updateError);
    } else {
      console.log(`Updated ${existingAdmins?.length || 0} existing admin users`);
    }

    // Create default admin user
    const adminPassword = await hashPassword('admin123');
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@wangchuk-tour.com',
        name: 'System Administrator',
        password_hash: adminPassword,
        role: 'admin',
        permissions: allPermissions,
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (adminError && !adminError.message.includes('duplicate')) {
      console.error('Error creating admin user:', adminError);
    } else {
      console.log('✓ Admin user created/updated: admin@wangchuk-tour.com');
    }

    // Create editor user
    const editorPassword = await hashPassword('editor123');
    const { error: editorError } = await supabase
      .from('admin_users')
      .upsert({
        id: '00000000-0000-0000-0000-000000000002',
        email: 'editor@wangchuk-tour.com',
        name: 'Content Editor',
        password_hash: editorPassword,
        role: 'editor',
        permissions: editorPermissions,
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      });

    if (editorError && !editorError.message.includes('duplicate')) {
      console.error('Error creating editor user:', editorError);
    } else {
      console.log('✓ Editor user created/updated: editor@wangchuk-tour.com');
    }

    // Create viewer user
    const viewerPassword = await hashPassword('viewer123');
    const { error: viewerError } = await supabase
      .from('admin_users')
      .upsert({
        id: '00000000-0000-0000-0000-000000000003',
        email: 'viewer@wangchuk-tour.com',
        name: 'Content Viewer',
        password_hash: viewerPassword,
        role: 'viewer',
        permissions: viewerPermissions,
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      });

    if (viewerError && !viewerError.message.includes('duplicate')) {
      console.error('Error creating viewer user:', viewerError);
    } else {
      console.log('✓ Viewer user created/updated: viewer@wangchuk-tour.com');
    }

    // Verify setup
    const { data: users, error: fetchError } = await supabase
      .from('admin_users')
      .select('id, email, name, role, permissions, is_active')
      .order('role', { ascending: true });

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
    } else {
      console.log('\n📋 Current Admin Users:');
      console.log('─'.repeat(80));
      users.forEach(user => {
        console.log(`${user.name} (${user.role})`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Active: ${user.is_active ? 'Yes' : 'No'}`);
        console.log(`  Permissions: ${user.permissions?.length || 0} granted`);
        console.log('');
      });
    }

    console.log('🎉 Admin users setup complete!');
    console.log('\n🔐 Login Credentials:');
    console.log('─'.repeat(80));
    console.log('Admin:    admin@wangchuk-tour.com / admin123');
    console.log('Editor:   editor@wangchuk-tour.com / editor123');
    console.log('Viewer:   viewer@wangchuk-tour.com / viewer123');
    console.log('\n⚠️  IMPORTANT: Change passwords after first login!');
    console.log('─'.repeat(80));

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdminUsers()
  .then(() => {
    console.log('\n✅ Setup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });