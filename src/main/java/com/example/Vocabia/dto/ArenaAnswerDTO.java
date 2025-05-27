package com.example.Vocabia.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArenaAnswerDTO {
    private String correctWord;
    private String studentAnswer;
    private double responseTime;
}
