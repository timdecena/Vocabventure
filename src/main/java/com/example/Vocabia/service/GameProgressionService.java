package com.example.Vocabia.service;

import com.example.Vocabia.dto.GameSubmissionRequest;
import com.example.Vocabia.dto.GameSubmissionResponse;
import com.example.Vocabia.dto.LevelProgressDTO;
import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.UserGameProgress;
import com.example.Vocabia.entity.UserProgress;
import com.example.Vocabia.repository.FourPicOneWordPuzzleRepository;
import com.example.Vocabia.repository.UserGameProgressRepository;
import com.example.Vocabia.repository.UserProgressRepository;
import com.example.Vocabia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class GameProgressionService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserProgressRepository userProgressRepository;
    @Autowired
    private UserGameProgressRepository userGameProgressRepository;
    @Autowired
    private FourPicOneWordPuzzleRepository puzzleRepository;

    @Transactional
    public GameSubmissionResponse processGameSubmission(String email, GameSubmissionRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProgress userProgress = userProgressRepository.findByUser(user)
                .orElseGet(() -> userProgressRepository.save(new UserProgress(user)));
        FourPicOneWordPuzzle puzzle = puzzleRepository.findById(Long.parseLong(request.getPuzzleId()))
                .orElseThrow(() -> new RuntimeException("Puzzle not found"));

        // Find or create UserGameProgress for this puzzle and user
        UserGameProgress gameProgress = userGameProgressRepository
                .findByUserAndPuzzleAndGameType(user, puzzle, request.getGameType())
                .orElseGet(() -> {
                    UserGameProgress p = new UserGameProgress();
                    p.setUser(user);
                    p.setPuzzle(puzzle);
                    p.setGameType(request.getGameType());
                    p.setCategory(request.getCategory());
                    p.setLevel(request.getLevel());
                    p.setStreak(0);
                    return p;
                });

        boolean alreadyCompleted = gameProgress.isCompleted();
        boolean isCorrect = request.getAnswer().equalsIgnoreCase(puzzle.getAnswer());
        int expEarned = 0;
        boolean leveledUp = false;
        int newStreak = gameProgress.getStreak();

        if (isCorrect && !alreadyCompleted) {
            int baseExp = 50;
            int timeBonus = calculateTimeBonus(request.getTimeTaken());
            int hintPenalty = request.getHintsUsed() * 10; // -10 XP per hint
            expEarned = Math.max(10, baseExp + timeBonus - hintPenalty);

            // Streak logic
            LocalDate today = LocalDate.now();
            LocalDate lastPlay = gameProgress.getLastPlayDate();
            if (lastPlay != null && lastPlay.plusDays(1).isEqual(today)) {
                newStreak = gameProgress.getStreak() + 1;
            } else {
                newStreak = 1;
            }
            gameProgress.setStreak(newStreak);
            gameProgress.setLastPlayDate(today);

            // Fastest time
            if (gameProgress.getFastestTime() == null || request.getTimeTaken() < gameProgress.getFastestTime()) {
                gameProgress.setFastestTime(request.getTimeTaken());
            }

            gameProgress.setCompleted(true);
            gameProgress.setLastCompletedAt(LocalDateTime.now());
            gameProgress.setExpEarned(expEarned);
            gameProgress.setHintUsed(request.getHintsUsed() > 0);

            // Update user's XP & level
            int prevExp = userProgress.getExp();
            userProgress.setExp(prevExp + expEarned);
            int prevLevel = userProgress.getLevel();
            int newLevel = calculateLevel(userProgress.getExp());
            if (newLevel > prevLevel) {
                userProgress.setLevel(newLevel);
                leveledUp = true;
            }
            userProgressRepository.save(userProgress);
        } else if (!isCorrect) {
            newStreak = 0;
            gameProgress.setStreak(newStreak);
        }
        userGameProgressRepository.save(gameProgress);

        int expToNextLevel = 100 - (userProgress.getExp() % 100);

        return GameSubmissionResponse.builder()
                .correct(isCorrect)
                .expEarned(expEarned)
                .totalExp(userProgress.getExp())
                .level(userProgress.getLevel())
                .expToNextLevel(expToNextLevel)
                .streak(newStreak)
                .hintsRemaining(3)
                .levelUp(leveledUp)
                .build();
    }

    public UserProgressDTO getUserProgress(String email, String gameType) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProgress progress = userProgressRepository.findByUser(user)
                .orElseGet(() -> userProgressRepository.save(new UserProgress(user)));

        long completedLevels = userGameProgressRepository.countByUserAndGameTypeAndCompleted(user, gameType, true);
        int currentStreak = userGameProgressRepository.findByUserAndGameType(user, gameType).stream()
                .mapToInt(UserGameProgress::getStreak).max().orElse(0);

        return UserProgressDTO.builder()
                .gameType(gameType)
                .exp(progress.getExp())
                .level(progress.getLevel())
                .expToNextLevel(100 - (progress.getExp() % 100))
                .completedLevels((int) completedLevels)
                .totalLevels((int) puzzleRepository.count())
                .currentStreak(currentStreak)
                .bestStreak(currentStreak)
                .hintsRemaining(3)
                .build();
    }

    // ... other methods unchanged

    private int calculateTimeBonus(int timeTaken) {
        if (timeTaken < 10) return 30;
        if (timeTaken < 20) return 20;
        if (timeTaken < 30) return 10;
        return 0;
    }

    private int calculateLevel(int totalExp) {
        return 1 + (totalExp / 100);
    }
}