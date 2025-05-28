package com.example.Vocabia.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "four_pic_one_word_puzzle")
public class FourPicOneWordPuzzle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_id", nullable = false)
    private Level level;

    @ElementCollection
    @CollectionTable(name = "puzzle_images", joinColumns = @JoinColumn(name = "puzzle_id"))
    @Column(name = "image_url_list")
    private List<String> images;

    @Column(nullable = false)
    private String answer;

    @Column
    private String hint;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Level getLevel() { return level; }
    public void setLevel(Level level) { this.level = level; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
}
