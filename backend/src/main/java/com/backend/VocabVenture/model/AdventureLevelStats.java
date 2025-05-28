package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "adventure_level_stats")
public class AdventureLevelStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stat_id")
    private Long statId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "level_id", nullable = false)
    private Long levelId;

    @Column(name = "stars_earned")
    private int starsEarned;

    @Column(name = "completed")
    private boolean completed;

    @Column(name = "created_at")
    private Timestamp createdAt;

    // Getters and setters
    public Long getStatId() { return statId; }
    public void setStatId(Long statId) { this.statId = statId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getLevelId() { return levelId; }
    public void setLevelId(Long levelId) { this.levelId = levelId; }

    public int getStarsEarned() { return starsEarned; }
    public void setStarsEarned(int starsEarned) { this.starsEarned = starsEarned; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
} 