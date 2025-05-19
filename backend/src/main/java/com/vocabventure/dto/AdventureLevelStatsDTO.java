package com.vocabventure.dto;

import lombok.Data;

@Data
public class AdventureLevelStatsDTO {
    private Long userId;
    private Integer islandId;
    private Integer levelNumber;
    private Integer starsEarned;
    private Boolean completed;
    private Integer bestScore;
} 