-- =====================================================
-- Booking Operations · Share Links · Documents · Tour naked share
-- Date: 2026-07-22
-- Run this in Supabase SQL Editor before using the new features.
-- Safe to re-run (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- =====================================================

-- -----------------------------------------------------
-- 1) Tour-level naked itinerary share token
-- -----------------------------------------------------
ALTER TABLE tours
  ADD COLUMN IF NOT EXISTS naked_share_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tours_naked_share_token
  ON tours (naked_share_token)
  WHERE naked_share_token IS NOT NULL;

-- Ensure publish flags exist (no-op if already present)
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT true;

-- -----------------------------------------------------
-- 2) Booking operations (guide / driver / hotels)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,

  guide_name TEXT,
  guide_phone TEXT,
  guide_email TEXT,
  guide_notes TEXT,

  driver_name TEXT,
  driver_phone TEXT,
  driver_email TEXT,
  driver_notes TEXT,

  -- [{ name, location, check_in, check_out, room_type, confirmation_no, notes }]
  hotels JSONB NOT NULL DEFAULT '[]'::jsonb,

  internal_notes TEXT,

  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_operations_booking
  ON booking_operations (booking_id);

-- -----------------------------------------------------
-- 3) Shareable itinerary links (client naked / staff no-rates)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  token TEXT NOT NULL UNIQUE,
  -- client = naked itinerary (no rates, no staff contacts)
  -- staff  = guide/driver view (no rates, includes ops)
  audience TEXT NOT NULL CHECK (audience IN ('client', 'staff')),
  include_rates BOOLEAN NOT NULL DEFAULT false,
  label TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_accessed_at TIMESTAMPTZ,

  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_share_links_booking
  ON booking_share_links (booking_id);

CREATE INDEX IF NOT EXISTS idx_booking_share_links_token
  ON booking_share_links (token)
  WHERE is_active = true;

-- -----------------------------------------------------
-- 4) Booking documents (SDF, invoices, payments, vouchers)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  doc_type TEXT NOT NULL CHECK (
    doc_type IN ('room_voucher', 'sdf', 'invoice', 'payment', 'other')
  ),
  title TEXT,
  file_url TEXT NOT NULL,
  file_public_id TEXT,
  file_name TEXT,
  mime_type TEXT,
  file_size INTEGER,
  notes TEXT,

  uploaded_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_documents_booking
  ON booking_documents (booking_id);

CREATE INDEX IF NOT EXISTS idx_booking_documents_type
  ON booking_documents (booking_id, doc_type);

-- -----------------------------------------------------
-- 5) updated_at trigger for booking_operations
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION set_booking_operations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_operations_updated_at ON booking_operations;
CREATE TRIGGER trg_booking_operations_updated_at
  BEFORE UPDATE ON booking_operations
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_operations_updated_at();

-- =====================================================
-- DONE
-- Verify:
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'tours' AND column_name = 'naked_share_token';
--   SELECT table_name FROM information_schema.tables
--     WHERE table_name IN ('booking_operations','booking_share_links','booking_documents');
-- =====================================================
