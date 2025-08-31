package com.example.Vocabia.controller;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.service.SpellingChallengeGameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SpellingGameController {

    private final SpellingChallengeGameService gameService;

    @PostMapping("/api/game/spelling/attempts/level/{levelId}")
    public ResponseEntity<?> recordLevelAttempt(@AuthenticationPrincipal User student,
                                                @PathVariable Long levelId) {
        gameService.recordLevelAttempt(student, levelId);
        return ResponseEntity.ok().build();
    }
}
