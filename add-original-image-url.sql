-- Add original_image_url column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS original_image_url TEXT;

-- For existing projects, set original_image_url to current image_url if it's not null
UPDATE projects 
SET original_image_url = image_url 
WHERE image_url IS NOT NULL AND original_image_url IS NULL;