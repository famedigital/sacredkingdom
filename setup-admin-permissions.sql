-- Setup Admin User Permissions for RBAC System
-- This script grants all necessary permissions to admin users

-- Update existing admin users with full permissions
UPDATE admin_users
SET permissions = '[
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
]'::jsonb
WHERE role = 'admin' AND permissions IS NULL;

-- Create default admin user if none exists
-- This creates an admin user with email: admin@sacredkingdom.travel and password: Admin@123
-- NOTE: Change this password after first login!
INSERT INTO admin_users (id, email, name, password_hash, role, permissions, is_active, email_verified, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@sacredkingdom.travel',
  'System Administrator',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Mx5pXhY8NWqG', -- password: admin123
  'admin',
  '[
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
  ]'::jsonb,
  true,
  true,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create Editor role with content management permissions
INSERT INTO admin_users (id, email, name, password_hash, role, permissions, is_active, email_verified, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'editor@sacredkingdom.travel',
  'Content Editor',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Mx5pXhY8NWqG', -- password: editor123
  'editor',
  '[
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
  ]'::jsonb,
  true,
  true,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create Viewer role with read-only permissions
INSERT INTO admin_users (id, email, name, password_hash, role, permissions, is_active, email_verified, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'viewer@sacredkingdom.travel',
  'Content Viewer',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Mx5pXhY8NWqG', -- password: viewer123
  'viewer',
  '[
    "blog.read",
    "tour.read",
    "user.read",
    "settings.read",
    "booking.read",
    "inquiry.read",
    "analytics.view"
  ]'::jsonb,
  true,
  true,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify permissions setup
SELECT
  id,
  email,
  name,
  role,
  permissions,
  is_active
FROM admin_users
ORDER BY role, created_at;

-- Output instructions
SELECT 'Admin users setup complete!' AS status;
SELECT 'Login credentials:' AS info;
SELECT 'Admin: admin@sacredkingdom.travel / Admin@123' AS admin_login;
SELECT 'Editor: editor@sacredkingdom.travel / editor123' AS editor_login;
SELECT 'Viewer: viewer@sacredkingdom.travel / viewer123' AS viewer_login;
SELECT 'IMPORTANT: Change passwords after first login!' AS security_warning;