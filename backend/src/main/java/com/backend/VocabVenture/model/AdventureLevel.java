package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdventureLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long levelId;

    private int levelNumber;
    private String title;
    private String description;
    private String monsterName;
    private String monsterImageUrl;
    private String difficulty;
    private int monsterHP;
    private Long teacherId;
}
