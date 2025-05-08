package com.backend.VocabVenture.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LevelDataResponse {

    private Long id;
    private String category;
    private Integer levelNumber;
    private String answer;
    private List<String> images;
    private Integer difficulty;
    private String hint;
    private Boolean completed;
}
