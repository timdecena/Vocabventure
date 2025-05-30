package com.example.Vocabia.adventure.entity;

import com.example.Vocabia.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "adventure_level_stats")
public class AdventureLevelStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private GameLevel gameLevel; // 🆕 Correct relational link

    private int score;
    private int attempts;
    private int timeTaken;       // 🆕 Important for full stats

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public GameLevel getGameLevel() { return gameLevel; }
    public void setGameLevel(GameLevel gameLevel) { this.gameLevel = gameLevel; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }

    public int getTimeTaken() { return timeTaken; }
    public void setTimeTaken(int timeTaken) { this.timeTaken = timeTaken; }
}
