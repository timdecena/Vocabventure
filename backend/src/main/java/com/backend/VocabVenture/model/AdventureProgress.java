package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdventureProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long progressId;

    private Long userId;
    private Long levelId;
    private int score;
    private int attempts;
    private int currentHP;
    private boolean isCompleted;
    private LocalDateTime completionTime;
}
