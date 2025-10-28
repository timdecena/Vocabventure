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
}
