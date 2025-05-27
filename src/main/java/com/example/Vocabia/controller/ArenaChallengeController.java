package com.example.Vocabia.controller;

import com.example.Vocabia.dto.*;
import com.example.Vocabia.service.ArenaChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/arena")
@RequiredArgsConstructor
public class ArenaChallengeController {

    private final ArenaChallengeService arenaService;

    @GetMapping("/start/{wordListId}")
    public List<ArenaWordDTO> start(@PathVariable Long wordListId) {
        return arenaService.getRandomizedWords(wordListId);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submit(@RequestBody ArenaResultDTO result, Principal principal) {
        arenaService.evaluateAndSave(result, principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/leaderboard/{wordListId}")
    public List<ArenaLeaderboardDTO> leaderboard(@PathVariable Long wordListId) {
        return arenaService.getLeaderboard(wordListId);
    }
}
