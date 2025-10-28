package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "classroom_id")
    private Long classroomId;

    @Column(nullable = false)
    private String category;

    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private int currentLevel = 1;


    @Column(nullable = false)
    @Builder.Default
    private int level = 1;

    @Column(name = "puzzles_solved", nullable = false)
    @Builder.Default
    private int puzzlesSolved = 0;

    @Column(name = "hints_used", nullable = false)
    @Builder.Default
    private int hintsUsed = 0;

    @Column(name = "streak_count", nullable = false)
    @Builder.Default
    private int streakCount = 0;

    @Column(name = "max_streak", nullable = false)
    @Builder.Default
    private int maxStreak = 0;

    @Column(name = "correct_answers", nullable = false)
    @Builder.Default
    private int correctAnswers = 0;

    @Column(name = "wrong_answers", nullable = false)
    @Builder.Default
    private int wrongAnswers = 0;

    @Column(name = "total_attempts", nullable = false)
    @Builder.Default
    private int totalAttempts = 0;

    @Column(name = "lives_left", nullable = false)
    @Builder.Default
    private int livesLeft = 3;

    // Fix: Map DB column that is NOT NULL with no default in schema
    // to avoid SQL error "Field 'level_gold_earned' doesn't have a default value"
    @Column(name = "level_gold_earned", nullable = false)
    @Builder.Default
    private int levelGoldEarned = 0;

    // Some databases may still have this legacy column present and marked NOT NULL.
    // Mapping it here with a default value prevents insert failures like:
    // "Field 'level_gold_awarded' doesn't have a default value".
    @Column(name = "level_gold_awarded", nullable = false)
    @Builder.Default
    private int levelGoldAwarded = 0;

    // Store level completion counts as JSON string (e.g., "1:2,2:1,3:3" means level 1 completed 2 times, level 2 once, level 3 three times)
    @Column(name = "level_completion_counts", columnDefinition = "TEXT")
    private String levelCompletionCounts;

    @Column(name = "last_played_level")
    private Integer lastPlayedLevel;

    @Column(name = "last_played_category")
    private String lastPlayedCategory;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
