-- Final Authentication Fix
-- Run this in your Supabase SQL Editor

-- 1. First, let's check the current user status
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'basnetsajal120@gmail.com';

-- 2. Confirm the user's email (this should fix the login issue)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'basnetsajal120@gmail.com';

-- 3. Make sure the profile exists and is admin
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

-- 4. Verify the fix
SELECT 
    'User Info' as type,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email = 'basnetsajal120@gmail.com'

UNION ALL

SELECT 
    'Profile Info' as type,
    email,
    is_admin::text as admin_status,
    created_at
FROM profiles 
WHERE email = 'basnetsajal120@gmail.com';