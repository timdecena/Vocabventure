package com.example.Vocabia.service;

import com.example.Vocabia.entity.*;
import com.example.Vocabia.repository.UserProgressRepository;
import com.example.Vocabia.repository.UserGameProgressRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserProgressService {

    private final UserProgressRepository userProgressRepository;
    private final UserGameProgressRepository userGameProgressRepository;

    public UserProgressService(UserProgressRepository progressRepo, UserGameProgressRepository gameProgressRepo) {
        this.userProgressRepository = progressRepo;
        this.userGameProgressRepository = gameProgressRepo;
    }

    public UserProgress createProgressForUser(User user) {
        UserProgress progress = new UserProgress(user);
        return userProgressRepository.save(progress);
    }

    public Optional<UserProgress> getByUser(User user) {
        return userProgressRepository.findByUser(user);
    }

    // Main logic: only add exp if not yet completed
    public UserProgress addExpForPuzzle(User user, FourPicOneWordPuzzle puzzle, int expToAdd) {
        // Check if already completed
        Optional<UserGameProgress> progressOpt = userGameProgressRepository.findByUserAndPuzzleAndGameType(
                user, puzzle, "FOUR_PIC_ONE_WORD"
        );
        if (progressOpt.isPresent() && progressOpt.get().isCompleted()) {
            throw new RuntimeException("Puzzle already completed by user, no EXP awarded again.");
        }

        // Mark as completed
        UserGameProgress progress = progressOpt.orElseGet(UserGameProgress::new);
        progress.setUser(user);
        progress.setGameType("FOUR_PIC_ONE_WORD");
        progress.setPuzzle(puzzle);
        progress.setLevelEntity(puzzle.getLevel());
        // Set the level string from the Level entity
        if (puzzle.getLevel() != null) {
            progress.setLevel(puzzle.getLevel().getName());
        }
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setExpEarned(expToAdd);
        userGameProgressRepository.save(progress);

        // Add exp to user's overall progress
        UserProgress userProgress = userProgressRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("User progress not found"));
        userProgress.setExp(userProgress.getExp() + expToAdd);
        // Example: level up for every 100 exp
        while (userProgress.getExp() >= 100) {
            userProgress.setExp(userProgress.getExp() - 100);
            userProgress.setLevel(userProgress.getLevel() + 1);
        }
        return userProgressRepository.save(userProgress);
    }
}
