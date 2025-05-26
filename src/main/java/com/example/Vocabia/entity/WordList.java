// --- Custom Word List Game Mode START ---
package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WordList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer weekNumber; // week of year
    private String description;

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    @OneToMany(mappedBy = "wordList", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WordListItem> items;
}
// --- Custom Word List Game Mode END ---
