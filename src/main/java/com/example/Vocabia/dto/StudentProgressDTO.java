package com.example.Vocabia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgressDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private int levelsCompleted;
    private int accuracy;
    private int hintUsage;
    private int averageTime; // Placeholder until actual timing data is implemented
    private LocalDateTime lastActive;
}
