package com.example.Vocabia.dto;

public class SpellingLevelDTO {
    private Long id;
    private String title;
    private int maxAttempts;  // 👈 add this

    public SpellingLevelDTO(Long id, String title, int maxAttempts) {
        this.id = id;
        this.title = title;
        this.maxAttempts = maxAttempts;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public int getMaxAttempts() { return maxAttempts; }
}
