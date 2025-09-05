-- Migration to update contact_info table structure
-- Run this in your Supabase SQL Editor

-- First, backup existing data if any
CREATE TABLE contact_info_backup AS SELECT * FROM contact_info;

-- Drop the old table (be careful, this will delete existing data)
DROP TABLE IF EXISTS contact_info CASCADE;

-- Create new contact_info table with the correct structure
CREATE TABLE contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('email', 'phone', 'address', 'website', 'linkedin', 'github', 'twitter', 'instagram', 'discord', 'telegram', 'other')),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON contact_info FOR SELECT USING (true);

CREATE POLICY "Allow admin insert" ON contact_info 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin update" ON contact_info 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin delete" ON contact_info 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Insert sample contact information
INSERT INTO contact_info (type, label, value, icon, is_public, display_order) VALUES 
('phone', 'Primary Phone', '+61 424 425 793', '📱', true, 1),
('email', 'Primary Email', 'basnetsajal120@gmail.com', '📧', true, 2),
('address', 'Location', 'Auburn, Sydney, NSW', '📍', true, 3),
('github', 'GitHub Profile', 'https://github.com/Sajal120', '👨‍💻', true, 4),
('linkedin', 'LinkedIn Profile', 'https://linkedin.com/in/sajal-basnet-7926aa188', '💼', true, 5);

-- Clean up backup table if migration successful
-- DROP TABLE contact_info_backup;