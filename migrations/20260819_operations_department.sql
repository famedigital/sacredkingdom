-- =====================================================
-- Operations department + appearance defaults
-- Date: 2026-08-19
-- Run in Supabase SQL Editor. Safe to re-run.
-- =====================================================

INSERT INTO site_settings (key, value, category, description, is_public, sort_order)
VALUES
  ('public_palette', '"gold-sanctuary"'::jsonb, 'appearance', 'Public site color palette', true, 40),
  ('public_layout', '"magazine"'::jsonb, 'appearance', 'Public homepage layout template', true, 41)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS ops_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  languages TEXT,
  license_no TEXT,
  daily_rate NUMERIC,
  is_available BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plate TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  capacity INTEGER,
  daily_rate NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  room_types TEXT,
  contracted_rate NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rate_type TEXT NOT NULL DEFAULT 'package' CHECK (rate_type IN ('sdf', 'package', 'seasonal')),
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  amount NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  season_start DATE,
  season_end DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'website' CHECK (source_type IN ('agent', 'website', 'walk_in', 'repeat')),
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  pnr TEXT,
  airline TEXT,
  flight_no TEXT,
  direction TEXT NOT NULL DEFAULT 'arrival' CHECK (direction IN ('arrival', 'departure')),
  airport TEXT NOT NULL DEFAULT 'PBH',
  scheduled_at TIMESTAMPTZ,
  pax_names TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  method TEXT,
  paid_on DATE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('pending', 'received', 'refunded')),
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'misc' CHECK (category IN ('guide', 'fuel', 'hotel', 'misc')),
  amount NUMERIC NOT NULL DEFAULT 0,
  incurred_on DATE,
  vendor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ops_flights_booking ON ops_flights (booking_id);
CREATE INDEX IF NOT EXISTS idx_ops_payments_booking ON ops_payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_ops_expenses_booking ON ops_expenses (booking_id);
CREATE INDEX IF NOT EXISTS idx_ops_rates_tour ON ops_rates (tour_id);

ALTER TABLE booking_operations
  ADD COLUMN IF NOT EXISTS guide_id UUID REFERENCES ops_guides(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES ops_vehicles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES ops_sources(id) ON DELETE SET NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES ops_sources(id) ON DELETE SET NULL;

ALTER TABLE booking_documents DROP CONSTRAINT IF EXISTS booking_documents_doc_type_check;
ALTER TABLE booking_documents
  ADD CONSTRAINT booking_documents_doc_type_check CHECK (
    doc_type IN (
      'room_voucher',
      'sdf',
      'invoice',
      'payment',
      'other',
      'passport',
      'permit',
      'voucher'
    )
  );

INSERT INTO ops_sources (name, source_type)
SELECT v.name, v.source_type
FROM (
  VALUES
    ('Website', 'website'),
    ('Walk-in', 'walk_in'),
    ('Repeat guest', 'repeat'),
    ('Agent', 'agent')
) AS v(name, source_type)
WHERE NOT EXISTS (SELECT 1 FROM ops_sources s WHERE s.name = v.name);

ALTER TABLE ops_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_expenses ENABLE ROW LEVEL SECURITY;
