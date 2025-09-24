package com.example.Vocabia.adventure.controller;

import com.example.Vocabia.adventure.dto.IslandProgressDTO;
import com.example.Vocabia.adventure.service.IslandProgressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/adventure/island-progress")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class IslandProgressController {

    private final IslandProgressService islandProgressService;

    public IslandProgressController(IslandProgressService islandProgressService) {
        this.islandProgressService = islandProgressService;
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
            
            // Parse island name and level from levelName
            String islandName;
            int levelNumber;
            
            if (levelName.contains("Commawidow's Web")) {
                islandName = IslandProgressService.IslandNames.JUNGLE_LUSH;
                levelNumber = 1;
            } else if (levelName.contains("Tensephant's Domain")) {
                islandName = IslandProgressService.IslandNames.JUNGLE_LUSH;
                levelNumber = 2;
            } else if (levelName.contains("Pluribog's Pit")) {
                islandName = IslandProgressService.IslandNames.JUNGLE_LUSH;
                levelNumber = 3;
            } else if (levelName.contains("Grammowl's Tower")) {
                islandName = IslandProgressService.IslandNames.JUNGLE_LUSH;
                levelNumber = 4;
            } else if (levelName.contains("Grammowl")) {
                islandName = IslandProgressService.IslandNames.JUNGLE_LUSH;
                levelNumber = 5;
            } else {
                // Default fallback
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
}
