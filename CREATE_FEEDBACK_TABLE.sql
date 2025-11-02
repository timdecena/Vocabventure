-- ========================================
-- CREATE FEEDBACK TABLE FOR VOCABIA
-- ========================================
-- Run this SQL script in MySQL to create the feedback table

USE vocabia_db;

-- Drop table if exists (optional - only if you want to recreate)
-- DROP TABLE IF EXISTS feedback;

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    grade VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    submitted_at DATETIME NOT NULL,
    
    -- Indexes for better query performance
    INDEX idx_rating (rating),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify table was created
SHOW TABLES LIKE 'feedback';

-- Show table structure
DESCRIBE feedback;

-- ========================================
-- HOW TO RUN THIS SCRIPT:
-- ========================================
-- 
-- Option 1: MySQL Command Line
-- -----------------------------
-- 1. Open MySQL command line
-- 2. mysql -u root -p
-- 3. Enter password: Comision@123
-- 4. source CREATE_FEEDBACK_TABLE.sql
--
-- Option 2: MySQL Workbench
-- --------------------------
-- 1. Open MySQL Workbench
-- 2. Connect to your database
-- 3. File > Open SQL Script
-- 4. Select this file
-- 5. Click Execute (⚡ icon)
--
-- Option 3: Copy and Paste
-- -------------------------
-- 1. Copy the CREATE TABLE statement above
-- 2. Paste into MySQL Workbench query window
-- 3. Click Execute
--
-- ========================================

