package com.example.Vocabia.adventure.controller;

import com.example.Vocabia.adventure.dto.LevelCompletionRequest;
import com.example.Vocabia.adventure.dto.LevelDataResponse;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.adventure.service.LevelProgressService;
import com.example.Vocabia.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/adventure")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdventureProgressController {

    private final LevelProgressService levelProgressService;
    private final UserService userService;

    @Autowired
    public AdventureProgressController(LevelProgressService levelProgressService, UserService userService) {
        this.levelProgressService = levelProgressService;
        this.userService = userService;
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitLevelProgress(@RequestBody LevelCompletionRequest request,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        levelProgressService.saveLevelProgress(user, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/level/{levelId}")
    public ResponseEntity<LevelDataResponse> getLevelData(@PathVariable Long levelId) {
        LevelDataResponse response = levelProgressService.getLevelData(levelId);
        return ResponseEntity.ok(response);
    }
}
