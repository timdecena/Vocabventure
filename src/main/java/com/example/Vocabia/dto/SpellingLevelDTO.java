package com.example.Vocabia.dto;

public class SpellingLevelDTO {
    private Long id;
    private String title;
    private int maxAttempts; 

    public SpellingLevelDTO(Long id, String title, int maxAttempts) {
        this.id = id;
        this.title = title;
        this.maxAttempts = maxAttempts;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }
}
