package com.example.Vocabia.controller;

import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.entity.*;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.repository.FourPicOneWordPuzzleRepository;
import com.example.Vocabia.service.UserProgressService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/user/progress")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserProgressController {

    private final UserRepository userRepository;
    private final FourPicOneWordPuzzleRepository puzzleRepository;
    private final UserProgressService userProgressService;

    public UserProgressController(UserRepository userRepository, FourPicOneWordPuzzleRepository puzzleRepository, UserProgressService userProgressService) {
        this.userRepository = userRepository;
        this.puzzleRepository = puzzleRepository;
        this.userProgressService = userProgressService;
    }

    @GetMapping
    public UserProgressDTO getProgress(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProgress progress = userProgressService.getByUser(user)
                .orElseThrow(() -> new RuntimeException("Progress not found"));
        return UserProgressDTO.builder()
                .gameType("FOUR_PIC_ONE_WORD") // Default game type
                .exp(progress.getExp())
                .level(progress.getLevel())
                .expToNextLevel(100 - (progress.getExp() % 100)) // Simple calculation
                .completedLevels(0) // To be calculated if needed
                .totalLevels(0) // To be calculated if needed
                .currentStreak(0) // To be calculated if needed
                .bestStreak(0) // To be calculated if needed
                .hintsRemaining(3) // Default value
                // Achievement field removed
                .build();
    }

    // New endpoint: Complete a puzzle and add exp (e.g., from game)
    @PostMapping("/complete-puzzle")
    public UserProgressDTO completePuzzle(Principal principal, @RequestParam Long puzzleId, @RequestParam int exp) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        FourPicOneWordPuzzle puzzle = puzzleRepository.findById(puzzleId)
                .orElseThrow(() -> new RuntimeException("Puzzle not found"));
        UserProgress progress = userProgressService.addExpForPuzzle(user, puzzle, exp);
        return UserProgressDTO.builder()
                .gameType("FOUR_PIC_ONE_WORD") // Default game type
                .exp(progress.getExp())
                .level(progress.getLevel())
                .expToNextLevel(100 - (progress.getExp() % 100)) // Simple calculation
                .completedLevels(0) // To be calculated if needed
                .totalLevels(0) // To be calculated if needed
                .currentStreak(0) // To be calculated if needed
                .bestStreak(0) // To be calculated if needed
                .hintsRemaining(3) // Default value
                // Achievement field removed
                .build();
    }
}
