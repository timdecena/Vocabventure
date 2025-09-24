package com.example.Vocabia.adventure.service;

import com.example.Vocabia.adventure.dto.IslandProgressDTO;
import com.example.Vocabia.adventure.entity.IslandProgress;
import com.example.Vocabia.adventure.repository.IslandProgressRepository;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.adventure.entity.LevelProgress;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.adventure.repository.LevelProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class IslandProgressService {

    private final IslandProgressRepository progressRepo;
    private final UserRepository userRepo;
    private final LevelProgressRepository levelProgressRepo;

    public IslandProgressService(IslandProgressRepository progressRepo, UserRepository userRepo, LevelProgressRepository levelProgressRepo) {
        this.progressRepo = progressRepo;
        this.userRepo = userRepo;
        this.levelProgressRepo = levelProgressRepo;
    }

    /**
     * Get all island progress for a user
     */
    public List<IslandProgressDTO> getAllProgressForUser(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        return progressRepo.findByUser(user)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get progress for a specific island
     */
    public IslandProgressDTO getProgressForIsland(String email, String islandName) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        Optional<IslandProgress> progress = progressRepo.findByUserAndIslandName(user, islandName);
        
        if (progress.isPresent()) {
            return convertToDTO(progress.get());
        } else {
            // Return default progress if none exists
            return new IslandProgressDTO(islandName, 0, 0, LocalDateTime.now());
        }
    }

    /**
     * Update progress when a level is completed
     */
    @Transactional
    public IslandProgressDTO updateProgress(String email, String islandName, int completedLevel, int starsEarned) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        // Find existing progress or create new one
        IslandProgress progress = progressRepo.findByUserAndIslandName(user, islandName)
                .orElse(new IslandProgress(user, islandName, 0, 0));
        
        // Update progress - only advance, never regress
        if (completedLevel > progress.getCompletedLevel()) {
            progress.setCompletedLevel(completedLevel);
        }
        
        // Add stars earned (cumulative)
        progress.setTotalStars(progress.getTotalStars() + starsEarned);
        
        // Save and return
        IslandProgress saved = progressRepo.save(progress);
        return convertToDTO(saved);
    }

    /**
     * Update progress with DTO (for backward compatibility)
     */
    @Transactional
    public IslandProgressDTO updateProgress(String email, IslandProgressDTO dto) {
        return updateProgress(email, dto.getIslandName(), dto.getCompletedLevel(), 0);
    }

    /**
     * Check if user has completed a specific level
     */
    public boolean hasCompletedLevel(String email, String islandName, int level) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        return progressRepo.hasCompletedLevel(user, islandName, level);
    }

    /**
     * Get highest completed level for an island
     */
    public int getHighestCompletedLevel(String email, String islandName) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        return progressRepo.getHighestCompletedLevel(user, islandName);
    }

    /**
     * Get total stars for a specific island
     */
    public int getTotalStarsForIsland(String email, String islandName) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        return progressRepo.getTotalStarsForIsland(user, islandName);
    }

    /**
     * Get total stars across all islands for a user
     */
    public int getTotalStarsForUser(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        return progressRepo.getTotalStarsForUser(user);
    }

    /**
     * Reset progress for an island (for testing purposes)
     */
    @Transactional
    public void resetIslandProgress(String email, String islandName) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        Optional<IslandProgress> progress = progressRepo.findByUserAndIslandName(user, islandName);
        if (progress.isPresent()) {
            IslandProgress p = progress.get();
            p.setCompletedLevel(0);
            p.setTotalStars(0);
            progressRepo.save(p);
        }
    }

    /**
     * Convert entity to DTO
     */
    private IslandProgressDTO convertToDTO(IslandProgress progress) {
        return new IslandProgressDTO(
                progress.getIslandName(),
                progress.getCompletedLevel(),
                progress.getTotalStars(),
                progress.getLastUpdated()
        );
    }

    /**
     * Island name constants for consistency
     */
    public static class IslandNames {
        public static final String JUNGLE_LUSH = "Jungle Lush";
        public static final String WATERSIDE_SHORES = "Waterside Shores";
        public static final String SHADOW_ISLES = "The Shadow Isles";
    }
    
    /**
     * Migration method: Convert old level progress to new island progress
     * This should be called once to migrate existing data
     */
    @Transactional
    public void migrateOldProgressToIslandProgress(String email) {
        try {
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
            
            System.out.println("🔄 Starting migration for user: " + email);
            
            // Check if already migrated
            List<IslandProgress> existingProgress = progressRepo.findByUser(user);
            if (!existingProgress.isEmpty()) {
                System.out.println("✅ User already has island progress, skipping migration");
                return;
            }
            
            // Get all old level progress
            List<LevelProgress> oldProgress = levelProgressRepo.findByUser(user);
            System.out.println("📊 Found " + oldProgress.size() + " old progress records");
            
            // Group by level name and find highest stars for each level (not sum)
            Map<String, Integer> levelCompletions = new HashMap<>();
            Map<String, Integer> levelBestStars = new HashMap<>();
            
            for (LevelProgress progress : oldProgress) {
                if (progress.isCompleted()) {
                    String levelName = progress.getLevelName();
                    int stars = progress.getStarsEarned();
                    
                    // Count completions and track BEST stars for each level
                    levelCompletions.put(levelName, levelCompletions.getOrDefault(levelName, 0) + 1);
                    levelBestStars.put(levelName, Math.max(levelBestStars.getOrDefault(levelName, 0), stars));
                }
            }
            
            // Map level names to island progress
            int jungleLushCompletedLevel = 0;
            int jungleLushTotalStars = 0;
            
            // Check each Jungle Lush level and use BEST stars (not sum)
            if (levelCompletions.containsKey("Commawidow's Web")) {
                jungleLushCompletedLevel = Math.max(jungleLushCompletedLevel, 1);
                jungleLushTotalStars += levelBestStars.getOrDefault("Commawidow's Web", 0);
                System.out.println("   - Commawidow's Web: " + levelBestStars.getOrDefault("Commawidow's Web", 0) + " stars");
            }
            if (levelCompletions.containsKey("Tensephant's Domain")) {
                jungleLushCompletedLevel = Math.max(jungleLushCompletedLevel, 2);
                jungleLushTotalStars += levelBestStars.getOrDefault("Tensephant's Domain", 0);
                System.out.println("   - Tensephant's Domain: " + levelBestStars.getOrDefault("Tensephant's Domain", 0) + " stars");
            }
            if (levelCompletions.containsKey("Pluribog's Pit")) {
                jungleLushCompletedLevel = Math.max(jungleLushCompletedLevel, 3);
                jungleLushTotalStars += levelBestStars.getOrDefault("Pluribog's Pit", 0);
                System.out.println("   - Pluribog's Pit: " + levelBestStars.getOrDefault("Pluribog's Pit", 0) + " stars");
            }
            if (levelCompletions.containsKey("Grammowl's Tower")) {
                jungleLushCompletedLevel = Math.max(jungleLushCompletedLevel, 4);
                jungleLushTotalStars += levelBestStars.getOrDefault("Grammowl's Tower", 0);
                System.out.println("   - Grammowl's Tower: " + levelBestStars.getOrDefault("Grammowl's Tower", 0) + " stars");
            }
            if (levelCompletions.containsKey("Grammowl")) {
                jungleLushCompletedLevel = Math.max(jungleLushCompletedLevel, 5);
                jungleLushTotalStars += levelBestStars.getOrDefault("Grammowl", 0);
                System.out.println("   - Grammowl: " + levelBestStars.getOrDefault("Grammowl", 0) + " stars");
            }
            
            System.out.println("🏝️ Jungle Lush migration result:");
            System.out.println("   - Completed Level: " + jungleLushCompletedLevel);
            System.out.println("   - Total Stars: " + jungleLushTotalStars);
            
            // Create island progress if any levels were completed
            if (jungleLushCompletedLevel > 0) {
                IslandProgress islandProgress = new IslandProgress();
                islandProgress.setUser(user);
                islandProgress.setIslandName(IslandNames.JUNGLE_LUSH);
                islandProgress.setCompletedLevel(jungleLushCompletedLevel);
                islandProgress.setTotalStars(jungleLushTotalStars);
                islandProgress.setLastUpdated(LocalDateTime.now());
                
                progressRepo.save(islandProgress);
                System.out.println("✅ Created Jungle Lush island progress");
            }
            
            System.out.println("🎉 Migration completed successfully");
            
        } catch (Exception e) {
            System.out.println("❌ Migration failed: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Reset all island progress for a user (for re-migration)
     */
    @Transactional
    public void resetAllProgress(String email) {
        try {
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
            
            System.out.println("🗑️ Resetting all island progress for user: " + email);
            
            // Delete all existing island progress
            List<IslandProgress> existingProgress = progressRepo.findByUser(user);
            progressRepo.deleteAll(existingProgress);
            
            System.out.println("✅ Deleted " + existingProgress.size() + " island progress records");
            
        } catch (Exception e) {
            System.out.println("❌ Reset failed: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
