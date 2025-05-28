package com.example.Vocabia.controller;

import com.example.Vocabia.dto.GameSubmissionRequest;
import com.example.Vocabia.dto.GameSubmissionResponse;
import com.example.Vocabia.dto.LevelProgressDTO;
import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.service.GameProgressionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<GameSubmissionResponse> submitGameAnswer(@RequestBody GameSubmissionRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        GameSubmissionResponse response = gameProgressionService.processGameSubmission(email, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/progress")
    public ResponseEntity<UserProgressDTO> getUserProgress(@RequestParam String gameType) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserProgressDTO progress = gameProgressionService.getUserProgress(email, gameType);
        return ResponseEntity.ok(progress);
    }
}
