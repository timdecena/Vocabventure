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
    private String hintType;

    // ✅ Optional image URLs (1–4 allowed)
    @Column(name = "image1_url")
    private String image1Url;

    @Column(name = "image2_url")
    private String image2Url;

    @Column(name = "image3_url")
    private String image3Url;

    @Column(name = "image4_url")
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

    // ✅ Computed field for image count (not stored in DB, calculated dynamically)
    @Transient
    public int getImageCount() {
        int count = 0;
        if (image1Url != null && !image1Url.trim().isEmpty()) count++;
        if (image2Url != null && !image2Url.trim().isEmpty()) count++;
        if (image3Url != null && !image3Url.trim().isEmpty()) count++;
        if (image4Url != null && !image4Url.trim().isEmpty()) count++;
        return count;
    }

    // ✅ Helper method to get all non-null image URLs
    @Transient
    public java.util.List<String> getImageUrls() {
        java.util.List<String> urls = new java.util.ArrayList<>();
        if (image1Url != null && !image1Url.trim().isEmpty()) urls.add(image1Url);
        if (image2Url != null && !image2Url.trim().isEmpty()) urls.add(image2Url);
        if (image3Url != null && !image3Url.trim().isEmpty()) urls.add(image3Url);
        if (image4Url != null && !image4Url.trim().isEmpty()) urls.add(image4Url);
        return urls;
    }

    // ✅ Helper method to validate minimum image requirement
    @Transient
    public boolean hasValidImages() {
        return getImageCount() >= 1;
    }

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
}
