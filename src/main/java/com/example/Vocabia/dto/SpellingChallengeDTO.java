package com.example.Vocabia.dto;

import lombok.Data;

@Data
public class SpellingChallengeDTO {
    private Long id;
    private String word;
    private String definition;
    private String exampleSentence;
    private String audioUrl;

    public SpellingChallengeDTO(Long id, String word, String definition, String exampleSentence, String audioUrl) {
        this.id = id;
        this.word = word;
        this.definition = definition;
        this.exampleSentence = exampleSentence;
        this.audioUrl = audioUrl;
    }
}
