package com.example.Vocabia.adventure.dto;

public class LevelDataResponse {
    private Long levelId;
    private String title;
    private String description;
    private String imageUrl;

    public LevelDataResponse() {
    }

    public LevelDataResponse(Long levelId, String title, String description, String imageUrl) {
        this.levelId = levelId;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    public Long getLevelId() {
        return levelId;
    }

    public void setLevelId(Long levelId) {
        this.levelId = levelId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
