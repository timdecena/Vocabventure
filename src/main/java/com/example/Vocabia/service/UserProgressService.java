package com.example.Vocabia.service;

import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.GameProgress;
import com.example.Vocabia.entity.UserProgress;
import com.example.Vocabia.exception.ResourceNotFoundException;
import com.example.Vocabia.repository.UserProgressRepository;
import com.example.Vocabia.repository.GameProgressRepository;
import com.example.Vocabia.repository.FourPicOneWordPuzzleRepository;
import com.example.Vocabia.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Service for managing user progress and game-related operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProgressService {

    // Game constants
    private static final int MAX_LEVEL = 100;
    private static final int BASE_XP = 50;
    private static final int MAX_DAILY_STREAK_DAYS = 30; // Cap streak bonus at 30 days
    private static final int DAILY_STREAK_BONUS_PERCENT = 50; // Max 50% bonus XP for daily streak
    private static final int TIME_BONUS_PERCENT = 30; // Max 30% bonus for fast completion
    private static final int HINT_PENALTY = 10; // XP penalty per hint used
    private static final int DAILY_LOGIN_BONUS = 25; // Bonus XP for daily login
    
    private final UserProgressRepository userProgressRepository;
    private final GameProgressRepository userGameProgressRepository;
    private final FourPicOneWordPuzzleRepository puzzleRepository;
    private final UserRepository userRepository;
    
    // Achievement service would be autowired here when implemented
    // private final AchievementService achievementService;

    /**
     * Creates a new progress record for a user.
     * 
     * @param user the user to create progress for
     * @return the created UserProgress
     * @throws IllegalArgumentException if user is null
     */
    /**
     * Creates a new progress record for a user with default values
     */
    @Transactional
    public UserProgress createProgressForUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        log.info("Creating progress for user: {}", user.getEmail());
        
        UserProgress progress = new UserProgress(user);
        progress.setExp(0);
        progress.setLevel(1);
        progress.setDailyStreak(1);
        progress.setLastLoginDate(LocalDate.now());
        progress.setTotalExpEarned(0);
        progress.setTotalPuzzlesSolved(0);
        
        return userProgressRepository.save(progress);
    }

    /**
     * Retrieves progress for a specific user.
     * 
     * @param user the user to find progress for
     * @return Optional containing the UserProgress if found
     */
    public Optional<UserProgress> getByUser(User user) {
        if (user == null) {
            return Optional.empty();
        }
        return userProgressRepository.findByUser(user);
    }

    /**
     * Adds experience points for completing a puzzle if not already completed.
     * 
     * @param user the user completing the puzzle
     */
    @Transactional
    public int addExpForPuzzle(User user, FourPicOneWordPuzzle puzzle, int timeTaken, int hintsUsed) {
        UserProgress progress = userProgressRepository.findByUser(user)
                .orElseGet(() -> createProgressForUser(user));

        log.debug("Adding exp for user {} on puzzle {}", user.getEmail(), puzzle.getId());
        
        // Check if already completed
        GameProgress gameProgress = userGameProgressRepository.findByUserAndPuzzle(user, puzzle)
            .orElseGet(() -> {
                GameProgress newProgress = new GameProgress();
                newProgress.setUser(user);
                newProgress.setPuzzle(puzzle);
                newProgress.setCompleted(false);
                return newProgress;
            });
            
        if (gameProgress.isCompleted()) {
            log.debug("Puzzle already completed by user, no EXP awarded again.");
            return 0;
        }

        // Calculate experience with bonuses and penalties
        int baseXp = calculateBaseXp(puzzle);
        int timeBonus = calculateTimeBonus(timeTaken, baseXp);
        int dailyStreakBonus = calculateDailyStreakBonus(progress);
        int hintPenalty = hintsUsed * HINT_PENALTY;
        int totalXp = Math.max(10, baseXp + timeBonus + dailyStreakBonus - hintPenalty);
        boolean perfectCompletion = hintsUsed == 0 && timeBonus > 0;
        
        // Update user progress
        progress.setExp(progress.getExp() + totalXp);
        progress.setTotalExpEarned(progress.getTotalExpEarned() + totalXp);
        progress.setTotalPuzzlesSolved(progress.getTotalPuzzlesSolved() + 1);
        
        // Update game progress with detailed stats
        gameProgress.setCompleted(true);
        gameProgress.setCompletedAt(LocalDateTime.now());
        gameProgress.setLastCompletedAt(LocalDateTime.now());
        gameProgress.setExpEarned(totalXp);
        gameProgress.setHintsUsed(hintsUsed);
        gameProgress.setTimeTaken(timeTaken);
        gameProgress.setPerfectCompletion(perfectCompletion);
        gameProgress.setStreakBonus(dailyStreakBonus);
        gameProgress.setTimeBonus(timeBonus);
        
        // Update fastest time if this is the first completion or faster than previous
        if (gameProgress.getFastestTime() == null || timeTaken < gameProgress.getFastestTime()) {
            gameProgress.setFastestTime(timeTaken);
        }
        
        // Update hint used flag
        if (hintsUsed > 0) {
            gameProgress.setHintUsed(true);
        }
        
        // Update daily streak
        updateDailyStreak(progress);
        
        // Update level if needed
        checkAndUpdateLevel(progress);
        
        // Save progress
        userProgressRepository.save(progress);
        userGameProgressRepository.save(gameProgress);
        
        log.info("Awarded {} XP to user {} for puzzle {} (base: {}, time bonus: {}, streak bonus: {}, hint penalty: {})", 
                totalXp, user.getEmail(), puzzle.getId(), baseXp, timeBonus, dailyStreakBonus, hintPenalty);
                
        return totalXp;
    }

    /**
     * Checks if the user should level up and updates their level if needed
     * @return true if the user leveled up, false otherwise
     */
    private boolean checkAndUpdateLevel(UserProgress progress) {
        if (progress.getLevel() >= MAX_LEVEL) {
            return false; // Already at max level
        }
        
        int currentLevel = progress.getLevel();
        int newLevel = currentLevel;
        
        // Find the highest level the user qualifies for
        while (newLevel < MAX_LEVEL && progress.getExp() >= progress.getExpForNextLevel()) {
            newLevel++;
        }
        
        if (newLevel > currentLevel) {
            progress.setLevel(newLevel);
            progress.setLastLevelUp(LocalDateTime.now());
            log.info("User {} leveled up to level {}!", progress.getUser().getEmail(), newLevel);
            
            // Award level-up rewards if implemented
            // awardLevelUpRewards(progress, currentLevel, newLevel);
            
            // Check for achievements
            // achievementService.checkForAchievements(progress.getUser(), "LEVEL_UP");
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Awards daily login bonus to the user
     * @return The amount of XP awarded
     */
    @Transactional
    public int awardDailyLoginBonus(User user) {
        UserProgress progress = userProgressRepository.findByUser(user)
                .orElseGet(() -> createProgressForUser(user));
                
        // Check if already received bonus today
        if (progress.getLastLoginDate().isEqual(LocalDate.now())) {
            return 0; // Already received bonus today
        }
        
        // Update streak
        updateDailyStreak(progress);
        
        // Award bonus XP based on streak
        int bonusXp = DAILY_LOGIN_BONUS + (progress.getDailyStreak() * 2);
        progress.setExp(progress.getExp() + bonusXp);
        progress.setTotalExpEarned(progress.getTotalExpEarned() + bonusXp);
        
        // Check for level up
        checkAndUpdateLevel(progress);
        
        userProgressRepository.save(progress);
        
        log.info("Awarded daily login bonus of {} XP to user {}", bonusXp, user.getEmail());
        return bonusXp;
    }

    /**
     * Calculates the base XP for completing a puzzle based on its difficulty
     */
    private int calculateBaseXp(FourPicOneWordPuzzle puzzle) {
        // Base XP can be modified by puzzle difficulty in the future
        // For now, we'll add some randomness to make it more interesting (80-120% of base)
        double randomFactor = 0.8 + (0.4 * ThreadLocalRandom.current().nextDouble());
        return (int)(BASE_XP * randomFactor);
    }
    
    /**
     * Calculates time bonus as a percentage of base XP
     */
    private int calculateTimeBonus(int timeTaken, int baseXp) {
        // Max time is 5 minutes (300 seconds)
        double timeFactor = Math.max(0, 1 - (timeTaken / 300.0));
        return (int)(timeFactor * (baseXp * (TIME_BONUS_PERCENT / 100.0)));
    }
    
    /**
     * Calculates daily streak bonus as a percentage of base XP
     */
    private int calculateDailyStreakBonus(UserProgress progress) {
        // Cap the streak bonus at MAX_DAILY_STREAK_DAYS
        int streakBonus = Math.min(progress.getDailyStreak(), MAX_DAILY_STREAK_DAYS);
        // Calculate bonus as a percentage of base XP
        return (int)(BASE_XP * (streakBonus * (DAILY_STREAK_BONUS_PERCENT / 100.0) / MAX_DAILY_STREAK_DAYS));
    }
    
    /**
     * Updates the user's daily streak
     */
    private void updateDailyStreak(UserProgress progress) {
        LocalDate today = LocalDate.now();
        LocalDate lastLogin = progress.getLastLoginDate();
        
        if (lastLogin == null) {
            progress.setDailyStreak(1);
        } else if (lastLogin.isEqual(today.minusDays(1))) {
            // Consecutive day
            progress.setDailyStreak(progress.getDailyStreak() + 1);
        } else if (lastLogin.isBefore(today.minusDays(1))) {
            // Streak broken
            progress.setDailyStreak(1);
        }
        // else: already logged in today, streak remains the same
        
        progress.setLastLoginDate(today);
    }

    /**
     * Gets the user's progress DTO containing comprehensive progress information.
     * 
     * @param email the user's email
     * @return UserProgressDTO with progress details
     * @throws ResourceNotFoundException if user progress is not found
     */
    public UserProgressDTO getUserProgress(String email) {
        log.debug("Fetching user progress for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Get or create user progress
        UserProgress progress = userProgressRepository.findByUser(user)
                .orElseGet(() -> createProgressForUser(user));

        // Count completed puzzles for this user
        long completedPuzzles = userGameProgressRepository.countByUserAndCompleted(user, true);
        
        // Count total available puzzles
        long totalPuzzles = puzzleRepository.count();
        
        // Calculate experience and level
        int exp = progress.getExp();
        int level = progress.getLevel();
        int expToNextLevel = progress.getExpForNextLevel() - exp;
        
        return UserProgressDTO.builder()
                .exp(exp)
                .level(level)
                .expToNextLevel(expToNextLevel)
                .completedLevels((int) completedPuzzles)
                .totalLevels((int) totalPuzzles)
                .currentStreak(progress.getDailyStreak())
                .bestStreak(progress.getDailyStreak())
                .hintsRemaining(0) // Not currently tracking hints
                .build();
    }
}
