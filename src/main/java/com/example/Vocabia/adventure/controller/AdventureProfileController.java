package com.example.Vocabia.adventure.controller;

import com.example.Vocabia.adventure.entity.AdventureProfile;
import com.example.Vocabia.adventure.service.AdventureProfileService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/adventure/profile")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdventureProfileController {

    private final AdventureProfileService profileService;

    public AdventureProfileController(AdventureProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public AdventureProfile getProfile(Principal principal) {
        return profileService.getOrCreateProfile(principal.getName());
    }
}
