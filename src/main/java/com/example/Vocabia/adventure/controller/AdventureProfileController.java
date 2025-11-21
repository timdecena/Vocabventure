package com.example.Vocabia.adventure.controller;

import com.example.Vocabia.adventure.entity.AdventureProfile;
import com.example.Vocabia.adventure.service.AdventureProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/adventure/profile")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdventureProfileController {

    private static final Logger logger = LoggerFactory.getLogger(AdventureProfileController.class);

    private final AdventureProfileService profileService;

    public AdventureProfileController(AdventureProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public AdventureProfile getProfile(Principal principal) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("User '{}' authorities: {}", principal.getName(), auth.getAuthorities());
        return profileService.getOrCreateProfile(principal.getName());
    }

    @PostMapping("/complete-tutorial")
    public void completeTutorial(Principal principal) {
        profileService.completeTutorial(principal.getName());
    }

    /**
     * Get unlocked FPOW levels for Adventure Chronicles category
     */
    @GetMapping("/unlocked-fpow-levels")
    public ResponseEntity<Map<String, Object>> getUnlockedFpowLevels(Principal principal) {
        try {
            if (principal == null || principal.getName() == null) {
                logger.error("Principal is null or has no name");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not authenticated");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            String email = principal.getName();
            logger.info("Getting unlocked FPOW levels for user: {}", email);
            
            Set<Integer> unlockedLevels = profileService.getUnlockedFpowLevels(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("unlockedLevels", unlockedLevels);
            response.put("totalLevels", 10);
            
            logger.info("User '{}' has {} FPOW levels unlocked: {}", 
                        email, unlockedLevels.size(), unlockedLevels);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting unlocked FPOW levels", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve unlocked levels");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Check if a specific FPOW level is unlocked
     */
    @GetMapping("/check-fpow-level/{level}")
    public ResponseEntity<Map<String, Object>> checkFpowLevel(
            @PathVariable int level, 
            Principal principal) {
        boolean isUnlocked = profileService.isFpowLevelUnlocked(principal.getName(), level);
        
        Map<String, Object> response = new HashMap<>();
        response.put("level", level);
        response.put("isUnlocked", isUnlocked);
        response.put("unlockMessage", isUnlocked ? 
            "Level unlocked!" : 
            "Continue your adventure to unlock this word!");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Manually unlock FPOW levels (called when Adventure level is completed)
     */
    @PostMapping("/unlock-fpow-for-adventure/{adventureLevel}")
    public ResponseEntity<Map<String, Object>> unlockFpowForAdventure(
            @PathVariable int adventureLevel,
            Principal principal) {
        
        logger.info("Unlocking FPOW levels for user '{}' after completing Adventure Level {}", 
                    principal.getName(), adventureLevel);
        
        profileService.unlockFpowLevelsForAdventureLevel(principal.getName(), adventureLevel);
        Set<Integer> unlockedLevels = profileService.getUnlockedFpowLevels(principal.getName());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("adventureLevel", adventureLevel);
        response.put("unlockedLevels", unlockedLevels);
        response.put("message", "New Adventure Chronicles levels unlocked!");
        
        return ResponseEntity.ok(response);
    }
}
