package com.example.Vocabia.dto;

import com.example.Vocabia.entity.FourPicOneWord.Difficulty;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FourPicOneWordDTO {
    private Long id;
    private String category;
    private int level;
    private String answer;
    private String hint;
    private String hintType;
    private String image1Url;
    private String image2Url;
    private String image3Url;
    private String image4Url;
    private Difficulty difficulty;
    private boolean isActive;
    private LocalDateTime createdAt;
}
