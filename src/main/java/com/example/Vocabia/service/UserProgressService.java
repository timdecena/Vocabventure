package com.example.Vocabia.service;

import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.UserProgress;
import com.example.Vocabia.repository.UserProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserProgressService {

    private final UserProgressRepository repo;

    // XP curve
    private int xpRequiredForNextLevel(int level) {
        return 50 * level * (level + 1) / 2;
    }

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
                    .build();
            return repo.save(np);
        });
    }

    public UserProgressDTO completeLevel(User user, String category, boolean usedHint) {
        UserProgress p = getOrCreateProgress(user, category);
        int xpGain = usedHint ? 5 : 10;
        p.setCurrentXp(p.getCurrentXp() + xpGain);
        p.setPuzzlesSolved(p.getPuzzlesSolved() + 1);
        p.setCorrectAnswers(p.getCorrectAnswers() + 1);
        p.setTotalAttempts(p.getTotalAttempts() + 1);
        p.setStreakCount(p.getStreakCount() + 1);
        if (p.getStreakCount() > p.getMaxStreak()) p.setMaxStreak(p.getStreakCount());

        int requiredXp = xpRequiredForNextLevel(p.getLevel());
        while (p.getCurrentXp() >= requiredXp) {
            p.setLevel(p.getLevel() + 1);
            requiredXp = xpRequiredForNextLevel(p.getLevel());
        }

        p.setCurrentLevel(p.getCurrentLevel() + 1);
        p.setLastActive(LocalDateTime.now());
        p.setLastPlayedLevel(p.getCurrentLevel());
        p.setLastPlayedCategory(category);

        repo.save(p);
        return toDto(p);
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

    public UserProgressDTO useHint(User user, String category, int level) {
        UserProgress p = getOrCreateProgress(user, category);
        p.setHintsUsed(p.getHintsUsed() + 1);
        p.setLastActive(LocalDateTime.now());
        repo.save(p);
        return toDto(p);
    }

    public List<UserProgressDTO> getLeaderboard(String category) {
        return repo.findTop10ByCategoryOrderByCurrentXpDesc(category)
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
                .currentXp(e.getCurrentXp())
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
                .build();
    }
}
