package com.example.Vocabia.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * One-time migration to update Four Pics One Word image paths
 * from old format: /images/CategoryName/level/pic.jpg
 * to new format: /static/images/Four_Pic_One_Word_Category/CategoryName/level/pic.jpg
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ImagePathMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("🔧 Checking if image path migration is needed...");
            
            // Check if migration is needed by looking for old-style paths
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM four_pic_one_word WHERE image1_url LIKE '/images/%' AND image1_url NOT LIKE '/static/%'",
                Integer.class
            );
            
            if (count != null && count > 0) {
                log.info("📸 Found {} records with old image paths. Starting migration...", count);
                
                // Update all image paths
                int updated = jdbcTemplate.update(
                    "UPDATE four_pic_one_word SET " +
                    "image1_url = REPLACE(image1_url, '/images/', '/static/images/Four_Pic_One_Word_Category/'), " +
                    "image2_url = REPLACE(image2_url, '/images/', '/static/images/Four_Pic_One_Word_Category/'), " +
                    "image3_url = REPLACE(image3_url, '/images/', '/static/images/Four_Pic_One_Word_Category/'), " +
                    "image4_url = REPLACE(image4_url, '/images/', '/static/images/Four_Pic_One_Word_Category/') " +
                    "WHERE image1_url LIKE '/images/%' " +
                    "OR image2_url LIKE '/images/%' " +
                    "OR image3_url LIKE '/images/%' " +
                    "OR image4_url LIKE '/images/%'"
                );
                
                log.info("✅ Image path migration completed! Updated {} records.", updated);
                
                // Verify the migration
                Integer remaining = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM four_pic_one_word WHERE image1_url LIKE '/images/%' AND image1_url NOT LIKE '/static/%'",
                    Integer.class
                );
                
                if (remaining != null && remaining == 0) {
                    log.info("✅ Migration verification passed! All image paths updated successfully.");
                } else {
                    log.warn("⚠️ Migration verification found {} records still with old paths.", remaining);
                }
                
            } else {
                log.info("✅ Image paths are already up to date. No migration needed.");
            }
            
        } catch (Exception e) {
            log.error("❌ Error during image path migration: {}", e.getMessage(), e);
            // Don't throw exception - allow application to start even if migration fails
        }
    }
}
