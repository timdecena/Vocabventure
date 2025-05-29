package com.example.Vocabia.dto;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for FourPicOneWordPuzzle operations.
 * Includes validation constraints for data integrity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor

public class FourPicOneWordPuzzleDTO {
    private Long id;

    @NotBlank(message = "Answer is required")
    @Size(max = 50, message = "Answer must be at most 50 characters")
    private String answer;

    @Size(max = 255, message = "Hint must be at most 255 characters")
    private String hint;

    @Valid
    @NotNull(message = "Images list cannot be null")
    @Size(min = 1, message = "At least one image is required")
    private List<@NotBlank String> images;

    @NotNull(message = "Level ID is required")
    private Long levelId;
    
    private List<String> letterTiles;
    

    public FourPicOneWordPuzzleDTO(String answer, String hint, List<String> images) {
        this.answer = answer;
        this.hint = hint;
        this.images = images;
    }
    
    public FourPicOneWordPuzzleDTO(Long id, String answer, String hint, List<String> images, Long levelId) {
        this.id = id;
        this.answer = answer;
        this.hint = hint;
        this.images = images;
        this.levelId = levelId;
    }
}
