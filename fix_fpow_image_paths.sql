-- SQL Script to update Four Pics One Word image paths
-- This updates ALL image paths to use the new frontend public folder structure
-- Old format: /images/Animals/1/pic1.jpg
-- New format: /static/images/Four_Pic_One_Word_Category/Animals/1/pic1.jpg

UPDATE four_pic_one_word 
SET 
    image1_url = REPLACE(image1_url, '/images/', '/static/images/Four_Pic_One_Word_Category/'),
    image2_url = REPLACE(image2_url, '/images/', '/static/images/Four_Pic_One_Word_Category/'),
    image3_url = REPLACE(image3_url, '/images/', '/static/images/Four_Pic_One_Word_Category/'),
    image4_url = REPLACE(image4_url, '/images/', '/static/images/Four_Pic_One_Word_Category/')
WHERE 
    image1_url LIKE '/images/%' 
    OR image2_url LIKE '/images/%' 
    OR image3_url LIKE '/images/%' 
    OR image4_url LIKE '/images/%';

-- Verify the updates
SELECT id, category, level, 
    SUBSTRING(image1_url, 1, 60) as image1_preview,
    SUBSTRING(image2_url, 1, 60) as image2_preview
FROM four_pic_one_word 
ORDER BY category, level
LIMIT 10;
