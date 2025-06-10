package com.example.Vocabia.controller;

import com.example.Vocabia.dto.WOTDLeaderboardEntryDTO;
import com.example.Vocabia.repository.WordOfTheDayScoreRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard/wotd")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class WOTDLeaderboardController {

    private final WordOfTheDayScoreRepository scoreRepo;

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER')")
 // ✅ Allow STUDENT to access this
public List<WOTDLeaderboardEntryDTO> getWOTDLeaderboard() {
    return scoreRepo.fetchWOTDLeaderboard();
}
}
