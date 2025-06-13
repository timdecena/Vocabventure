package com.example.Vocabia.adventure.controller;

import com.example.Vocabia.adventure.entity.AdventureProfile;
import com.example.Vocabia.adventure.service.AdventureProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.security.Principal;

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
}
