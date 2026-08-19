-- =====================================================
-- CREATE ADMIN USER DIRECTLY IN DATABASE
-- Run this in Supabase SQL Editor
-- This bypasses RLS by using database-level operations
-- =====================================================

-- First, let's generate a bcrypt hash for 'Admin@123'
-- The hash below is for the password: Admin@123
-- Generated with bcrypt using 12 salt rounds

INSERT INTO admin_users (
  id,
  email,
  name,
  password_hash,
  role,
  is_active,
  email_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- This will generate a proper UUID
  'admin@sacredkingdom.travel',
  'Admin User',
  '$2b$12$HgtvGJqEgu3DKhvRbmPFP.rkixdtzcEr31F5HvgcoxjuDVSEp4rZu', -- bcrypt hash for 'Admin@123'
  'admin',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  is_active = true,
  updated_at = NOW()
RETURNING id, email, name, role, is_active;

-- Verify the admin user was created
SELECT
  id,
  email,
  name,
  role,
  is_active,
  email_verified,
  created_at
FROM admin_users
WHERE email = 'admin@sacredkingdom.travel';

-- Display login information
SELECT
  '========================================' as "",
  'ADMIN USER CREATED SUCCESSFULLY' as "",
  '========================================' as "",
  'Email: admin@sacredkingdom.travel' as "",
  'Password: Admin@123' as "",
  'Login URL: http://localhost:3000/admin/login' as "",
  '========================================' as "";