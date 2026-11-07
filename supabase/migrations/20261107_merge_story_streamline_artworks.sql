-- ARTIQ: Migration - Merge story into description and streamline artworks table

-- Step 1: Merge existing story and description into description
-- Artist's story first, then the old description, separated by a blank line, skipping empty values
UPDATE public.artworks
SET description = CASE
  WHEN (story IS NOT NULL AND TRIM(story) != '') AND (description IS NOT NULL AND TRIM(description) != '')
    THEN TRIM(story) || E'\n\n' || TRIM(description)
  WHEN (story IS NOT NULL AND TRIM(story) != '')
    THEN TRIM(story)
  ELSE COALESCE(TRIM(description), '')
END;

-- Step 2: Drop the three removed fields and old story column from artworks
ALTER TABLE public.artworks
  DROP COLUMN IF EXISTS art_form,
  DROP COLUMN IF EXISTS technique,
  DROP COLUMN IF EXISTS materials,
  DROP COLUMN IF EXISTS story;

-- Step 3: Keep categories as text[] of taxonomy IDs, ensure default is empty array
ALTER TABLE public.artworks
  ALTER COLUMN categories SET DEFAULT '{}';

-- Re-verify RLS policies remain intact
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
