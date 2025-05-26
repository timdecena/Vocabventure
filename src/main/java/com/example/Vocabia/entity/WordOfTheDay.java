package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WordOfTheDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String word;
    private String definition;
    private String imageUrl;
    private LocalDate dateAvailable; // e.g., 2025-05-26
}
