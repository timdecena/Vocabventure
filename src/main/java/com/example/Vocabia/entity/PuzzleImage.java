package com.example.Vocabia.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "puzzle_images")
public class PuzzleImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "puzzle_id")
    private FourPicOneWordPuzzle puzzle;

    @Column(name = "image_url")
    private String imageUrl;

    public PuzzleImage() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public FourPicOneWordPuzzle getPuzzle() { return puzzle; }
    public void setPuzzle(FourPicOneWordPuzzle puzzle) { this.puzzle = puzzle; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}