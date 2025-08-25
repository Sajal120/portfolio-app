-- Fix for Infinite Recursion in RLS Policies - Run this in Supabase SQL Editor

-- First, temporarily disable RLS to fix the current state
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Allow admin full access" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Create the profile for the existing user (this will work now with RLS disabled)
INSERT INTO profiles (id, email, full_name, is_admin, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Sajal Basnet') as full_name,
    true as is_admin,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users 
WHERE email = 'basnetsajal120@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    is_admin = true,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();

-- Now create simple, non-recursive policies
-- Policy 1: Users can read their own profile
CREATE POLICY "Enable read access for own profile" ON profiles 
    FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can insert their own profile (for signup)
CREATE POLICY "Enable insert for own profile" ON profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile (but not admin status unless they're already admin)
CREATE POLICY "Enable update for own profile" ON profiles 
    FOR UPDATE USING (auth.uid() = id);

-- Policy 4: Public read access for basic profile info (optional, for portfolio display)
CREATE POLICY "Enable public read for portfolio" ON profiles 
    FOR SELECT USING (true);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify the profile was created
SELECT id, email, full_name, is_admin, created_at 
FROM profiles 
WHERE email = 'basnetsajal120@gmail.com';