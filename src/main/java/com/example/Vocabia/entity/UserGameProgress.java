package com.example.Vocabia.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_game_progress")
public class UserGameProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String gameType;
    
    @Column
    private String category;
    
    @Column
    private String level;

    @ManyToOne
    @JoinColumn(name = "level_id")
    private Level levelEntity;

    @ManyToOne
    @JoinColumn(name = "puzzle_id")
    private FourPicOneWordPuzzle puzzle;
    
    @Column
    private int streak = 0;
    
    @Column
    private LocalDate lastPlayDate;
    
    @Column
    private Integer fastestTime;
    
    @Column
    private Integer lastCompletionTime;
    
    @Column
    private boolean hintUsed = false;

    @Column
    private boolean completed = false;

    @Column
    private LocalDateTime completedAt;
    
    @Column
    private LocalDateTime lastCompletedAt;

    @Column
    private int expEarned = 0;

    public UserGameProgress() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getGameType() { return gameType; }
    public void setGameType(String gameType) { this.gameType = gameType; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    
    public Level getLevelEntity() { return levelEntity; }
    public void setLevelEntity(Level levelEntity) { this.levelEntity = levelEntity; }

    public FourPicOneWordPuzzle getPuzzle() { return puzzle; }
    public void setPuzzle(FourPicOneWordPuzzle puzzle) { this.puzzle = puzzle; }
    
    public int getStreak() { return streak; }
    public void setStreak(int streak) { this.streak = streak; }
    
    public LocalDate getLastPlayDate() { return lastPlayDate; }
    public void setLastPlayDate(LocalDate lastPlayDate) { this.lastPlayDate = lastPlayDate; }
    
    public Integer getFastestTime() { return fastestTime; }
    public void setFastestTime(Integer fastestTime) { this.fastestTime = fastestTime; }
    
    public Integer getLastCompletionTime() { return lastCompletionTime; }
    public void setLastCompletionTime(Integer lastCompletionTime) { this.lastCompletionTime = lastCompletionTime; }
    
    public boolean isHintUsed() { return hintUsed; }
    public void setHintUsed(boolean hintUsed) { this.hintUsed = hintUsed; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public LocalDateTime getLastCompletedAt() { return lastCompletedAt; }
    public void setLastCompletedAt(LocalDateTime lastCompletedAt) { this.lastCompletedAt = lastCompletedAt; }

    public int getExpEarned() { return expEarned; }
    public void setExpEarned(int expEarned) { this.expEarned = expEarned; }
}
