-- =====================================================
-- Master Clients · Tour engagements · Itinerary overrides
-- Date: 2026-07-22
-- Run AFTER 20260722_booking_operations_shares_docs.sql
-- Safe to re-run.
-- =====================================================

-- -----------------------------------------------------
-- 1) Master clients (CRM profile — one person across tours)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  nationality TEXT,
  notes TEXT,
  source TEXT, -- booking | inquiry | admin | other
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive unique email
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_email_lower
  ON clients (lower(email));

CREATE INDEX IF NOT EXISTS idx_clients_name
  ON clients (name);

-- -----------------------------------------------------
-- 2) Link bookings (tour engagements) → master client
-- -----------------------------------------------------
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_client_id
  ON bookings (client_id);

CREATE INDEX IF NOT EXISTS idx_bookings_tour_id
  ON bookings (tour_id);

-- Custom itinerary for THIS client engagement (null = use tour package itinerary)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS itinerary_override JSONB;

COMMENT ON COLUMN bookings.itinerary_override IS
  'Client-specific day-by-day itinerary. NULL means use tours.itinerary.';

-- Optional link from inquiries too
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'inquiries'
  ) THEN
    ALTER TABLE inquiries
      ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_inquiries_client_id ON inquiries (client_id);
  END IF;
END $$;

-- -----------------------------------------------------
-- 3) updated_at trigger for clients
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION set_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION set_clients_updated_at();

-- =====================================================
-- Model reminder:
--   tours  (package template)
--     └── bookings  (engagement under a tour — ops, docs, share, itinerary_override)
--           └── clients  (master person profile, reusable across tours)
-- =====================================================
