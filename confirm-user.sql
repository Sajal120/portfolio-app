-- Correct SQL to confirm user email in Supabase
-- Run this in Supabase SQL Editor

UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'basnetsajal120@gmail.com';

-- Verify the user is now confirmed
SELECT email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'basnetsajal120@gmail.com';