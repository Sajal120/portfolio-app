-- Step 1: Add the sub_description column to hero_content table
ALTER TABLE hero_content 
ADD COLUMN IF NOT EXISTS sub_description TEXT;

-- Step 2: If you want to migrate existing data, uncomment and run this:
-- UPDATE hero_content 
-- SET 
--   description = 'Developer | Analyst | IT Support Specialist.',
--   sub_description = 'Leveraging AI tools to enhance development workflows, security analysis, and system optimization. Creating efficient, intelligent solutions.'
-- WHERE description LIKE '%Leveraging%' AND sub_description IS NULL;