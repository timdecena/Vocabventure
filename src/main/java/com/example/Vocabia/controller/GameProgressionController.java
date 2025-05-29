package com.example.Vocabia.controller;

import com.example.Vocabia.dto.GameSubmissionRequest;
import com.example.Vocabia.dto.GameSubmissionResponse;
import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.service.GameProgressionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GameProgressionController {

    private final GameProgressionService gameProgressionService;

    @Autowired
    public GameProgressionController(GameProgressionService gameProgressionService) {
        this.gameProgressionService = gameProgressionService;
    }

    @PostMapping("/submit")
    public ResponseEntity<GameSubmissionResponse> submitGameAnswer(
            @RequestBody GameSubmissionRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        GameSubmissionResponse response = gameProgressionService.processGameSubmission(email, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/progress")
    public ResponseEntity<UserProgressDTO> getUserProgress(Authentication authentication) {
        String email = authentication.getName();
        UserProgressDTO progress = gameProgressionService.getUserProgress(email);
        return ResponseEntity.ok(progress);
    }
}
