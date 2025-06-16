package com.example.Vocabia.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class SpellingChallenge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String word;
    private String definition;
    private String exampleSentence;
    private String audioUrl; // e.g. /audio/spelling/word1.mp3

    @ManyToOne
    @JsonIgnore
    private User teacher;

    @ManyToOne
    @JsonIgnore
    private Classroom classroom;

    @ManyToOne
    @JsonIgnore
    private SpellingLevel level;
}
