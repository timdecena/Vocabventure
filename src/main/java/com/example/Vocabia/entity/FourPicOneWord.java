package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "four_pic_one_word", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"category", "level"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FourPicOneWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private int level;

    @Column(nullable = false)
    private String answer;

    @Column(columnDefinition = "TEXT")
    private String hint;

    @Column(name = "hint_type")
    private String hintType; // Example: "TEXT_HINT", "REVEAL_LETTER"

    @Column(name = "image1_url", nullable = false)
    private String image1Url;

    @Column(name = "image2_url", nullable = false)
    private String image2Url;

    @Column(name = "image3_url", nullable = false)
    private String image3Url;

    @Column(name = "image4_url", nullable = false)
    private String image4Url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Difficulty difficulty = Difficulty.EASY;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
}
