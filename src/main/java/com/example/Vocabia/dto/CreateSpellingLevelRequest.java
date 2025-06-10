package com.example.Vocabia.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateSpellingLevelRequest {
    private String title;
    private Long classroomId;
    private List<WordEntry> words;

    @Data
    public static class WordEntry {
        private String word;
        private String definition;
        private String sentence;
        private String audioUrl;
    }
}
