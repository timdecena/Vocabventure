package com.example.Vocabia.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgressDTO {
    private Long id;
    private String category;
    private int currentLevel;
    private int level;
    private int puzzlesSolved;
    private int hintsUsed;
    private int streakCount;
    private int maxStreak;
    private int wrongAnswers;
    private int totalAttempts;
    private int livesLeft;
    private Integer lastPlayedLevel;
    private String lastPlayedCategory;
    private LocalDateTime lastActive;

    private int gold;
    private int progressPoints;
    private int correctAnswers;
}
