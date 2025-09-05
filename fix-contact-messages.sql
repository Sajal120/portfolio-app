-- Fix contact_messages table and policies
-- Run this in Supabase SQL Editor

-- First, let's make sure the table exists with correct structure
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert" ON contact_messages;
DROP POLICY IF EXISTS "Allow admin read" ON contact_messages;
DROP POLICY IF EXISTS "Allow admin update" ON contact_messages;
DROP POLICY IF EXISTS "Allow admin delete" ON contact_messages;

-- Create new policies
-- Allow anyone to insert contact messages (for the contact form)
CREATE POLICY "Allow public insert" ON contact_messages 
  FOR INSERT WITH CHECK (true);

-- Allow admin to read messages
CREATE POLICY "Allow admin read" ON contact_messages 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admin to update messages
CREATE POLICY "Allow admin update" ON contact_messages 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admin to delete messages  
CREATE POLICY "Allow admin delete" ON contact_messages 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Test insert (remove this after testing)
-- INSERT INTO contact_messages (name, email, message) VALUES ('Test User', 'test@example.com', 'Test message from SQL');