package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Table(name = "game_levels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(name = "level_number", nullable = false)
    private Integer levelNumber;

    @Column(nullable = false)
    private String answer;

    @Column(name = "images_path")
    private String imagesPath;

    private String hint;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    private boolean active = true;

    // Helper method to get full path for each image
    public List<String> getImagePaths() {
        return List.of(
            "/images/" + category + "/level" + levelNumber + "/pic1.jpg",
            "/images/" + category + "/level" + levelNumber + "/pic2.jpg",
            "/images/" + category + "/level" + levelNumber + "/pic3.jpg",
            "/images/" + category + "/level" + levelNumber + "/pic4.jpg"
        );
    }

    // Enum for difficulty levels
    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
}
