package com.example.Vocabia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgressDTO {
    private String gameType;
    private int exp;
    private int level;
    private int expToNextLevel;
    private int completedLevels;
    private int totalLevels;
    private int currentStreak;
    private int bestStreak;
    private int hintsRemaining;
}
