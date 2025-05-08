package com.backend.VocabVenture.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LevelCompletionRequest {

    @NotNull(message = "Level ID is required")
    private Long levelId;
    
    @Min(value = 1, message = "Attempts must be at least 1")
    private Integer attempts = 1;
    
    @Min(value = 0, message = "Time taken cannot be negative")
    private Integer timeTaken;
    
    @Min(value = 0, message = "Hints used cannot be negative")
    private Integer hintsUsed = 0;
}
