package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "word_of_the_day_score") // optional: adapt to your table name
public class WordOfTheDayScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "word_id", nullable = false)
    private WordOfTheDay word;

    private boolean correct;

    @Column(nullable = false)
    private int score = 0;

    // IMPORTANT: default to 0 (not 1)
    @Column(nullable = false)
    private int playCount = 0;
}
