package com.example.Vocabia.controller;

import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.service.FourPicOneWordProgressionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/4pic1word/progress")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class FourPicOneWordProgressionController {

    private final FourPicOneWordProgressionService progressionService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitAnswer(
            Authentication auth,
            @RequestParam Long puzzleId,
            @RequestParam String answer,
            @RequestParam int timeTaken,
            @RequestParam int hintsUsed
    ) {
        var result = progressionService.submitAnswer(
                auth.getName(), puzzleId, answer, timeTaken, hintsUsed);
        // Return XP, correctness, and unlock status (can extend as needed)
        return ResponseEntity.ok(result);
    }

    @GetMapping("/user")
    public ResponseEntity<UserProgressDTO> getUserProgress(Authentication auth) {
        return ResponseEntity.ok(progressionService.getUserProgress(auth.getName()));
    }

    @GetMapping("/unlocked-level")
    public ResponseEntity<Map<String, Integer>> getUnlockedLevel(Authentication auth) {
        int unlockedLevel = progressionService.getUnlockedLevel(auth.getName());
        Map<String, Integer> result = new HashMap<>();
        result.put("unlockedLevel", unlockedLevel);
        return ResponseEntity.ok(result);
    }
}