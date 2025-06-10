package com.example.Vocabia.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProgressDTO {
    private Long id;
    private String category;
    private int currentLevel;
    private int currentXp;
    private int level;
    private int puzzlesSolved;
    private int hintsUsed;
    private int streakCount;
    private int maxStreak;
    private int correctAnswers;
    private int wrongAnswers;
    private int totalAttempts;
    private int livesLeft;
    private Integer lastPlayedLevel;
    private String lastPlayedCategory;
}
