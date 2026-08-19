-- Focal point percentages for CSS object-position (0–100).
-- Clients drag a pin in admin to choose which part of the image stays visible.

ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS image_focal_x DOUBLE PRECISION DEFAULT 50,
  ADD COLUMN IF NOT EXISTS image_focal_y DOUBLE PRECISION DEFAULT 50;

UPDATE hero_slides SET image_focal_x = 50 WHERE image_focal_x IS NULL;
UPDATE hero_slides SET image_focal_y = 50 WHERE image_focal_y IS NULL;

COMMENT ON COLUMN hero_slides.image_focal_x IS 'Horizontal focal point percent (0–100) for object-position';
COMMENT ON COLUMN hero_slides.image_focal_y IS 'Vertical focal point percent (0–100) for object-position';

ALTER TABLE tours
  ADD COLUMN IF NOT EXISTS hero_image_focal_x DOUBLE PRECISION DEFAULT 50,
  ADD COLUMN IF NOT EXISTS hero_image_focal_y DOUBLE PRECISION DEFAULT 50;

UPDATE tours SET hero_image_focal_x = 50 WHERE hero_image_focal_x IS NULL;
UPDATE tours SET hero_image_focal_y = 50 WHERE hero_image_focal_y IS NULL;

COMMENT ON COLUMN tours.hero_image_focal_x IS 'Horizontal focal point percent (0–100) for tour card / hero object-position';
COMMENT ON COLUMN tours.hero_image_focal_y IS 'Vertical focal point percent (0–100) for tour card / hero object-position';
