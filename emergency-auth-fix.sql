-- EMERGENCY AUTH FIX
-- Copy and paste this into Supabase SQL Editor and run it

-- Step 1: Confirm email (this is likely the main issue)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'basnetsajal120@gmail.com' 
AND email_confirmed_at IS NULL;

-- Step 2: Make sure user exists in profiles as admin
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'basnetsajal120@gmail.com';
    
    -- Insert or update profile
    IF user_uuid IS NOT NULL THEN
        INSERT INTO profiles (id, email, full_name, is_admin, created_at, updated_at)
        VALUES (user_uuid, 'basnetsajal120@gmail.com', 'Sajal Basnet', true, NOW(), NOW())
        ON CONFLICT (id) 
        DO UPDATE SET 
            is_admin = true,
            updated_at = NOW();
    END IF;
END $$;

-- Step 3: Verify everything is working
SELECT 
    'AUTH USER' as table_name,
    email,
    (email_confirmed_at IS NOT NULL) as email_confirmed,
    created_at
FROM auth.users 
WHERE email = 'basnetsajal120@gmail.com'

UNION ALL

SELECT 
    'PROFILE' as table_name,
    email,
    is_admin::text as is_admin,
    created_at
FROM profiles 
WHERE email = 'basnetsajal120@gmail.com';