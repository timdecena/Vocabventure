package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.model.AdventureProfile;
import com.backend.VocabVenture.service.AdventureProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/adventure-profile")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdventureProfileController {

    private final AdventureProfileService adventureProfileService;

    @Autowired
    public AdventureProfileController(AdventureProfileService adventureProfileService) {
        this.adventureProfileService = adventureProfileService;
    }

    @PostMapping
    public ResponseEntity<?> createProfile(@RequestBody Map<String, String> request) {
        try {
            String adventurerName = request.get("adventurer_name");
            String gender = request.get("gender");
            Long userId = Long.parseLong(request.get("user_id"));

            if (adventurerName == null || gender == null || userId == null) {
                return ResponseEntity.badRequest().body("Missing required fields");
            }

            // Check if profile already exists
            if (adventureProfileService.getProfileByUserId(userId).isPresent()) {
                return ResponseEntity.badRequest().body("Profile already exists for this user");
            }

            AdventureProfile profile = adventureProfileService.createProfile(adventurerName, gender, userId);
            return ResponseEntity.ok(profile);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating profile: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getProfile(@RequestParam Long userId) {
        try {
            return adventureProfileService.getProfileByUserId(userId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching profile: " + e.getMessage());
        }
    }

    @PutMapping("/complete-tutorial")
    public ResponseEntity<?> completeTutorial(@RequestParam Long userId) {
        try {
            AdventureProfile profile = adventureProfileService.getProfileByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Profile not found"));
            
            profile.setTutorialCompleted(true);
            AdventureProfile updatedProfile = adventureProfileService.updateProfile(profile);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error completing tutorial: " + e.getMessage());
        }
    }
} 