package com.example.Vocabia.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArenaLeaderboardDTO {
    private String name;
    private int totalScore;
    private int correctAnswers;
    private double avgResponseTime;
}
