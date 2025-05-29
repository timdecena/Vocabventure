package com.example.Vocabia.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 
 */
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
    @CollectionTable(
            name = "puzzle_images",
            joinColumns = @JoinColumn(name = "puzzle_id")
    )
    @Column(name = "image_url", nullable = false) // <- THIS IS THE FIX!
    private List<String> images;

    @NotBlank(message = "Answer is required")
    @Size(max = 50, message = "Answer must be at most 50 characters")
    @Column(nullable = false, length = 50)
    private String answer;

    @Size(max = 255, message = "Hint must be at most 255 characters")
    @Column(length = 255)
    private String hint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Size(max = 50, message = "Target class must be at most 50 characters")
    @Column(name = "target_class", length = 50)
    private String targetClass;

    @Column(name = "created_at")
    private LocalDateTime createdAt;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

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

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public String getTargetClass() { return targetClass; }
    public void setTargetClass(String targetClass) { this.targetClass = targetClass; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public int getLevelNumber() {
        return this.level != null ? this.level.getNumber() : 1;
    }
}
