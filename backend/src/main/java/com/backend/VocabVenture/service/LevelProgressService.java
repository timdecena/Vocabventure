package com.backend.VocabVenture.service;

import com.backend.VocabVenture.model.GameLevel;
import com.backend.VocabVenture.model.LevelProgress;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.GameLevelRepository;
import com.backend.VocabVenture.repository.LevelProgressRepository;
import com.backend.VocabVenture.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LevelProgressService {

    private final LevelProgressRepository levelProgressRepository;
    private final GameLevelRepository gameLevelRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Autowired
    public LevelProgressService(
            LevelProgressRepository levelProgressRepository,
            GameLevelRepository gameLevelRepository,
            UserRepository userRepository,
            UserService userService) {
        this.levelProgressRepository = levelProgressRepository;
        this.gameLevelRepository = gameLevelRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    /**
     * Record a completed level for a user and award XP
     */
    @Transactional
    public Map<String, Object> recordLevelCompletion(Long userId, Long levelId, Integer attempts, Integer timeTaken, Integer hintsUsed) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.backend.VocabVenture.exception.ResourceNotFoundException("User not found with id: " + userId));
        
        GameLevel gameLevel = gameLevelRepository.findById(levelId)
                .orElseThrow(() -> new com.backend.VocabVenture.exception.ResourceNotFoundException("Level not found with id: " + levelId));
        
        // Check if the user has already completed this level
        if (levelProgressRepository.existsByUserAndGameLevel(user, gameLevel)) {
            throw new IllegalStateException("User has already completed this level");
        }
        
        // Create and save progress record
        LevelProgress progress = new LevelProgress();
        progress.setUser(user);
        progress.setGameLevel(gameLevel);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setAttempts(attempts != null ? attempts : 1);
        progress.setTimeTaken(timeTaken);
        progress.setHintsUsed(hintsUsed != null ? hintsUsed : 0);
        
        LevelProgress savedProgress = levelProgressRepository.save(progress);
        
        // Calculate XP to award based on level difficulty, attempts, and hints used
        int baseXp = 10; // Base XP for completing a level
        
        // Adjust XP based on difficulty
        switch (gameLevel.getDifficulty()) {
            case EASY:
                baseXp = 5;
                break;
            case MEDIUM:
                baseXp = 10;
                break;
            case HARD:
                baseXp = 15;
                break;
        }
        
        // Reduce XP for multiple attempts (but ensure at least 50% of base XP)
        int attemptPenalty = Math.min((attempts != null ? attempts : 1) - 1, baseXp / 2);
        
        // Reduce XP for hints used (but ensure at least 50% of base XP)
        int hintPenalty = Math.min((hintsUsed != null ? hintsUsed : 0), baseXp / 2);
        
        // Calculate final XP (minimum 1 XP)
        int awardedXp = Math.max(baseXp - attemptPenalty - hintPenalty, 1);
        
        // Award XP to the user
        Map<String, Object> xpResult = userService.addExperiencePoints(userId, awardedXp);
        
        // Combine progress and XP information in the response
        Map<String, Object> result = new HashMap<>();
        result.put("progress", savedProgress);
        result.put("xpAwarded", awardedXp);
        result.put("xpInfo", xpResult);
        
        return result;
    }

    /**
     * Get all completed levels for a user
     */
    public List<LevelProgress> getUserProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.backend.VocabVenture.exception.ResourceNotFoundException("User not found with id: " + userId));
        
        return levelProgressRepository.findByUserOrderByCompletedAtDesc(user);
    }

    /**
     * Get user progress for a specific category
     */
    public List<LevelProgress> getUserProgressByCategory(Long userId, String category) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.backend.VocabVenture.exception.ResourceNotFoundException("User not found with id: " + userId));
        
        return levelProgressRepository.findByUserAndCategory(user, category);
    }

    /**
     * Check if a user has completed a specific level
     */
    public boolean hasUserCompletedLevel(Long userId, Long levelId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.backend.VocabVenture.exception.ResourceNotFoundException("User not found with id: " + userId));
        
        GameLevel gameLevel = gameLevelRepository.findById(levelId)
                .orElseThrow(() -> new com.backend.VocabVenture.exception.ResourceNotFoundException("Level not found with id: " + levelId));
        
        return levelProgressRepository.existsByUserAndGameLevel(user, gameLevel);
    }

    /**
     * Get user progress summary
     */
    public Map<String, Object> getUserProgressSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.backend.VocabVenture.exception.ResourceNotFoundException("User not found with id: " + userId));
        
        // Get all categories
        List<String> allCategories = gameLevelRepository.findDistinctCategory();
        
        // Get total completed levels
        long totalCompleted = levelProgressRepository.countByUser(user);
        
        // Get total levels available
        long totalLevels = gameLevelRepository.findByActiveTrue().size();
        
        // Get completion by category
        Map<String, Object> completionByCategory = new HashMap<>();
        for (String category : allCategories) {
            long completedInCategory = levelProgressRepository.countByUserAndCategory(user, category);
            long totalInCategory = gameLevelRepository.findByCategoryAndActiveTrueOrderByLevelNumber(category).size();
            Map<String, Object> categoryStats = new HashMap<>();
            categoryStats.put("completed", completedInCategory);
            categoryStats.put("total", totalInCategory);
            categoryStats.put("percentage", totalInCategory > 0 ? (double) completedInCategory / totalInCategory * 100 : 0);
            completionByCategory.put(category, categoryStats);
        }
        
        // Get latest completed level
        LevelProgress latestProgress = levelProgressRepository.findTopByUserOrderByCompletedAtDesc(user).orElse(null);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("userId", userId);
        summary.put("totalCompleted", totalCompleted);
        summary.put("totalLevels", totalLevels);
        summary.put("completionPercentage", totalLevels > 0 ? (double) totalCompleted / totalLevels * 100 : 0);
        summary.put("completionByCategory", completionByCategory);
        
        if (latestProgress != null) {
            Map<String, Object> latest = new HashMap<>();
            latest.put("category", latestProgress.getGameLevel().getCategory());
            latest.put("levelNumber", latestProgress.getGameLevel().getLevelNumber());
            latest.put("completedAt", latestProgress.getCompletedAt());
            summary.put("latestCompleted", latest);
        }
        
        return summary;
    }

    /**
     * Get next available level for a user in a category
     */
    public GameLevel getNextAvailableLevel(Long userId, String category) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.backend.VocabVenture.exception.ResourceNotFoundException("User not found with id: " + userId));
        
        // Get all levels in the category
        List<GameLevel> levelsInCategory = gameLevelRepository.findByCategoryAndActiveTrueOrderByLevelNumber(category);
        
        if (levelsInCategory.isEmpty()) {
            throw new com.backend.VocabVenture.exception.ResourceNotFoundException("No levels found in category: " + category);
        }
        
        // Get all completed levels in this category
        List<LevelProgress> completedLevels = levelProgressRepository.findByUserAndCategory(user, category);
        List<Long> completedLevelIds = completedLevels.stream()
                .map(progress -> progress.getGameLevel().getId())
                .collect(Collectors.toList());
        
        // Find the first level that hasn't been completed
        for (GameLevel level : levelsInCategory) {
            if (!completedLevelIds.contains(level.getId())) {
                return level;
            }
        }
        
        // If all levels are completed, return the last one
        return levelsInCategory.get(levelsInCategory.size() - 1);
    }
}
