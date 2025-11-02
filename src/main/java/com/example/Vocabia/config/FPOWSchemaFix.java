package com.example.Vocabia.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * ✅ CRITICAL FIX: Database schema migration for dynamic FPOW image system
 * This component runs at startup to ensure image columns allow NULL values
 */
@Component
public class FPOWSchemaFix implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("🔧 FPOW Schema Fix: Checking database schema...");
            // Ensure critical gameplay tables/columns exist to avoid runtime 500s
            ensureUserProgressTable();
            
            // Check if columns are nullable
            String checkQuery = """
                SELECT COLUMN_NAME, IS_NULLABLE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'four_pic_one_word'
                  AND COLUMN_NAME IN ('image2_url', 'image3_url', 'image4_url')
                """;
            
            var columns = jdbcTemplate.queryForList(checkQuery);
            boolean needsFix = false;
            
            for (var column : columns) {
                String columnName = (String) column.get("COLUMN_NAME");
                String isNullable = (String) column.get("IS_NULLABLE");
                
                if ("NO".equals(isNullable)) {
                    System.out.println("❌ Column " + columnName + " is NOT NULL - needs fixing");
                    needsFix = true;
                } else {
                    System.out.println("✅ Column " + columnName + " allows NULL - OK");
                }
            }
            
            if (needsFix) {
                System.out.println("🔧 Applying FPOW schema fix...");
                
                // Fix image2_url
                try {
                    jdbcTemplate.execute("ALTER TABLE four_pic_one_word MODIFY COLUMN image2_url VARCHAR(500) NULL");
                    System.out.println("✅ Fixed image2_url column");
                } catch (Exception e) {
                    System.out.println("⚠️ image2_url fix: " + e.getMessage());
                }
                
                // Fix image3_url
                try {
                    jdbcTemplate.execute("ALTER TABLE four_pic_one_word MODIFY COLUMN image3_url VARCHAR(500) NULL");
                    System.out.println("✅ Fixed image3_url column");
                } catch (Exception e) {
                    System.out.println("⚠️ image3_url fix: " + e.getMessage());
                }
                
                // Fix image4_url
                try {
                    jdbcTemplate.execute("ALTER TABLE four_pic_one_word MODIFY COLUMN image4_url VARCHAR(500) NULL");
                    System.out.println("✅ Fixed image4_url column");
                } catch (Exception e) {
                    System.out.println("⚠️ image4_url fix: " + e.getMessage());
                }
                
                // Clean up existing empty string values
                try {
                    jdbcTemplate.update("UPDATE four_pic_one_word SET image2_url = NULL WHERE image2_url = '' OR image2_url = 'null'");
                    jdbcTemplate.update("UPDATE four_pic_one_word SET image3_url = NULL WHERE image3_url = '' OR image3_url = 'null'");
                    jdbcTemplate.update("UPDATE four_pic_one_word SET image4_url = NULL WHERE image4_url = '' OR image4_url = 'null'");
                    System.out.println("✅ Cleaned up existing empty values");
                } catch (Exception e) {
                    System.out.println("⚠️ Cleanup warning: " + e.getMessage());
                }
                
                System.out.println("🎉 FPOW Schema Fix Complete! Dynamic image upload (1-4 images) now supported.");
            } else {
                System.out.println("✅ FPOW schema is already correct - no fix needed.");
            }
            
        } catch (Exception e) {
            System.err.println("❌ FPOW Schema Fix failed: " + e.getMessage());
            e.printStackTrace();
            // Don't throw - let the application continue
        }
    }

    /**
     * Ensure the user_progress table exists and contains all required columns
     * to support progress tracking and the integrated gold system.
     */
    private void ensureUserProgressTable() {
        try {
            // Check if table exists
            String tableExistsSql = """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'user_progress'
                """;
            Integer exists = jdbcTemplate.queryForObject(tableExistsSql, Integer.class);
            if (exists == null) exists = 0;

            if (exists == 0) {
                System.out.println("🛠️ Creating missing table: user_progress...");
                String createSql = """
                    CREATE TABLE user_progress (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        classroom_id BIGINT NULL,
                        category VARCHAR(255) NOT NULL,
                        current_level INT NOT NULL DEFAULT 1,
                        level INT NOT NULL DEFAULT 1,
                        puzzles_solved INT NOT NULL DEFAULT 0,
                        hints_used INT NOT NULL DEFAULT 0,
                        streak_count INT NOT NULL DEFAULT 0,
                        max_streak INT NOT NULL DEFAULT 0,
                        correct_answers INT NOT NULL DEFAULT 0,
                        wrong_answers INT NOT NULL DEFAULT 0,
                        total_attempts INT NOT NULL DEFAULT 0,
                        lives_left INT NOT NULL DEFAULT 3,
                        level_gold_earned INT NOT NULL DEFAULT 0,
                        level_gold_awarded INT NOT NULL DEFAULT 0,
                        level_completion_counts TEXT NULL,
                        last_played_level INT NULL,
                        last_played_category VARCHAR(255) NULL,
                        last_active DATETIME NULL,
                        created_at DATETIME NOT NULL,
                        updated_at DATETIME NULL
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """;
                jdbcTemplate.execute(createSql);
                System.out.println("✅ Created user_progress table");
            } else {
                // Ensure required columns exist (idempotent ALTERs)
                System.out.println("🔎 Verifying required columns on user_progress...");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS classroom_id BIGINT NULL");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS current_level INT NOT NULL DEFAULT 1");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS puzzles_solved INT NOT NULL DEFAULT 0");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS hints_used INT NOT NULL DEFAULT 0");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS streak_count INT NOT NULL DEFAULT 0");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS max_streak INT NOT NULL DEFAULT 0");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS correct_answers INT NOT NULL DEFAULT 0");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS wrong_answers INT NOT NULL DEFAULT 0");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS total_attempts INT NOT NULL DEFAULT 0");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS lives_left INT NOT NULL DEFAULT 3");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS level_gold_earned INT NOT NULL DEFAULT 0");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS level_gold_awarded INT NOT NULL DEFAULT 0");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS level_completion_counts TEXT NULL");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_played_level INT NULL");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_played_category VARCHAR(255) NULL");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_active DATETIME NULL");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT NOW()");
                jdbcTemplate.execute("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL");
                System.out.println("✅ user_progress columns verified");
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not verify/create user_progress table: " + e.getMessage());
            // Do not fail startup - gameplay can still proceed with localStorage fallback
        }
    }
}
