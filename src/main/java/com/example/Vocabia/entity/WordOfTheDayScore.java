package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class WordOfTheDayScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User student;

    @ManyToOne
    private WordOfTheDay word;

    private boolean correct;

    @Column(nullable = false)
    private int score; // ✅ Add this line
}
