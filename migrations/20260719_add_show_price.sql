-- Toggle to show/hide tour price on public pages (admin still keeps the price value).
ALTER TABLE tours ADD COLUMN IF NOT EXISTS show_price BOOLEAN DEFAULT true;
UPDATE tours SET show_price = true WHERE show_price IS NULL;
COMMENT ON COLUMN tours.show_price IS 'When false, public pages hide the tour price (Contact for price).';
