package com.example.Vocabia.service;

import com.example.Vocabia.dto.GameSubmissionRequest;
import com.example.Vocabia.dto.GameSubmissionResponse;
import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.GameProgress;
import com.example.Vocabia.entity.UserProgress;
import com.example.Vocabia.repository.FourPicOneWordPuzzleRepository;
import com.example.Vocabia.repository.GameProgressRepository;
import com.example.Vocabia.repository.UserProgressRepository;
import com.example.Vocabia.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class GameProgressionService {

    private final UserRepository userRepository;
    private final UserProgressRepository userProgressRepository;
    private final GameProgressRepository gameProgressRepository;
    private final FourPicOneWordPuzzleRepository puzzleRepository;

    public GameProgressionService(
            UserRepository userRepository,
            UserProgressRepository userProgressRepository,
            GameProgressRepository gameProgressRepository,
            FourPicOneWordPuzzleRepository puzzleRepository
    ) {
        this.userRepository = userRepository;
        this.userProgressRepository = userProgressRepository;
        this.gameProgressRepository = gameProgressRepository;
        this.puzzleRepository = puzzleRepository;
    }

    @Transactional
    public GameSubmissionResponse processGameSubmission(String email, GameSubmissionRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProgress userProgress = userProgressRepository.findByUser(user)
                .orElseGet(() -> userProgressRepository.save(new UserProgress(user)));
        FourPicOneWordPuzzle puzzle = puzzleRepository.findById(Long.parseLong(request.getPuzzleId()))
                .orElseThrow(() -> new RuntimeException("Puzzle not found"));

        GameProgress gameProgress = gameProgressRepository
                .findByUserAndPuzzle(user, puzzle)
                .orElseGet(() -> {
                    GameProgress p = new GameProgress();
                    p.setUser(user);
                    p.setPuzzle(puzzle);
                    p.setCategory(request.getCategory());
                    p.setLevel(request.getLevel());
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
            int hintPenalty = request.getHintsUsed() * 10;
            expEarned = Math.max(10, baseExp + timeBonus - hintPenalty);

            LocalDate today = LocalDate.now();
            LocalDate lastPlay = gameProgress.getLastPlayDate();
            if (lastPlay != null && lastPlay.plusDays(1).isEqual(today)) {
                newStreak = gameProgress.getStreak() + 1;
            } else {
                newStreak = 1;
            }
            gameProgress.setStreak(newStreak);
            gameProgress.setLastPlayDate(today);

            if (gameProgress.getFastestTime() == null || request.getTimeTaken() < gameProgress.getFastestTime()) {
                gameProgress.setFastestTime(request.getTimeTaken());
            }

            gameProgress.setCompleted(true);
            gameProgress.setCompletedAt(LocalDateTime.now());
            gameProgress.setExpEarned(expEarned);
            gameProgress.setHintsUsed(request.getHintsUsed());
            gameProgress.setTimeTaken(request.getTimeTaken());

            // Advanced tracking
            gameProgress.setLastCompletedAt(LocalDateTime.now());
            gameProgress.setPerfectCompletion(request.getHintsUsed() == 0 && timeBonus > 0);
            gameProgress.setStreakBonus(newStreak);
            gameProgress.setTimeBonus(timeBonus);
            gameProgress.setHintUsed(request.getHintsUsed() > 0);

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
        gameProgressRepository.save(gameProgress);

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

    public UserProgressDTO getUserProgress(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProgress progress = userProgressRepository.findByUser(user)
                .orElseGet(() -> userProgressRepository.save(new UserProgress(user)));

        long completedLevels = gameProgressRepository.countByUserAndCompleted(user, true);
        int currentStreak = gameProgressRepository.findByUser(user).stream()
                .mapToInt(GameProgress::getStreak)
                .max().orElse(0);

        return UserProgressDTO.builder()
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
