package com.example.Vocabia.service;

import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.GameProgress;
import com.example.Vocabia.entity.Level;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.UserProgress;
import com.example.Vocabia.repository.FourPicOneWordPuzzleRepository;
import com.example.Vocabia.repository.GameProgressRepository;
import com.example.Vocabia.repository.LevelRepository;
import com.example.Vocabia.repository.UserProgressRepository;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.dto.UserProgressDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FourPicOneWordProgressionService {

    private final UserRepository userRepository;
    private final UserProgressRepository userProgressRepository;
    private final GameProgressRepository gameProgressRepository;
    private final FourPicOneWordPuzzleRepository puzzleRepository;
    private final LevelRepository levelRepository;

    @Transactional
    public Map<String, Object> submitAnswer(
            String email, Long puzzleId, String answer, int timeTaken, int hintsUsed
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProgress userProgress = userProgressRepository.findByUser(user)
                .orElseGet(() -> userProgressRepository.save(new UserProgress(user)));

        FourPicOneWordPuzzle puzzle = puzzleRepository.findById(puzzleId)
                .orElseThrow(() -> new RuntimeException("Puzzle not found"));

        GameProgress progress = gameProgressRepository.findByUserAndPuzzle(user, puzzle)
                .orElseGet(() -> {
                    GameProgress gp = new GameProgress();
                    gp.setUser(user);
                    gp.setPuzzle(puzzle);
                    gp.setCategory(puzzle.getLevel().getCategory());
                    gp.setLevel(puzzle.getLevel().getName());
                    return gp;
                });

        boolean isCorrect = answer.trim().equalsIgnoreCase(puzzle.getAnswer());
        boolean wasCompleted = progress.isCompleted();
        int xp = 0;
        boolean unlockedNext = false;
        int newStreak = userProgress.getDailyStreak();

        // --- Award XP and progress only if newly completed ---
        if (isCorrect && !wasCompleted) {
            int baseXP = 50;
            int timeBonus = (timeTaken < 30) ? 20 : (timeTaken < 60 ? 10 : 0);
            int totalXP = Math.max(10, baseXP + timeBonus - (hintsUsed * 10));

            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            progress.setExpEarned(totalXP);
            progress.setTimeTaken(timeTaken);
            progress.setHintsUsed(hintsUsed);
            progress.setLastCompletedAt(LocalDateTime.now());
            progress.setHintUsed(hintsUsed > 0);
            progress.setStreakBonus(newStreak);

            if (progress.getFastestTime() == null || timeTaken < progress.getFastestTime())
                progress.setFastestTime(timeTaken);

            gameProgressRepository.save(progress);

            // Update user progress
            userProgress.setExp(userProgress.getExp() + totalXP);
            userProgress.setTotalExpEarned(userProgress.getTotalExpEarned() + totalXP);
            userProgress.setTotalPuzzlesSolved(userProgress.getTotalPuzzlesSolved() + 1);

            // Daily streak update
            LocalDate today = LocalDate.now();
            if (userProgress.getLastLoginDate() != null &&
                    userProgress.getLastLoginDate().plusDays(1).isEqual(today)) {
                userProgress.setDailyStreak(userProgress.getDailyStreak() + 1);
            } else if (userProgress.getLastLoginDate() == null ||
                    !userProgress.getLastLoginDate().isEqual(today)) {
                userProgress.setDailyStreak(1);
            }
            userProgress.setLastLoginDate(today);

            // Handle level up
            int nextLevelExp = userProgress.getExpForNextLevel();
            if (userProgress.getExp() >= nextLevelExp) {
                userProgress.setLevel(userProgress.getLevel() + 1);
                userProgress.setLastLevelUp(LocalDateTime.now());
            }

            userProgressRepository.save(userProgress);

            // Unlock logic (for FE/BE)
            int maxUnlocked = getUnlockedLevelNumber(user);
            int thisPuzzleLevel = puzzle.getLevelNumber();
            if (thisPuzzleLevel >= maxUnlocked) {
                unlockedNext = true;
            }

            xp = totalXP;
        }

        // --- FIX: Always show "correct" and unlock info if the answer is correct, even if already completed ---
        if (isCorrect) {
            int maxUnlocked = getUnlockedLevelNumber(user);
            int thisPuzzleLevel = puzzle.getLevelNumber();
            if (thisPuzzleLevel >= maxUnlocked) {
                unlockedNext = true;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("correct", isCorrect);
        result.put("xpEarned", xp);
        result.put("level", userProgress.getLevel());
        result.put("exp", userProgress.getExp());
        result.put("expToNextLevel", userProgress.getExpForNextLevel() - userProgress.getExp());
        result.put("unlockedNext", unlockedNext);
        result.put("streak", userProgress.getDailyStreak());
        return result;
    }

    public int getUnlockedLevelNumber(User user) {
        List<GameProgress> completions = gameProgressRepository.findByUserAndCompleted(user, true);
        return completions.stream()
                .mapToInt(gp -> gp.getPuzzle().getLevelNumber())
                .max().orElse(1);
    }

    public int getUnlockedLevel(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return getUnlockedLevelNumber(user);
    }

    public UserProgressDTO getUserProgress(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProgress userProgress = userProgressRepository.findByUser(user)
                .orElseGet(() -> userProgressRepository.save(new UserProgress(user)));

        List<GameProgress> completions = gameProgressRepository.findByUserAndCompleted(user, true);
        long totalLevels = levelRepository.count();

        return UserProgressDTO.builder()
                .exp(userProgress.getExp())
                .level(userProgress.getLevel())
                .expToNextLevel(userProgress.getExpForNextLevel() - userProgress.getExp())
                .completedLevels((int) completions.size())
                .totalLevels((int) totalLevels)
                .currentStreak(userProgress.getDailyStreak())
                .bestStreak(userProgress.getDailyStreak())
                .hintsRemaining(0)
                .gameType("FOUR_PIC_ONE_WORD")
                .build();
    }
}
