package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.model.GameLevel;
import com.backend.VocabVenture.model.LevelProgress;
import com.backend.VocabVenture.service.LevelProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game/progress")
public class LevelProgressController {

    private final LevelProgressService levelProgressService;

    @Autowired
    public LevelProgressController(LevelProgressService levelProgressService) {
        this.levelProgressService = levelProgressService;
    }

    /**
     * Record a completed level for the current user and award XP
     */
    @PostMapping("/complete")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'ROLE_STUDENT', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> recordLevelCompletion(
            @RequestBody Map<String, Object> completionData) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(auth.getName());
        
        Long levelId = Long.parseLong(completionData.get("levelId").toString());
        Integer attempts = completionData.containsKey("attempts") 
                ? Integer.parseInt(completionData.get("attempts").toString()) 
                : 1;
        Integer timeTaken = completionData.containsKey("timeTaken") 
                ? Integer.parseInt(completionData.get("timeTaken").toString()) 
                : null;
        Integer hintsUsed = completionData.containsKey("hintsUsed") 
                ? Integer.parseInt(completionData.get("hintsUsed").toString()) 
                : 0;
        
        Map<String, Object> result = levelProgressService.recordLevelCompletion(
                userId, levelId, attempts, timeTaken, hintsUsed);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Get all completed levels for the current user
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'ROLE_STUDENT', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<LevelProgress>> getUserProgress() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(auth.getName());
        
        return ResponseEntity.ok(levelProgressService.getUserProgress(userId));
    }

    /**
     * Get user progress for a specific category
     */
    @GetMapping("/me/categories/{category}")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'ROLE_STUDENT', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<LevelProgress>> getUserProgressByCategory(
            @PathVariable String category) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(auth.getName());
        
        return ResponseEntity.ok(levelProgressService.getUserProgressByCategory(userId, category));
    }

    /**
     * Check if the current user has completed a specific level
     */
    @GetMapping("/me/completed/{levelId}")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'ROLE_STUDENT', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Map<String, Boolean>> hasUserCompletedLevel(
            @PathVariable Long levelId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(auth.getName());
        
        boolean completed = levelProgressService.hasUserCompletedLevel(userId, levelId);
        return ResponseEntity.ok(Map.of("completed", completed));
    }

    /**
     * Get user progress summary
     */
    @GetMapping("/me/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'ROLE_STUDENT', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Map<String, Object>> getUserProgressSummary() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(auth.getName());
        
        return ResponseEntity.ok(levelProgressService.getUserProgressSummary(userId));
    }

    /**
     * Get next available level for the current user in a category
     */
    @GetMapping("/me/next-level/{category}")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'ROLE_STUDENT', 'TEACHER', 'STUDENT')")
    public ResponseEntity<GameLevel> getNextAvailableLevel(
            @PathVariable String category) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(auth.getName());
        
        return ResponseEntity.ok(levelProgressService.getNextAvailableLevel(userId, category));
    }

    /**
     * Admin/Teacher endpoint to view any user's progress
     */
    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'TEACHER')")
    public ResponseEntity<List<LevelProgress>> getAnyUserProgress(
            @PathVariable Long userId) {
        return ResponseEntity.ok(levelProgressService.getUserProgress(userId));
    }

    /**
     * Admin/Teacher endpoint to view any user's progress summary
     */
    @GetMapping("/users/{userId}/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER', 'TEACHER')")
    public ResponseEntity<Map<String, Object>> getAnyUserProgressSummary(
            @PathVariable Long userId) {
        return ResponseEntity.ok(levelProgressService.getUserProgressSummary(userId));
    }
}
