package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.model.GameLevel;
import com.backend.VocabVenture.service.GameLevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
public class GameLevelController {

    private final GameLevelService gameLevelService;

    @Autowired
    public GameLevelController(GameLevelService gameLevelService) {
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
     * Create a new game level (admin/teacher only)
     */
    @PostMapping("/levels")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'TEACHER')")
    public ResponseEntity<GameLevel> createLevel(@RequestBody GameLevel level) {
        return ResponseEntity.ok(gameLevelService.createLevel(level));
    }

    /**
     * Update an existing game level (admin/teacher only)
     */
    @PutMapping("/levels/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'TEACHER')")
    public ResponseEntity<GameLevel> updateLevel(
            @PathVariable Long id,
            @RequestBody GameLevel levelDetails) {
        return ResponseEntity.ok(gameLevelService.updateLevel(id, levelDetails));
    }

    /**
     * Delete a game level (admin/teacher only)
     */
    @DeleteMapping("/levels/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'TEACHER')")
    public ResponseEntity<Void> deleteLevel(@PathVariable Long id) {
        gameLevelService.deleteLevel(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Load levels from filesystem (admin/teacher only)
     * This is useful for development and initial setup
     */
    @PostMapping("/levels/load-from-filesystem")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'TEACHER')")
    public ResponseEntity<List<GameLevel>> loadLevelsFromFilesystem() throws IOException {
        return ResponseEntity.ok(gameLevelService.loadLevelsFromFilesystem());
    }
}
