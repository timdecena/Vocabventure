package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "level_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "game_level_id"})
})
@Data
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
}
