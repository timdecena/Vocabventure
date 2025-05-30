package com.example.Vocabia.adventure.service;

import com.example.Vocabia.adventure.entity.GameLevel;
import com.example.Vocabia.adventure.entity.LevelProgress;
import com.example.Vocabia.adventure.repository.GameLevelRepository;
import com.example.Vocabia.adventure.repository.LevelProgressRepository;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.exception.ResourceNotFoundException;
import com.example.Vocabia.service.UserService;
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
    private final UserService userService;

    @Autowired
    public LevelProgressService(
            LevelProgressRepository levelProgressRepository,
            GameLevelRepository gameLevelRepository,
            UserService userService) {
        this.levelProgressRepository = levelProgressRepository;
        this.gameLevelRepository = gameLevelRepository;
        this.userService = userService;
    }

    // ✅ New method for AdventureProgressController
    @Transactional
    public void saveLevelProgress(User user, com.example.Vocabia.adventure.dto.LevelCompletionRequest request) {
        GameLevel level = gameLevelRepository.findById(request.getLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Level not found with id: " + request.getLevelId()));

        LevelProgress progress = new LevelProgress();
        progress.setUser(user);
        progress.setLevelName(level.getTitle());
        progress.setCompleted(true);

        levelProgressRepository.save(progress);

        // Award XP based on level XP reward
        userService.addExperiencePoints(user.getId(), level.getXpReward());
    }

    public com.example.Vocabia.adventure.dto.LevelDataResponse getLevelData(Long levelId) {
        GameLevel level = gameLevelRepository.findById(levelId)
                .orElseThrow(() -> new ResourceNotFoundException("Level not found with id: " + levelId));

        com.example.Vocabia.adventure.dto.LevelDataResponse response = new com.example.Vocabia.adventure.dto.LevelDataResponse();
        response.setTitle(level.getTitle());
        response.setDescription("Defeat the enemy by answering correctly!"); // Static description
        response.setImageUrl("/images/level" + level.getLevelNumber() + ".png");

        return response;
    }

    // ✅ Your existing methods (optional: clean these later for user-based access)

    public List<LevelProgress> getUserProgress(User user) {
        return levelProgressRepository.findByUserOrderByCompletedAtDesc(user);
    }

    public List<LevelProgress> getUserProgressByCategory(User user, String category) {
        return levelProgressRepository.findByUserAndCategory(user, category);
    }

    public boolean hasUserCompletedLevel(User user, Long levelId) {
        GameLevel gameLevel = gameLevelRepository.findById(levelId)
                .orElseThrow(() -> new ResourceNotFoundException("Level not found with id: " + levelId));

        return levelProgressRepository.existsByUserAndGameLevel(user, gameLevel);
    }

    public Map<String, Object> getUserProgressSummary(User user) {
        List<String> allCategories = gameLevelRepository.findDistinctCategory();

        long totalCompleted = levelProgressRepository.countByUser(user);
        long totalLevels = gameLevelRepository.findByActiveTrue().size();

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

        LevelProgress latestProgress = levelProgressRepository.findTopByUserOrderByCompletedAtDesc(user).orElse(null);

        Map<String, Object> summary = new HashMap<>();
        summary.put("userId", user.getId());
        summary.put("totalCompleted", totalCompleted);
        summary.put("totalLevels", totalLevels);
        summary.put("completionPercentage", totalLevels > 0 ? (double) totalCompleted / totalLevels * 100 : 0);
        summary.put("completionByCategory", completionByCategory);

        if (latestProgress != null) {
            Map<String, Object> latest = new HashMap<>();
            latest.put("levelName", latestProgress.getLevelName());
            latest.put("completedAt", latestProgress.getCompletedAt());
            summary.put("latestCompleted", latest);
        }

        return summary;
    }

    public GameLevel getNextAvailableLevel(User user, String category) {
        List<GameLevel> levelsInCategory = gameLevelRepository.findByCategoryAndActiveTrueOrderByLevelNumber(category);

        if (levelsInCategory.isEmpty()) {
            throw new ResourceNotFoundException("No levels found in category: " + category);
        }

        List<LevelProgress> completedLevels = levelProgressRepository.findByUserAndCategory(user, category);
        List<String> completedLevelNames = completedLevels.stream()
                .map(LevelProgress::getLevelName)
                .collect(Collectors.toList());

        for (GameLevel level : levelsInCategory) {
            if (!completedLevelNames.contains(level.getTitle())) {
                return level;
            }
        }

        return levelsInCategory.get(levelsInCategory.size() - 1);
    }
}
