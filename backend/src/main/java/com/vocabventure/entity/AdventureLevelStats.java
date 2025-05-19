package com.vocabventure.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "adventure_level_stats")
@Data
public class AdventureLevelStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "island_id", nullable = false)
    private Integer islandId;

    @Column(name = "level_number", nullable = false)
    private Integer levelNumber;

    @Column(name = "stars_earned")
    private Integer starsEarned;

    @Column(name = "completed")
    private Boolean completed;

    @Column(name = "best_score")
    private Integer bestScore;

    @Column(name = "attempts")
    private Integer attempts = 0;

    @Column(name = "last_attempted")
    private java.time.LocalDateTime lastAttempted;
} 