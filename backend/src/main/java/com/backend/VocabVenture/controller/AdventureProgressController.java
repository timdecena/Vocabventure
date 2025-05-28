package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.model.AdventureProfile;
import com.backend.VocabVenture.model.AdventureLevelStats;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.UserRepository;
import com.backend.VocabVenture.service.AdventureProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/progress")
public class AdventureProgressController {
    @Autowired
    private AdventureProgressService progressService;

    @Autowired
    private UserRepository userRepository;

    // Get user profile progress
    @GetMapping("/profile")
    public ResponseEntity<AdventureProfile> getProfile(Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        Optional<AdventureProfile> profile = progressService.getProfileByUserId(userId);
        return profile.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update user profile progress
    @PostMapping("/profile")
    public ResponseEntity<AdventureProfile> saveProfile(@RequestBody AdventureProfile profile, Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        profile.setUserId(userId);
        AdventureProfile saved = progressService.saveProfile(profile);
        return ResponseEntity.ok(saved);
    }

    // Get all level stats for user
    @GetMapping("/levels")
    public ResponseEntity<List<AdventureLevelStats>> getLevelStats(Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        List<AdventureLevelStats> stats = progressService.getLevelStatsByUserId(userId);
        return ResponseEntity.ok(stats);
    }

    // Get stats for a specific level
    @GetMapping("/levels/{levelId}")
    public ResponseEntity<AdventureLevelStats> getLevelStat(@PathVariable Long levelId, Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        Optional<AdventureLevelStats> stat = progressService.getLevelStats(userId, levelId);
        return stat.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update stats for a specific level
    @PostMapping("/levels/{levelId}")
    public ResponseEntity<AdventureLevelStats> saveLevelStat(@PathVariable Long levelId, @RequestBody AdventureLevelStats stats, Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        stats.setUserId(userId);
        stats.setLevelId(levelId);
        AdventureLevelStats saved = progressService.saveLevelStats(stats);
        return ResponseEntity.ok(saved);
    }

    // Helper: Extract userId from Principal (using username)
    private Long getUserIdFromPrincipal(Principal principal) {
        String username = principal.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return user.getId();
    }
} 