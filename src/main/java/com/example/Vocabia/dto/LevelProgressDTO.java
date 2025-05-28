package com.example.Vocabia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LevelProgressDTO {
    private String gameType;
    private String category;
    private String level;
    private boolean completed;
    private int expEarned;
    private Integer fastestTime;
    private LocalDateTime completionDate;
    private boolean hintUsed;
}
