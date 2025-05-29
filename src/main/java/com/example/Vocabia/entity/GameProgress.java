package com.example.Vocabia.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_game_progress", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "puzzle_id"}))
public class GameProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "puzzle_id")
    private FourPicOneWordPuzzle puzzle;

    private boolean completed = false;
    private LocalDateTime completedAt;
    private int expEarned = 0;
    private int hintsUsed = 0;
    private int timeTaken = 0;
    private Integer fastestTime;
    private int unlockLevel = 1; // the level this puzzle unlocks

    // NEW fields for advanced progress tracking
    private LocalDate lastPlayDate;
    private int streak = 0;
    private LocalDateTime lastCompletedAt;
    private boolean perfectCompletion;
    private int streakBonus;
    private int timeBonus;
    private boolean hintUsed;

    private String category;
    private String level;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public FourPicOneWordPuzzle getPuzzle() { return puzzle; }
    public void setPuzzle(FourPicOneWordPuzzle puzzle) { this.puzzle = puzzle; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public int getExpEarned() { return expEarned; }
    public void setExpEarned(int expEarned) { this.expEarned = expEarned; }

    public int getHintsUsed() { return hintsUsed; }
    public void setHintsUsed(int hintsUsed) { this.hintsUsed = hintsUsed; }

    public int getTimeTaken() { return timeTaken; }
    public void setTimeTaken(int timeTaken) { this.timeTaken = timeTaken; }

    public Integer getFastestTime() { return fastestTime; }
    public void setFastestTime(Integer fastestTime) { this.fastestTime = fastestTime; }

    public int getUnlockLevel() { return unlockLevel; }
    public void setUnlockLevel(int unlockLevel) { this.unlockLevel = unlockLevel; }

    public LocalDate getLastPlayDate() { return lastPlayDate; }
    public void setLastPlayDate(LocalDate lastPlayDate) { this.lastPlayDate = lastPlayDate; }

    public int getStreak() { return streak; }
    public void setStreak(int streak) { this.streak = streak; }

    public LocalDateTime getLastCompletedAt() { return lastCompletedAt; }
    public void setLastCompletedAt(LocalDateTime lastCompletedAt) { this.lastCompletedAt = lastCompletedAt; }

    public boolean isPerfectCompletion() { return perfectCompletion; }
    public void setPerfectCompletion(boolean perfectCompletion) { this.perfectCompletion = perfectCompletion; }

    public int getStreakBonus() { return streakBonus; }
    public void setStreakBonus(int streakBonus) { this.streakBonus = streakBonus; }

    public int getTimeBonus() { return timeBonus; }
    public void setTimeBonus(int timeBonus) { this.timeBonus = timeBonus; }

    public boolean isHintUsed() { return hintUsed; }
    public void setHintUsed(boolean hintUsed) { this.hintUsed = hintUsed; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
}
