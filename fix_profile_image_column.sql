-- Fix profile_image column to be LONGBLOB and nullable
-- This script ensures the profile_image column in the users table is properly configured

-- Fix users table profile_image column
ALTER TABLE users 
MODIFY COLUMN profile_image LONGBLOB NULL;

-- Fix adventure_profile table unlocked_fpow_levels column (ensure it's TEXT and nullable)
ALTER TABLE adventure_profile 
MODIFY COLUMN unlocked_fpow_levels TEXT NULL;

-- Set default empty string for existing NULL values
UPDATE adventure_profile 
SET unlocked_fpow_levels = '' 
WHERE unlocked_fpow_levels IS NULL;

-- Verify the changes
-- DESCRIBE users;
-- DESCRIBE adventure_profile;

