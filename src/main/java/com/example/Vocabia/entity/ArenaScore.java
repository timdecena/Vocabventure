package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArenaScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne private User student;
    @ManyToOne private WordList wordList;

    private int totalScore;
    private int correctAnswers;
    private double avgResponseTime;

    private LocalDateTime datePlayed;
}
