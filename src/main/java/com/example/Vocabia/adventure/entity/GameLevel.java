package com.example.Vocabia.adventure.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "game_levels")
public class GameLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;   // 🆕 ADD

    private String imageUrl;      // 🆕 ADD

    private String category;

    private int levelNumber;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty; // 🆕 ADD

    private boolean active;        // 🆕 ADD

    // Keep if you want (extra fields)
    private int xpReward;
    private int stars;

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getLevelNumber() { return levelNumber; }
    public void setLevelNumber(int levelNumber) { this.levelNumber = levelNumber; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public int getXpReward() { return xpReward; }
    public void setXpReward(int xpReward) { this.xpReward = xpReward; }

    public int getStars() { return stars; }
    public void setStars(int stars) { this.stars = stars; }
}
