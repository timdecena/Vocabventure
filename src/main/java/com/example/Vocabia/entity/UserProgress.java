package com.example.Vocabia.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
public class UserProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private int exp = 0;
    private int level = 1;
    private int totalPuzzlesSolved = 0;
    private int dailyStreak = 0;
    private LocalDate lastLoginDate = LocalDate.now();
    private LocalDateTime lastLevelUp;
    private int totalExpEarned = 0;

    // --- XP thresholds for each level ---
    @Transient
    public static final int[] LEVEL_CAPS = {
            0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500,
            5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000,
            21000, 23100, 25300, 27600, 30000, 32500, 35100, 37800, 40600, 43500,
            46500, 49600, 52800, 56100, 59500, 63000, 66600, 70300, 74100, 78000,
            82000, 86100, 90300, 94600, 99000, 103500, 108100, 112800, 117600, 122500,
            127500, 132600, 137800, 143100, 148500, 154000, 159600, 165300, 171100, 177000,
            183000, 189100, 195300, 201600, 208000, 214500, 221100, 227800, 234600, 241500,
            248500, 255600, 262800, 270100, 277500, 285000, 292600, 300300, 308100, 316000,
            324000, 332100, 340300, 348600, 357000, 365500, 374100, 382800, 391600, 400500,
            409500, 418600, 427800, 437100, 446500, 456000, 465600, 475300, 485100, 495000
    };

    // --- Constructors ---
    public UserProgress() {}

    public UserProgress(User user) {
        this.user = user;
        this.exp = 0;
        this.level = 1;
        this.totalPuzzlesSolved = 0;
        this.dailyStreak = 0;
        this.lastLoginDate = LocalDate.now();
        this.lastLevelUp = null;
        this.totalExpEarned = 0;
    }

    // --- Getters and Setters ---

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

    public int getExp() {
        return exp;
    }
    public void setExp(int exp) {
        this.exp = exp;
    }

    public int getLevel() {
        return level;
    }
    public void setLevel(int level) {
        this.level = level;
    }

    public int getTotalPuzzlesSolved() {
        return totalPuzzlesSolved;
    }
    public void setTotalPuzzlesSolved(int totalPuzzlesSolved) {
        this.totalPuzzlesSolved = totalPuzzlesSolved;
    }

    public int getDailyStreak() {
        return dailyStreak;
    }
    public void setDailyStreak(int dailyStreak) {
        this.dailyStreak = dailyStreak;
    }

    public LocalDate getLastLoginDate() {
        return lastLoginDate;
    }
    public void setLastLoginDate(LocalDate lastLoginDate) {
        this.lastLoginDate = lastLoginDate;
    }

    public LocalDateTime getLastLevelUp() {
        return lastLevelUp;
    }
    public void setLastLevelUp(LocalDateTime lastLevelUp) {
        this.lastLevelUp = lastLevelUp;
    }

    public int getTotalExpEarned() {
        return totalExpEarned;
    }
    public void setTotalExpEarned(int totalExpEarned) {
        this.totalExpEarned = totalExpEarned;
    }

    // --- Helper Methods ---

    /** Returns the EXP needed to reach the next level. */
    public int getExpForNextLevel() {
        return (level < LEVEL_CAPS.length) ? LEVEL_CAPS[level] : LEVEL_CAPS[LEVEL_CAPS.length - 1];
    }

    /** Static helper: EXP required for a specific level (level 1-based). */
    public static int getExpForLevel(int lvl) {
        return (lvl <= 0) ? 0 : (lvl < LEVEL_CAPS.length ? LEVEL_CAPS[lvl] : LEVEL_CAPS[LEVEL_CAPS.length - 1]);
    }

    /** Returns the highest level possible (based on LEVEL_CAPS). */
    public static int getMaxLevel() {
        return LEVEL_CAPS.length - 1;
    }

    // --- Optional: level up logic can be placed in the service for atomicity ---
}
