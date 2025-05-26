// --- Custom Word List Game Mode START ---
package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WordListItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "word_list_id")
    @com.fasterxml.jackson.annotation.JsonIgnore // <-- add this!
    private WordList wordList;

    private Integer dayNumber; // 1-7 (Mon-Sun)
    private String word;
    private String definition;

    private String imageUrl; // optional
}
// --- Custom Word List Game Mode END ---
