package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "level_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "game_level_id"})
})
@NoArgsConstructor
@AllArgsConstructor
public class LevelProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "game_level_id", nullable = false)
    private GameLevel gameLevel;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    // Number of attempts before completing the level
    private Integer attempts = 1;

    // Time taken to complete the level (in seconds)
    private Integer timeTaken;

    // Optional hints used (0 if no hints were used)
    private Integer hintsUsed = 0;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public GameLevel getGameLevel() {
        return gameLevel;
    }
    
    public void setGameLevel(GameLevel gameLevel) {
        this.gameLevel = gameLevel;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public Integer getAttempts() {
        return attempts;
    }
    
    public void setAttempts(Integer attempts) {
        this.attempts = attempts;
    }
    
    public Integer getTimeTaken() {
        return timeTaken;
    }
    
    public void setTimeTaken(Integer timeTaken) {
        this.timeTaken = timeTaken;
    }
    
    public Integer getHintsUsed() {
        return hintsUsed;
    }
    
    public void setHintsUsed(Integer hintsUsed) {
        this.hintsUsed = hintsUsed;
    }
}
