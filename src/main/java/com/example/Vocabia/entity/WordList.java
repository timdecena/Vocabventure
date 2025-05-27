package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne
    private User createdBy;

@OneToMany(mappedBy = "wordList", cascade = CascadeType.ALL, orphanRemoval = true)
private List<WordListItem> items;
}
