package com.example.Vocabia.dto;

public class SpellingLevelDTO {
    private Long id;
    private String title;
    private int maxAttempts;
    private int remainingAttempts;  // 👈 new field

    public SpellingLevelDTO(Long id, String title, int maxAttempts, int remainingAttempts) {
        this.id = id;
        this.title = title;
        this.maxAttempts = maxAttempts;
        this.remainingAttempts = remainingAttempts;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public int getMaxAttempts() { return maxAttempts; }
    public int getRemainingAttempts() { return remainingAttempts; }
}
