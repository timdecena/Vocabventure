package com.example.Vocabia.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for completing a puzzle
 */
@Data
public class CompletePuzzleRequest {
    @NotNull(message = "Puzzle ID is required")
    private Long puzzleId;

    @Min(value = 0, message = "Time taken must be a positive number")
    private int timeTaken; // Time taken to complete in seconds

    @Min(value = 0, message = "Hints used cannot be negative")
    private int hintsUsed; // Number of hints used
}
