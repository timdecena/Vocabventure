package com.example.Vocabia.dto;

public class SpellingLevelDTO {
    private Long id;
    private String title;

    public SpellingLevelDTO(Long id, String title) {
        this.id = id;
        this.title = title;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
}
