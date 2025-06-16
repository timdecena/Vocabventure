package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class WordOfTheDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String word;
    private String definition;

    @Column(nullable = false)
    private LocalDate dateAvailable;

    @Column(nullable = false)
    private String imageUrl; // ✅ Image path relative to /images/
}
