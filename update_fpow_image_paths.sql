-- SQL Script to update Four Pics One Word image paths
-- This updates the paths to match the new frontend public folder structure
-- Old format: /images/animals/1/pic1.jpg
-- New format: /static/images/Four_Pic_One_Word_Category/Animals/1/pic1.jpg

-- Update Animals category
UPDATE four_pic_one_word 
SET 
    image1_url = REPLACE(image1_url, '/images/animals/', '/static/images/Four_Pic_One_Word_Category/Animals/'),
    image2_url = REPLACE(image2_url, '/images/animals/', '/static/images/Four_Pic_One_Word_Category/Animals/'),
    image3_url = REPLACE(image3_url, '/images/animals/', '/static/images/Four_Pic_One_Word_Category/Animals/'),
    image4_url = REPLACE(image4_url, '/images/animals/', '/static/images/Four_Pic_One_Word_Category/Animals/')
WHERE category = 'Animals';

-- Update Food category (if exists)
UPDATE four_pic_one_word 
SET 
    image1_url = REPLACE(image1_url, '/images/food/', '/static/images/Four_Pic_One_Word_Category/Food/'),
    image2_url = REPLACE(image2_url, '/images/food/', '/static/images/Four_Pic_One_Word_Category/Food/'),
    image3_url = REPLACE(image3_url, '/images/food/', '/static/images/Four_Pic_One_Word_Category/Food/'),
    image4_url = REPLACE(image4_url, '/images/food/', '/static/images/Four_Pic_One_Word_Category/Food/')
WHERE category = 'Food';

-- Update Sports category (if exists)
UPDATE four_pic_one_word 
SET 
    image1_url = REPLACE(image1_url, '/images/sports/', '/static/images/Four_Pic_One_Word_Category/Sports/'),
    image2_url = REPLACE(image2_url, '/images/sports/', '/static/images/Four_Pic_One_Word_Category/Sports/'),
    image3_url = REPLACE(image3_url, '/images/sports/', '/static/images/Four_Pic_One_Word_Category/Sports/'),
    image4_url = REPLACE(image4_url, '/images/sports/', '/static/images/Four_Pic_One_Word_Category/Sports/')
WHERE category = 'Sports';

-- Update Nature category (if exists)
UPDATE four_pic_one_word 
SET 
    image1_url = REPLACE(image1_url, '/images/nature/', '/static/images/Four_Pic_One_Word_Category/Nature/'),
    image2_url = REPLACE(image2_url, '/images/nature/', '/static/images/Four_Pic_One_Word_Category/Nature/'),
    image3_url = REPLACE(image3_url, '/images/nature/', '/static/images/Four_Pic_One_Word_Category/Nature/'),
    image4_url = REPLACE(image4_url, '/images/nature/', '/static/images/Four_Pic_One_Word_Category/Nature/')
WHERE category = 'Nature';

-- Update Technology category (if exists)
UPDATE four_pic_one_word 
SET 
    image1_url = REPLACE(image1_url, '/images/technology/', '/static/images/Four_Pic_One_Word_Category/Technology/'),
    image2_url = REPLACE(image2_url, '/images/technology/', '/static/images/Four_Pic_One_Word_Category/Technology/'),
    image3_url = REPLACE(image3_url, '/images/technology/', '/static/images/Four_Pic_One_Word_Category/Technology/'),
    image4_url = REPLACE(image4_url, '/images/technology/', '/static/images/Four_Pic_One_Word_Category/Technology/')
WHERE category = 'Technology';

-- Verify the updates
SELECT id, category, level, image1_url, image2_url, image3_url, image4_url 
FROM four_pic_one_word 
ORDER BY category, level;
