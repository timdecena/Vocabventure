package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "adventure_profile")
@Data
public class AdventureProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long id;

    @NotBlank
    @Column(name = "adventurer_name", nullable = false)
    private String adventurerName;

    @NotBlank
    @Column(name = "gender", nullable = false)
    private String gender;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "current_island", columnDefinition = "INT DEFAULT 1")
    private Integer currentIsland = 1;

    @Column(name = "stars_earned", columnDefinition = "INT DEFAULT 0")
    private Integer starsEarned = 0;

    @Column(name = "scrolls_collected", columnDefinition = "INT DEFAULT 0")
    private Integer scrollsCollected = 0;

    @Column(name = "hearts", columnDefinition = "INT DEFAULT 3")
    private Integer hearts = 3;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
} 