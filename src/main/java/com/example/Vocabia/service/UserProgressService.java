package com.example.Vocabia.service;

import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.UserProgress;
import com.example.Vocabia.repository.UserProgressRepository;
import com.example.Vocabia.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserProgressService {

    private final UserProgressRepository repo;
    private final UserRepository userRepository;

    // XP curve
   // private int xpRequiredForNextLevel(int level) {
  //      return 50 * level * (level + 1) / 2;
   // }

    public UserProgress getOrCreateProgress(User user, String category) {
        return repo.findByUserAndCategory(user, category).orElseGet(() -> {
            LocalDateTime now = LocalDateTime.now();
            UserProgress np = UserProgress.builder()
                    .user(user)
                    .category(category)
                    .currentLevel(1)
                    .level(1)
                    .livesLeft(3)
                    .createdAt(now)
                    .lastActive(now)
                    .lastPlayedCategory(category)
                    .lastPlayedLevel(1)
                    .levelCompletionCounts("") // Initialize with empty string
                    .build();
            return repo.save(np);
        });
    }

    /**
     * Complete a level in Four Pics One Word with integrated gold reward system
     * Gold rewards: +10 for first completion, +5 for second completion, 0 for third+ completions
     */
    @Transactional
    public UserProgressDTO completeLevel(User user, String category, int completedLevel, boolean usedHint) {
        System.out.println("🔄 UserProgressService.completeLevel called");
        System.out.println("   User: " + user.getEmail() + " (ID: " + user.getId() + ")");
        System.out.println("   Category: " + category);
        System.out.println("   Completed level: " + completedLevel);
        System.out.println("   Used hint: " + usedHint);

        // Enhanced input validation
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category cannot be null or empty");
        }
        if (completedLevel <= 0) {
            throw new IllegalArgumentException("Completed level must be positive");
        }

        try {
            UserProgress p = getOrCreateProgress(user, category);
            if (p == null) {
                throw new RuntimeException("Failed to create or retrieve user progress");
            }
            
            System.out.println("✅ Progress record retrieved/created:");
            System.out.println("   - ID: " + p.getId());
            System.out.println("   - Current level: " + p.getCurrentLevel());
            System.out.println("   - Highest level: " + p.getLevel());
            System.out.println("   - Puzzles solved: " + p.getPuzzlesSolved());
            System.out.println("   - Correct answers: " + p.getCorrectAnswers());

            // Get current completion count for this specific level with null safety
            int completionCount = 0;
            try {
                completionCount = getLevelCompletionCount(p, completedLevel);
            } catch (Exception e) {
                System.err.println("⚠️ Error getting completion count, defaulting to 0: " + e.getMessage());
                completionCount = 0;
            }
            
            int newCompletionCount = completionCount + 1;
            System.out.println("📊 Level " + completedLevel + " completion count: " + completionCount + " → " + newCompletionCount);

            // Calculate gold reward based on completion count
            int goldReward = calculateGoldReward(newCompletionCount);
            System.out.println("💰 Gold reward for completion #" + newCompletionCount + ": " + goldReward);

            // Update level completion counts with error handling
            try {
                updateLevelCompletionCount(p, completedLevel, newCompletionCount);
            } catch (Exception e) {
                System.err.println("⚠️ Error updating completion count: " + e.getMessage());
                // Continue without failing the entire operation
            }

            // Update progress statistics with null safety
            p.setPuzzlesSolved(Math.max(0, p.getPuzzlesSolved()) + 1);
            p.setCorrectAnswers(Math.max(0, p.getCorrectAnswers()) + 1);
            p.setTotalAttempts(Math.max(0, p.getTotalAttempts()) + 1);
            p.setStreakCount(Math.max(0, p.getStreakCount()) + 1);
            if (p.getStreakCount() > p.getMaxStreak()) {
                p.setMaxStreak(p.getStreakCount());
            }

            // Advance to next level based on the reported completed level without regressing
            int nextUnlocked = Math.max(p.getCurrentLevel(), completedLevel + 1);
            p.setCurrentLevel(nextUnlocked);
            // Track highest completed level
            p.setLevel(Math.max(p.getLevel(), completedLevel));
            p.setLastActive(LocalDateTime.now());
            p.setLastPlayedLevel(completedLevel);
            p.setLastPlayedCategory(category);

            // Track gold earned from this specific level completion
            p.setLevelGoldEarned(Math.max(0, p.getLevelGoldEarned()) + goldReward);

            // If hint was used, increment hint counter
            if (usedHint) {
                p.setHintsUsed(Math.max(0, p.getHintsUsed()) + 1);
                System.out.println("📝 Hint usage recorded");
            }

            System.out.println("💾 Saving progress to database...");
            
            // Validate progress before saving
            if (p.getPuzzlesSolved() < 0 || p.getCorrectAnswers() < 0 || p.getCurrentLevel() < 1) {
                throw new IllegalStateException("Invalid progress state before saving");
            }
            
            UserProgress saved = repo.save(p);
            
            // Verify the save was successful
            if (saved == null || saved.getId() == null) {
                throw new RuntimeException("Failed to save progress to database");
            }
            
            System.out.println("✅ Progress saved to database with ID: " + saved.getId());

            // Award gold to user's main gold balance (shared across all games)
            if (goldReward > 0) {
                int oldGold = user.getGold();
                user.setGold(Math.max(0, user.getGold()) + goldReward);
                User savedUser = userRepository.save(user);
                
                if (savedUser.getGold() != oldGold + goldReward) {
                    System.err.println("⚠️ Gold update may have failed. Expected: " + (oldGold + goldReward) + ", Actual: " + savedUser.getGold());
                }
                
                System.out.println("💰 Awarded " + goldReward + " gold to user. Old balance: " + oldGold + ", New balance: " + savedUser.getGold());
            }

            System.out.println("✅ Progress saved successfully:");
            System.out.println("   - New current level: " + saved.getCurrentLevel());
            System.out.println("   - New puzzles solved: " + saved.getPuzzlesSolved());
            System.out.println("   - New correct answers: " + saved.getCorrectAnswers());

            return toDto(saved);

        } catch (IllegalArgumentException e) {
            System.err.println("❌ Validation error in completeLevel: " + e.getMessage());
            throw e; // Re-throw validation errors
        } catch (Exception e) {
            System.err.println("❌ Unexpected error in completeLevel: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to complete level due to server error: " + e.getMessage(), e);
        }
    }

    public boolean isLevelUnlocked(User user, String category, int level) {
        UserProgress p = getOrCreateProgress(user, category);
        return level == 1 || level <= p.getCurrentLevel();
    }

    public UserProgressDTO wrongAttempt(User user, String category) {
        UserProgress p = getOrCreateProgress(user, category);
        p.setWrongAnswers(p.getWrongAnswers() + 1);
        p.setTotalAttempts(p.getTotalAttempts() + 1);
        p.setStreakCount(0);
        p.setLivesLeft(Math.max(p.getLivesLeft() - 1, 0));
        p.setLastActive(LocalDateTime.now());

        repo.save(p);
        return toDto(p);
    }

    /**
     * Use a hint in Four Pics One Word - costs 5 gold (same as other games)
     * Integrates with the shared gold system
     */
    @Transactional
    public UserProgressDTO useHint(User user, String category, int level) {
        System.out.println("💡 User " + user.getEmail() + " requesting hint for " + category + " level " + level);

        // Check if user has enough gold (25 gold per hint)
        final int HINT_COST = 25;
        if (user.getGold() < HINT_COST) {
            throw new IllegalArgumentException("Insufficient gold for hint. Required: " + HINT_COST + ", Available: " + user.getGold());
        }

        // Deduct gold from user's balance
        user.setGold(user.getGold() - HINT_COST);
        userRepository.save(user);
        System.out.println("💸 Deducted " + HINT_COST + " gold for hint. New balance: " + user.getGold());

        // Update progress tracking
        UserProgress p = getOrCreateProgress(user, category);
        p.setHintsUsed(p.getHintsUsed() + 1);
        p.setLastActive(LocalDateTime.now());
        repo.save(p);

        System.out.println("✅ Hint used successfully. Total hints used: " + p.getHintsUsed());

        return toDto(p);
    }

    public List<UserProgressDTO> getLeaderboard(String category) {
        return repo.findTop10ByCategoryOrderByPuzzlesSolvedDesc(category)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<UserProgressDTO> getGlobalLeaderboard() {
        return repo.findTop10Global()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserProgressDTO getLastPlayed(User user) {
        return repo.findByUser(user).stream()
                .filter(p -> p.getLastActive() != null)
                .max((a, b) -> a.getLastActive().compareTo(b.getLastActive()))
                .map(this::toDto)
                .orElse(null);
    }

    public List<UserProgressDTO> getAllUserProgress(User user) {
        return repo.findByUser(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private UserProgressDTO toDto(UserProgress e) {
        return UserProgressDTO.builder()
                .id(e.getId())
                .category(e.getCategory())
                .currentLevel(e.getCurrentLevel())
                .level(e.getLevel())
                .puzzlesSolved(e.getPuzzlesSolved())
                .hintsUsed(e.getHintsUsed())
                .streakCount(e.getStreakCount())
                .maxStreak(e.getMaxStreak())
                .correctAnswers(e.getCorrectAnswers())
                .wrongAnswers(e.getWrongAnswers())
                .totalAttempts(e.getTotalAttempts())
                .livesLeft(e.getLivesLeft())
                .lastPlayedLevel(e.getLastPlayedLevel())
                .lastPlayedCategory(e.getLastPlayedCategory())
                .lastActive(e.getLastActive())
                .levelGoldEarned(e.getLevelGoldEarned())
                .build();
    }

    // ==================== HELPER METHODS FOR LEVEL COMPLETION TRACKING ====================

    private Map<Integer, Integer> getLevelCompletionMap(UserProgress progress) {
        String counts = progress.getLevelCompletionCounts();
        Map<Integer, Integer> map = new HashMap<>();
        
        // Enhanced null safety
        if (counts == null || counts.trim().isEmpty()) {
            System.out.println("📊 Level completion counts is null/empty, returning empty map");
            return map;
        }

        try {
            String[] pairs = counts.split(",");
            for (String pair : pairs) {
                if (pair != null && !pair.trim().isEmpty()) {
                    String[] parts = pair.split(":");
                    if (parts.length == 2) {
                        try {
                            int level = Integer.parseInt(parts[0].trim());
                            int count = Integer.parseInt(parts[1].trim());
                            map.put(level, count);
                        } catch (NumberFormatException e) {
                            System.err.println("⚠️ Invalid level completion count format: " + pair);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error parsing level completion counts: " + e.getMessage());
            // Return empty map to prevent 500 errors
            return new HashMap<>();
        }
        
        return map;
    }

    private int getLevelCompletionCount(UserProgress progress, int level) {
        return getLevelCompletionMap(progress).getOrDefault(level, 0);
    }

    private void updateLevelCompletionCount(UserProgress progress, int level, int newCount) {
        Map<Integer, Integer> map = getLevelCompletionMap(progress);
        map.put(level, newCount);

        String newCounts = map.entrySet().stream()
                .map(entry -> entry.getKey() + ":" + entry.getValue())
                .collect(Collectors.joining(","));

        progress.setLevelCompletionCounts(newCounts);
    }

    /**
     * Calculate gold reward based on completion number
     * 1st completion: +10 gold
     * 2nd completion: +5 gold
     * 3rd+ completion: 0 gold
     */
    private int calculateGoldReward(int completionNumber) {
        switch (completionNumber) {
            case 1:
                return 10; // First completion
            case 2:
                return 5;  // Second completion (replay)
            default:
                return 0;  // Third and subsequent completions
        }
    }

    // ==================== PUBLIC METHODS FOR LEVEL COMPLETION QUERIES ====================

    public boolean hasCompletedLevel(User user, String category, int level) {
        UserProgress progress = getOrCreateProgress(user, category);
        return getLevelCompletionCount(progress, level) > 0;
    }

    public int getLevelCompletionCount(User user, String category, int level) {
        UserProgress progress = getOrCreateProgress(user, category);
        return getLevelCompletionCount(progress, level);
    }

    public List<Integer> getCompletedLevels(User user, String category) {
        UserProgress progress = getOrCreateProgress(user, category);
        String counts = progress.getLevelCompletionCounts();

        if (counts == null || counts.trim().isEmpty()) {
            return List.of();
        }

        return java.util.Arrays.stream(counts.split(","))
                .map(pair -> pair.split(":")[0].trim())
                .map(Integer::parseInt)
                .sorted()
                .collect(Collectors.toList());
    }
}