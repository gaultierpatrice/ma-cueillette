-- Migration: Add image_url column to pickings table with default strawberry image
-- Created: 2026-05-04
-- Description: Adds image_url column with a default generic farm image for all pickings

-- Add image_url column with default value
ALTER TABLE pickings 
ADD COLUMN image_url VARCHAR(500) DEFAULT '/assets/images/illustration/strawberry.jpg';

-- Add comment for documentation
COMMENT ON COLUMN pickings.image_url IS 'URL to the primary display image for this picking farm';

-- Update existing rows to have the default value (in case DEFAULT doesn't apply retroactively)
UPDATE pickings 
SET image_url = '/assets/images/illustration/strawberry.jpg' 
WHERE image_url IS NULL;
