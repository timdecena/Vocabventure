package com.example.Vocabia.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameSubmissionRequest {
    private String puzzleId;
    private String gameType;
    private String answer;
    private int timeTaken;
    private int hintsUsed;
    private String category;
    private String level;
}
