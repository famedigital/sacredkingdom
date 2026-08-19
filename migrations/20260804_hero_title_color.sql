-- Hero slide title color (CSS hex), editable in Admin → Hero.
-- Until this runs, the app stores the color in unused cta_style.

ALTER TABLE hero_slides
  ADD COLUMN IF NOT EXISTS title_color TEXT;

UPDATE hero_slides
SET title_color = COALESCE(
  NULLIF(trim(title_color), ''),
  NULLIF(trim(cta_style), ''),
  '#c4a35a'
)
WHERE title_color IS NULL OR trim(title_color) = '';

COMMENT ON COLUMN hero_slides.title_color IS 'CSS color for the hero headline (e.g. #c4a35a)';
