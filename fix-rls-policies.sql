-- Fix for RLS Policy Issue - Run this in Supabase SQL Editor

-- First, let's create the profile for the existing user
INSERT INTO profiles (id, email, full_name, is_admin, created_at, updated_at)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name' as full_name,
    true as is_admin,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users 
WHERE email = 'basnetsajal120@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    is_admin = true,
    updated_at = NOW();

-- Now let's update the RLS policies to allow users to create their own profiles
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow admin full access" ON profiles;

-- Create better policies
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile (for initial setup)
CREATE POLICY "Users can create own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile, but only admins can change admin status
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id) 
  WITH CHECK (
    auth.uid() = id AND (
      -- User can update non-admin fields
      (OLD.is_admin = NEW.is_admin) OR 
      -- Or user is already an admin and can change admin status
      (OLD.is_admin = true)
    )
  );

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" ON profiles 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" ON profiles 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );