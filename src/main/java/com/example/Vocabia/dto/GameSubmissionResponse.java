package com.example.Vocabia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameSubmissionResponse {
    private boolean correct;
    private int expEarned;
    private int totalExp;
    private int level;
    private int expToNextLevel;
    private int streak;
    private int hintsRemaining;
    private boolean levelUp;
    // Achievement field removed
}
