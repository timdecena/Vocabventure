package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class SpellingLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne
    private Classroom classroom;

    @OneToMany(mappedBy = "level", cascade = CascadeType.ALL)
    private List<SpellingChallenge> challenges;
}
