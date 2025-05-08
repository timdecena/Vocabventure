package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Table(name = "game_levels")
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

    @Builder.Default
    private boolean active = true;

    // Helper method to get full path for each image
    public List<String> getImagePaths() {
        // Check if the path is for external storage
        if (imagesPath != null && imagesPath.startsWith("external:")) {
            return List.of(
                "/api/game/images/" + category + "/level" + levelNumber + "/pic1.jpg",
                "/api/game/images/" + category + "/level" + levelNumber + "/pic2.jpg",
                "/api/game/images/" + category + "/level" + levelNumber + "/pic3.jpg",
                "/api/game/images/" + category + "/level" + levelNumber + "/pic4.jpg"
            );
        } else {
            // Default internal path
            return List.of(
                "/images/" + category + "/level" + levelNumber + "/pic1.jpg",
                "/images/" + category + "/level" + levelNumber + "/pic2.jpg",
                "/images/" + category + "/level" + levelNumber + "/pic3.jpg",
                "/images/" + category + "/level" + levelNumber + "/pic4.jpg"
            );
        }
    }

    // Enum for difficulty levels
    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public Integer getLevelNumber() {
        return levelNumber;
    }
    
    public void setLevelNumber(Integer levelNumber) {
        this.levelNumber = levelNumber;
    }
    
    public String getAnswer() {
        return answer;
    }
    
    public void setAnswer(String answer) {
        this.answer = answer;
    }
    
    public String getImagesPath() {
        return imagesPath;
    }
    
    public void setImagesPath(String imagesPath) {
        this.imagesPath = imagesPath;
    }
    
    public String getHint() {
        return hint;
    }
    
    public void setHint(String hint) {
        this.hint = hint;
    }
    
    public Difficulty getDifficulty() {
        return difficulty;
    }
    
    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
}
