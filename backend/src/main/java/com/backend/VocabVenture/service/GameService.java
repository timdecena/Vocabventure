package com.backend.VocabVenture.service;

import com.backend.VocabVenture.model.*;
import com.backend.VocabVenture.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GameService {
    private final AdventureLevelRepository levelRepo;
    private final AdventureWordRepository wordRepo;
    private final AdventureProgressRepository progressRepo;

    public AdventureProgress handleCorrectAnswer(Long userId, Long levelId) {
        AdventureProgress progress = progressRepo.findByUserIdAndLevelId(userId, levelId)
                .orElseGet(() -> AdventureProgress.builder()
                        .userId(userId)
                        .levelId(levelId)
                        .score(0)
                        .attempts(0)
                        .currentHP(levelRepo.findById(levelId).get().getMonsterHP())
                        .isCompleted(false)
                        .build());

        if (!progress.isCompleted()) {
            progress.setScore(progress.getScore() + 10);
            progress.setAttempts(progress.getAttempts() + 1);
            progress.setCurrentHP(progress.getCurrentHP() - 1);

            if (progress.getCurrentHP() <= 0) {
                progress.setCompleted(true);
                progress.setCompletionTime(LocalDateTime.now());
            }
        }
        return progressRepo.save(progress);
    }
}
