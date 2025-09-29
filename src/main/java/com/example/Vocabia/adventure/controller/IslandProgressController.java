package com.example.Vocabia.adventure.controller;

import com.example.Vocabia.adventure.dto.IslandProgressDTO;
import com.example.Vocabia.adventure.service.IslandProgressService;
import com.example.Vocabia.adventure.entity.IslandProgress;
import com.example.Vocabia.adventure.entity.LevelProgress;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.adventure.repository.LevelProgressRepository;
import com.example.Vocabia.adventure.repository.IslandProgressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/adventure/island-progress")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class IslandProgressController {

    private final IslandProgressService islandProgressService;
    private final UserRepository userRepo;
    private final LevelProgressRepository levelProgressRepo;
    private final IslandProgressRepository progressRepo;

    public IslandProgressController(IslandProgressService islandProgressService, UserRepository userRepo, LevelProgressRepository levelProgressRepo, IslandProgressRepository progressRepo) {
        this.islandProgressService = islandProgressService;
        this.userRepo = userRepo;
        this.levelProgressRepo = levelProgressRepo;
        this.progressRepo = progressRepo;
    }

    /**
     * Get all island progress for the authenticated user
     */
    @GetMapping
    public ResponseEntity<List<IslandProgressDTO>> getAllProgress(Principal principal) {
        try {
            System.out.println("🔍 Fetching all progress for user: " + principal.getName());
            List<IslandProgressDTO> progress = islandProgressService.getAllProgressForUser(principal.getName());
            System.out.println("📊 Found progress records: " + progress.size());
            for (IslandProgressDTO p : progress) {
                System.out.println("   - " + p.getIslandName() + ": Level " + p.getCompletedLevel() + ", Stars " + p.getTotalStars());
            }
            
            // Debug: Check if Shadow Isles exists in database
            User user = userRepo.findByEmail(principal.getName()).orElse(null);
            if (user != null) {
                List<IslandProgress> allProgress = progressRepo.findByUser(user);
                System.out.println("🔍 Raw database progress records: " + allProgress.size());
                for (IslandProgress p : allProgress) {
                    System.out.println("   - DB: " + p.getIslandName() + ": Level " + p.getCompletedLevel() + ", Stars " + p.getTotalStars());
                }
            }
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            System.out.println("❌ Error fetching progress: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get progress for a specific island
     */
    @GetMapping("/{islandName}")
    public ResponseEntity<IslandProgressDTO> getIslandProgress(
            @PathVariable String islandName, 
            Principal principal) {
        try {
            IslandProgressDTO progress = islandProgressService.getProgressForIsland(principal.getName(), islandName);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update progress when completing a level
     */
    @PostMapping("/{islandName}/update")
    public ResponseEntity<Map<String, Object>> updateProgress(
            @PathVariable String islandName,
            @RequestBody Map<String, Object> request,
            Principal principal) {
        try {
            // Extract data from request
            int completedLevel = (Integer) request.get("completedLevel");
            int starsEarned = request.containsKey("starsEarned") ? (Integer) request.get("starsEarned") : 0;
            
            // Update progress
            IslandProgressDTO updatedProgress = islandProgressService.updateProgress(
                    principal.getName(), 
                    islandName, 
                    completedLevel, 
                    starsEarned
            );
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("progress", updatedProgress);
            response.put("message", "Progress updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update progress: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Alternative endpoint for backward compatibility with level-progress format
     */
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveLevelProgress(
            @RequestBody Map<String, Object> request,
            Principal principal) {
        try {
            String levelName = (String) request.get("levelName");
            boolean completed = (Boolean) request.get("completed");
            int starsEarned = request.containsKey("starsEarned") ? (Integer) request.get("starsEarned") : 0;
            
            System.out.println("🎯 Received level progress save request:");
            System.out.println("   - User: " + principal.getName());
            System.out.println("   - Level Name: " + levelName);
            System.out.println("   - Completed: " + completed);
            System.out.println("   - Stars Earned: " + starsEarned);
            
            if (!completed) {
                // If not completed, just return success without updating
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Level attempt recorded");
                return ResponseEntity.ok(response);
            }
            
            // Parse island name and level from levelName using EXACT matches
            String islandName;
            int levelNumber;
            
            // Jungle Lush levels (exact matches)
            if (levelName.equals("Commawidow's Web")) {
                islandName = IslandProgressService.IslandNames.JUNGLE_LUSH;
                levelNumber = 1;
            } else if (levelName.equals("Tensephant's Domain")) {
                islandName = IslandProgressService.IslandNames.JUNGLE_LUSH;
                levelNumber = 2;
            } else if (levelName.equals("Pluribog's Pit")) {
                islandName = IslandProgressService.IslandNames.JUNGLE_LUSH;
                levelNumber = 3;
            } else if (levelName.equals("Grammowl's Tower")) {
                islandName = IslandProgressService.IslandNames.JUNGLE_LUSH;
                levelNumber = 4;
            } else if (levelName.equals("Grammowl")) {
                islandName = IslandProgressService.IslandNames.JUNGLE_LUSH;
                levelNumber = 5;
            } 
            // Waterside Shores levels (exact matches)
            else if (levelName.equals("Scribblash")) {
                islandName = IslandProgressService.IslandNames.WATERSIDE_SHORES;
                levelNumber = 1;
            } else if (levelName.equals("Corallex")) {
                islandName = IslandProgressService.IslandNames.WATERSIDE_SHORES;
                levelNumber = 2;
            } else if (levelName.equals("Silentscale")) {
                islandName = IslandProgressService.IslandNames.WATERSIDE_SHORES;
                levelNumber = 3;
            } else if (levelName.equals("Homophibian")) {
                islandName = IslandProgressService.IslandNames.WATERSIDE_SHORES;
                levelNumber = 4;
            } else if (levelName.equals("Spellisk")) {
                islandName = IslandProgressService.IslandNames.WATERSIDE_SHORES;
                levelNumber = 5;
            } 
            // Shadow Isles levels (exact matches)
            else if (levelName.equals("Murkmind")) {
                islandName = IslandProgressService.IslandNames.SHADOW_ISLES;
                levelNumber = 1;
            } else if (levelName.equals("Echojack")) {
                islandName = IslandProgressService.IslandNames.SHADOW_ISLES;
                levelNumber = 2;
            } else if (levelName.equals("Shardling")) {
                islandName = IslandProgressService.IslandNames.SHADOW_ISLES;
                levelNumber = 3;
            } else if (levelName.equals("Umbrosk")) {
                islandName = IslandProgressService.IslandNames.SHADOW_ISLES;
                levelNumber = 4;
            } else if (levelName.equals("Dysauron")) {
                islandName = IslandProgressService.IslandNames.SHADOW_ISLES;
                levelNumber = 5;
            } else {
                // Default fallback for unknown level names
                System.out.println("⚠️ Unknown level name: " + levelName + ", defaulting to Jungle Lush Level 1");
                islandName = IslandProgressService.IslandNames.JUNGLE_LUSH;
                levelNumber = 1;
            }
            
            System.out.println("🏝️ Parsed level info:");
            System.out.println("   - Island Name: " + islandName);
            System.out.println("   - Level Number: " + levelNumber);
            
            // Update progress
            IslandProgressDTO updatedProgress = islandProgressService.updateProgress(
                    principal.getName(), 
                    islandName, 
                    levelNumber, 
                    starsEarned
            );
            
            System.out.println("✅ Updated progress: " + updatedProgress);
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("progress", updatedProgress);
            response.put("message", "Level progress saved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to save progress: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Check if user has completed a specific level
     */
    @GetMapping("/{islandName}/completed/{level}")
    public ResponseEntity<Map<String, Object>> hasCompletedLevel(
            @PathVariable String islandName,
            @PathVariable int level,
            Principal principal) {
        try {
            boolean completed = islandProgressService.hasCompletedLevel(principal.getName(), islandName, level);
            
            Map<String, Object> response = new HashMap<>();
            response.put("completed", completed);
            response.put("islandName", islandName);
            response.put("level", level);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get user's total stars across all islands
     */
    @GetMapping("/total-stars")
    public ResponseEntity<Map<String, Object>> getTotalStars(Principal principal) {
        try {
            int totalStars = islandProgressService.getTotalStarsForUser(principal.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalStars", totalStars);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Clean up inflated star counts (for fixing cumulative star issues)
     */
    @PostMapping("/cleanup-stars")
    public ResponseEntity<Map<String, Object>> cleanupInflatedStars(Principal principal) {
        try {
            islandProgressService.cleanupInflatedStars(principal.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Star counts cleaned up successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to cleanup stars: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Reset progress for an island (for testing)
     */
    @PostMapping("/{islandName}/reset")
    public ResponseEntity<Map<String, Object>> resetIslandProgress(
            @PathVariable String islandName,
            Principal principal) {
        try {
            islandProgressService.resetIslandProgress(principal.getName(), islandName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Island progress reset successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to reset progress: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Migration endpoint: Convert old level progress to new island progress
     */
    @PostMapping("/migrate")
    public ResponseEntity<Map<String, Object>> migrateProgress(Principal principal) {
        try {
            System.out.println("🚀 Migration endpoint called for user: " + principal.getName());
            islandProgressService.migrateOldProgressToIslandProgress(principal.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Migration completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Migration endpoint error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Migration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Reset and re-migrate progress (for fixing migration issues)
     */
    @PostMapping("/reset-and-migrate")
    public ResponseEntity<Map<String, Object>> resetAndMigrateProgress(Principal principal) {
        try {
            System.out.println("🔄 Reset and re-migrate called for user: " + principal.getName());
            
            // First reset all island progress
            islandProgressService.resetAllProgress(principal.getName());
            
            // Then re-migrate
            islandProgressService.migrateOldProgressToIslandProgress(principal.getName());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Reset and migration completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Reset and migration error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Reset and migration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Fix incorrect progress levels (completedLevel > maxLevels)
     */
    @PostMapping("/fix-levels")
    public ResponseEntity<Map<String, Object>> fixIncorrectLevels() {
        try {
            System.out.println("🔧 Fix levels endpoint called");
            islandProgressService.fixIncorrectProgressLevels();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Incorrect progress levels fixed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Fix levels error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Fix failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Create Shadow Isles progress specifically
     */
    @PostMapping("/shadow-isles/create")
    public ResponseEntity<Map<String, Object>> createShadowIslesProgress(Principal principal) {
        try {
            System.out.println("🏝️ Creating Shadow Isles progress for user: " + principal.getName());
            
            // Get user
            User user = userRepo.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
            
            // Get all old level progress
            List<LevelProgress> oldProgress = levelProgressRepo.findByUser(user);
            System.out.println("📊 Found " + oldProgress.size() + " old progress records");
            
            // Track best stars per Shadow Isles level
            Map<String, Integer> shadowIslesStars = new HashMap<>();
            for (LevelProgress progress : oldProgress) {
                if (progress.isCompleted()) {
                    String levelName = progress.getLevelName();
                    if (levelName.equals("Murkmind") || levelName.equals("Echojack") || 
                        levelName.equals("Shardling") || levelName.equals("Umbrosk") || 
                        levelName.equals("Dysauron")) {
                        int stars = progress.getStarsEarned();
                        shadowIslesStars.put(levelName, Math.max(shadowIslesStars.getOrDefault(levelName, 0), stars));
                    }
                }
            }
            
            // Calculate continuous streak and total stars
            String[] shadowIslesLevels = {"Murkmind", "Echojack", "Shardling", "Umbrosk", "Dysauron"};
            int completedLevel = 0;
            int totalStars = 0;
            
            for (int i = 0; i < shadowIslesLevels.length; i++) {
                if (shadowIslesStars.containsKey(shadowIslesLevels[i])) {
                    completedLevel = i + 1;
                    totalStars += shadowIslesStars.get(shadowIslesLevels[i]);
                } else {
                    break;
                }
            }
            
            System.out.println("🏝️ Shadow Isles progress: Level " + completedLevel + ", Stars " + totalStars);
            
            // Create or update Shadow Isles progress
            if (completedLevel > 0) {
                IslandProgress existing = progressRepo.findByUserAndIslandName(user, "The Shadow Isles").orElse(null);
                if (existing != null) {
                    existing.setCompletedLevel(Math.max(existing.getCompletedLevel(), completedLevel));
                    existing.setTotalStars(Math.max(existing.getTotalStars(), totalStars));
                    existing.setLastUpdated(LocalDateTime.now());
                    progressRepo.save(existing);
                    System.out.println("✅ Updated existing Shadow Isles progress");
                } else {
                    IslandProgress newProgress = new IslandProgress();
                    newProgress.setUser(user);
                    newProgress.setIslandName("The Shadow Isles");
                    newProgress.setCompletedLevel(completedLevel);
                    newProgress.setTotalStars(totalStars);
                    newProgress.setLastUpdated(LocalDateTime.now());
                    progressRepo.save(newProgress);
                    System.out.println("✅ Created new Shadow Isles progress");
                }
                
                // Verify the progress was saved
                IslandProgress savedProgress = progressRepo.findByUserAndIslandName(user, "The Shadow Isles").orElse(null);
                if (savedProgress != null) {
                    System.out.println("🔍 Verified Shadow Isles progress saved: Level " + savedProgress.getCompletedLevel() + ", Stars " + savedProgress.getTotalStars());
                } else {
                    System.out.println("❌ Shadow Isles progress was NOT saved!");
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Shadow Isles progress created successfully");
            response.put("completedLevel", completedLevel);
            response.put("totalStars", totalStars);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Create Shadow Isles error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Creation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
