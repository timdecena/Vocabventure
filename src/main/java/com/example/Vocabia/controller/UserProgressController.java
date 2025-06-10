package com.example.Vocabia.controller;

import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.service.UserProgressService;
import com.example.Vocabia.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/user-progress")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserProgressController {
    private final UserProgressService userProgressService;
    private final UserService userService;

    @lombok.Data
    public static class ProgressSubmissionRequest {
        private String category;
        private int level;
        private String answer;
        private boolean usedHint;
    }

    // Submit answer, return updated UserProgressDTO
    @PostMapping("/submit")
    public ResponseEntity<UserProgressDTO> submitAnswer(@RequestBody ProgressSubmissionRequest req, Principal principal) {
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProgressDTO updatedProgress = userProgressService.completeLevel(user, req.getCategory(), req.isUsedHint());
        return ResponseEntity.ok(updatedProgress);
    }

    // Register hint use, return updated UserProgressDTO
    @PostMapping("/use-hint")
    public ResponseEntity<UserProgressDTO> useHint(@RequestParam String category, @RequestParam int level, Principal principal) {
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProgressDTO updatedProgress = userProgressService.useHint(user, category, level);
        return ResponseEntity.ok(updatedProgress);
    }

    // Register wrong attempt, return updated UserProgressDTO
    @PostMapping("/wrong")
    public ResponseEntity<UserProgressDTO> wrongAttempt(@RequestBody ProgressSubmissionRequest req, Principal principal) {
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProgressDTO updatedProgress = userProgressService.wrongAttempt(user, req.getCategory());
        return ResponseEntity.ok(updatedProgress);
    }

    // Check if level is unlocked (returns boolean)
    @GetMapping("/is-unlocked")
    public ResponseEntity<Boolean> isLevelUnlocked(@RequestParam String category, @RequestParam int level, Principal principal) {
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean unlocked = userProgressService.isLevelUnlocked(user, category, level);
        return ResponseEntity.ok(unlocked);
    }

    // Leaderboard for category
    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserProgressDTO>> getLeaderboard(@RequestParam String category) {
        return ResponseEntity.ok(userProgressService.getLeaderboard(category));
    }

    // Global leaderboard
    @GetMapping("/leaderboard/global")
    public ResponseEntity<List<UserProgressDTO>> getGlobalLeaderboard() {
        return ResponseEntity.ok(userProgressService.getGlobalLeaderboard());
    }

    // Get most recent progress for user
    @GetMapping("/last-played")
    public ResponseEntity<UserProgressDTO> getLastPlayed(Principal principal) {
        User user = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProgressDTO dto = userProgressService.getLastPlayed(user);
        if (dto == null) {
            // No progress yet, return empty object to avoid frontend null errors
            dto = new UserProgressDTO();
        }
        return ResponseEntity.ok(dto);
    }

    // Optionally, add more endpoints for analytics, game summary, etc.
}
