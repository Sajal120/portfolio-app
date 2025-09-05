-- Add sub_description column to hero_content table
ALTER TABLE hero_content 
ADD COLUMN sub_description TEXT;

-- Update the existing record to split the description if it exists
UPDATE hero_content 
SET 
  description = 'Developer | Analyst | IT Support Specialist.',
  sub_description = 'Leveraging AI tools to enhance development workflows, security analysis, and system optimization. Creating efficient, intelligent solutions.'
WHERE description LIKE '%Leveraging%';