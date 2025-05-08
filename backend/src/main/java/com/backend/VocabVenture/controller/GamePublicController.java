package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.model.GameLevel;
import com.backend.VocabVenture.service.GameLevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for public game data that doesn't require authentication
 */
@RestController
@RequestMapping("/api/game/public")
public class GamePublicController {

    private final GameLevelService gameLevelService;

    @Autowired
    public GamePublicController(GameLevelService gameLevelService) {
        this.gameLevelService = gameLevelService;
    }

    /**
     * Get all available game categories
     */
    @GetMapping("/categories")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(gameLevelService.getAllCategories());
    }

    /**
     * Get all levels in a specific category
     */
    @GetMapping("/categories/{category}/levels")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<GameLevel>> getLevelsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(gameLevelService.getLevelsByCategory(category));
    }

    /**
     * Get a specific level by category and level number
     */
    @GetMapping("/categories/{category}/levels/{levelNumber}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> getLevelData(
            @PathVariable String category,
            @PathVariable Integer levelNumber) {
        return ResponseEntity.ok(gameLevelService.getLevelData(category, levelNumber));
    }
    
    /**
     * Get initial game data for non-authenticated users
     */
    @GetMapping("/initial-data")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> getInitialGameData() {
        Map<String, Object> initialData = new HashMap<>();
        
        // Get all categories
        List<String> categories = gameLevelService.getAllCategories();
        initialData.put("categories", categories);
        
        // For each category, get the first level
        Map<String, Object> categoryData = new HashMap<>();
        for (String category : categories) {
            List<GameLevel> levels = gameLevelService.getLevelsByCategory(category);
            if (!levels.isEmpty()) {
                categoryData.put(category, Map.of(
                    "totalLevels", levels.size(),
                    "firstLevel", levels.get(0)
                ));
            }
        }
        initialData.put("categoryData", categoryData);
        
        return ResponseEntity.ok(initialData);
    }
    
    /**
     * Public endpoint to load game levels from the filesystem
     * This is useful for development and initial setup
     */
    @PostMapping("/load-game-data")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<GameLevel>> loadGameData() {
        try {
            List<GameLevel> loadedLevels = gameLevelService.loadLevelsFromFilesystem();
            return ResponseEntity.ok(loadedLevels);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
