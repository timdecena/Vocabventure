package com.example.Vocabia.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaderboardEntryDTO {
    private String studentName;
    private int totalScore;
}
