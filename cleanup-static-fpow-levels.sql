-- ============================================================================
-- Four Pics One Word: Remove Static Pre-configured Levels
-- ============================================================================
-- This script removes all static/pre-configured Four Pics One Word levels
-- EXCEPT Adventure Mode content (Adventure Chronicles, Jungle Lush)
-- 
-- Teachers will now create all Four Pics One Word categories and levels.
-- Adventure Mode content remains intact and accessible through Adventure Mode.
-- ============================================================================

-- OPTION 1: Use the API endpoints (RECOMMENDED - Safer and easier)
-- ============================================================================
-- The backend now has cleanup endpoints you can call via browser or Postman:
--
-- 1. Preview what will be deleted (safe, read-only):
--    GET http://localhost:8080/api/fpow/cleanup/preview
--
-- 2. Execute the cleanup (destructive, removes static levels):
--    POST http://localhost:8080/api/fpow/cleanup/execute
--
-- 3. Verify current database state:
--    GET http://localhost:8080/api/fpow/cleanup/verify
--
-- Steps:
-- 1. Restart your backend to load the FPOWCleanupService
-- 2. Open browser and go to: http://localhost:8080/api/fpow/cleanup/preview
-- 3. Review the preview to see what will be deleted
-- 4. Use Postman or curl to POST to: http://localhost:8080/api/fpow/cleanup/execute
-- 5. Verify with: http://localhost:8080/api/fpow/cleanup/verify
-- ============================================================================

-- OPTION 2: Manual SQL (if you prefer direct database access)
-- ============================================================================

-- Show what will be deleted (run this first to verify)
SELECT 
    id,
    category,
    level,
    answer,
    created_at
FROM four_pic_one_word
WHERE category IN (
    'Animals',
    'Fruits', 
    'Objects',
    'Homophones',
    'Synonyms',
    'Antonyms',
    'Prefixes & Suffixes'
)
ORDER BY category, level;

-- Uncomment the DELETE statement below after verifying the SELECT results
-- DELETE FROM four_pic_one_word
-- WHERE category IN (
--     'Animals',
--     'Fruits', 
--     'Objects',
--     'Homophones',
--     'Synonyms',
--     'Antonyms',
--     'Prefixes & Suffixes'
-- );

-- Verify Adventure Mode content is still present
SELECT 
    category,
    COUNT(*) as level_count
FROM four_pic_one_word
WHERE category IN ('Adventure Chronicles', 'Jungle Lush')
GROUP BY category;

-- Show remaining categories (should only be Adventure Mode + teacher-created)
SELECT DISTINCT category
FROM four_pic_one_word
ORDER BY category;
