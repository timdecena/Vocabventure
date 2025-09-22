package com.example.Vocabia.controller;

import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.service.UserProgressService;
import com.example.Vocabia.service.UserService;
import com.example.Vocabia.service.FourPicOneWordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-progress")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserProgressController {
    private final UserProgressService userProgressService;
    private final UserService userService;
    private final FourPicOneWordService fourPicOneWordService;

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + userDetails.getUsername()));
    }

    @lombok.Data
    public static class ProgressSubmissionRequest {
        private String category;
        private int level;
        private String answer;
        private boolean usedHint;
        
        @Override
        public String toString() {
            return String.format("ProgressSubmissionRequest{category='%s', level=%d, answer='%s', usedHint=%s}", 
                category, level, answer, usedHint);
        }
    }

    @GetMapping("/completed-levels")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getCompletedLevelsForCategory(
            @RequestParam String category,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getAuthenticatedUser(userDetails);
            List<Integer> completed = userProgressService.getCompletedLevels(user, category);
            int highest = completed.stream().mapToInt(Integer::intValue).max().orElse(0);
            // Determine next unlocked (highest+1), but do not exceed total levels
            int totalLevels = fourPicOneWordService.getLevelsByCategory(category).size();
            int nextUnlocked = Math.min(highest + 1, Math.max(1, totalLevels));

            Map<String, Object> response = new HashMap<>();
            response.put("category", category);
            response.put("completedLevels", completed);
            response.put("highestCompleted", highest);
            response.put("nextUnlocked", nextUnlocked);
            response.put("totalLevels", totalLevels);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch completed levels"));
        }
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> submitAnswer(
            @RequestBody ProgressSubmissionRequest req, 
            @AuthenticationPrincipal UserDetails userDetails) {
        
        System.out.println("🎯 PROGRESS SUBMISSION RECEIVED");
        System.out.println("📋 User: " + userDetails.getUsername());
        System.out.println("📋 Payload: " + req.toString());
        
        try {
            // CRITICAL: Get user from authenticated principal
            User user = getAuthenticatedUser(userDetails);
            
            System.out.println("✅ User found: " + user.getEmail() + " (ID: " + user.getId() + ")");
            
            // CRITICAL: Validate request payload
            if (req.getCategory() == null || req.getCategory().trim().isEmpty()) {
                throw new IllegalArgumentException("Category cannot be null or empty");
            }
            
            if (req.getLevel() <= 0) {
                throw new IllegalArgumentException("Level must be positive");
            }
            
            System.out.println("✅ Payload validation passed");
            
            // CRITICAL: Process the level completion with enhanced logging
            System.out.println("🔄 Processing level completion...");
            UserProgressDTO updatedProgress = userProgressService.completeLevel(
                    user,
                    req.getCategory(),
                    req.getLevel(),
                    req.isUsedHint()
            );
            
            System.out.println("✅ Progress updated successfully");
            System.out.println("📊 New progress: " + updatedProgress.toString());
            
            // Return success response with additional metadata
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("progress", updatedProgress);
            successResponse.put("message", "Progress saved successfully");
            successResponse.put("category", req.getCategory());
            successResponse.put("level", req.getLevel());
            
            return ResponseEntity.ok(successResponse);
            
        } catch (IllegalArgumentException e) {
            // CRITICAL: Validation error logging
            System.err.println("❌ VALIDATION ERROR IN SUBMIT PROGRESS:");
            System.err.println("   User: " + userDetails.getUsername());
            System.err.println("   Category: " + req.getCategory());
            System.err.println("   Level: " + req.getLevel());
            System.err.println("   Validation Error: " + e.getMessage());
            
            // Return proper validation error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation failed: " + e.getMessage());
            errorResponse.put("success", false);
            errorResponse.put("category", req.getCategory());
            errorResponse.put("level", req.getLevel());
            
            return ResponseEntity.badRequest().body(errorResponse);
            
        } catch (Exception e) {
            // CRITICAL: Enhanced error logging for unexpected errors
            System.err.println("❌ UNEXPECTED ERROR IN SUBMIT PROGRESS:");
            System.err.println("   User: " + userDetails.getUsername());
            System.err.println("   Category: " + req.getCategory());
            System.err.println("   Level: " + req.getLevel());
            System.err.println("   Error Type: " + e.getClass().getSimpleName());
            System.err.println("   Error Message: " + e.getMessage());
            e.printStackTrace();
            
            // Return detailed error response for debugging
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Server error: " + e.getMessage());
            errorResponse.put("success", false);
            errorResponse.put("category", req.getCategory());
            errorResponse.put("level", req.getLevel());
            errorResponse.put("errorType", e.getClass().getSimpleName());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/use-hint")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> useHint(@RequestParam String category, @RequestParam int level, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getAuthenticatedUser(userDetails);
            
            System.out.println("🎯 HINT REQUEST RECEIVED");
            System.out.println("📋 User: " + user.getEmail());
            System.out.println("📋 Category: " + category + ", Level: " + level);
            System.out.println("📋 Current gold balance: " + user.getGold());
            
            UserProgressDTO updatedProgress = userProgressService.useHint(user, category, level);
            
            // Return updated progress along with new gold balance
            Map<String, Object> response = new HashMap<>();
            response.put("progress", updatedProgress);
            response.put("newGoldBalance", userService.findByEmail(userDetails.getUsername()).get().getGold());
            response.put("hintCost", 25);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Hint request failed: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("success", false);
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error in hint request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "success", false));
        }
    }

    @PostMapping("/wrong")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<UserProgressDTO> wrongAttempt(@RequestBody ProgressSubmissionRequest req, @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        UserProgressDTO updatedProgress = userProgressService.wrongAttempt(user, req.getCategory());
        return ResponseEntity.ok(updatedProgress);
    }

    @GetMapping("/is-unlocked")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Boolean> isLevelUnlocked(@RequestParam String category, @RequestParam int level, @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        boolean unlocked = userProgressService.isLevelUnlocked(user, category, level);
        return ResponseEntity.ok(unlocked);
    }

    @GetMapping("/leaderboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<UserProgressDTO>> getLeaderboard(@RequestParam String category) {
        return ResponseEntity.ok(userProgressService.getLeaderboard(category));
    }

    @GetMapping("/leaderboard/global")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<UserProgressDTO>> getGlobalLeaderboard() {
        return ResponseEntity.ok(userProgressService.getGlobalLeaderboard());
    }

    @GetMapping("/last-played")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<UserProgressDTO> getLastPlayed(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        UserProgressDTO dto = userProgressService.getLastPlayed(user);
        if (dto == null) {
            dto = new UserProgressDTO();
        }
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<UserProgressDTO>> getAllUserProgress(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<UserProgressDTO> progressList = userProgressService.getAllUserProgress(user);
        return ResponseEntity.ok(progressList);
    }
    
    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<UserProgressDTO>> getUserProgressByCategory(
            @PathVariable String category, @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<UserProgressDTO> progressList = userProgressService.getAllUserProgress(user)
                .stream()
                .filter(progress -> category.equals(progress.getCategory()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(progressList);
    }



    @GetMapping("/student-info")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getStudentInfo(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("gold", user.getGold());

        // ✅ Add these two lines
        response.put("correctAnswers", user.getCorrectAnswers());
        response.put("progressPoints", user.getProgressPoints());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/category-progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getCategoryProgress(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);

        // Get all user progress
        List<UserProgressDTO> userProgressList = userProgressService.getAllUserProgress(user);
        
        // Get all available categories
        List<String> allCategories = fourPicOneWordService.getCategories();
        
        Map<String, Object> categoryProgressMap = new HashMap<>();
        
        for (String category : allCategories) {
            // Get total levels for this category
            List<Integer> totalLevels = fourPicOneWordService.getLevelsByCategory(category);
            int totalLevelCount = totalLevels.size();
            
            // Find user progress for this category
            UserProgressDTO userProgress = userProgressList.stream()
                    .filter(progress -> category.equals(progress.getCategory()))
                    .findFirst()
                    .orElse(null);
            
            int completedLevels = 0;
            int currentLevel = 1;
            List<Integer> completedLevelList = List.of();
            
            if (userProgress != null) {
                // Use unique completed levels list instead of puzzlesSolved to avoid counting replays
                completedLevelList = userProgressService.getCompletedLevels(user, category);
                completedLevels = completedLevelList.size();
                currentLevel = userProgress.getLevel();
            }
            
            Map<String, Object> categoryData = new HashMap<>();
            // Clamp completed levels to total levels available and include completed levels list
            int clampedCompleted = Math.min(completedLevels, totalLevelCount);
            categoryData.put("completedLevels", clampedCompleted);
            categoryData.put("totalLevels", totalLevelCount);
            categoryData.put("currentLevel", currentLevel);
            categoryData.put("completedLevelsList", completedLevelList);
            categoryData.put("progressPercentage", totalLevelCount > 0 ? (double) clampedCompleted / totalLevelCount * 100 : 0);
            
            categoryProgressMap.put(category, categoryData);
        }
        
        return ResponseEntity.ok(categoryProgressMap);
    }

    @GetMapping("/gold-balance")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getGoldBalance(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        
        Map<String, Object> response = new HashMap<>();
        response.put("goldBalance", user.getGold());
        response.put("hintCost", 25);
        response.put("canAffordHint", user.getGold() >= 25);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/level-completion-status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getLevelCompletionStatus(
            @RequestParam String category, 
            @RequestParam int level, 
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getAuthenticatedUser(userDetails);
            int completionCount = userProgressService.getLevelCompletionCount(user, category, level);
            boolean hasCompleted = userProgressService.hasCompletedLevel(user, category, level);

            int nextGoldReward = 0;
            if (completionCount == 0) {
                nextGoldReward = 10; // First completion
            } else if (completionCount == 1) {
                nextGoldReward = 5;  // Second completion
            }

            Map<String, Object> response = new HashMap<>();
            response.put("category", category);
            response.put("level", level);
            response.put("completionCount", completionCount);
            response.put("hasCompleted", hasCompleted);
            response.put("nextGoldReward", nextGoldReward);
            response.put("completedLevels", userProgressService.getCompletedLevels(user, category));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error in getLevelCompletionStatus: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch level completion status"));
        }
    }
}
