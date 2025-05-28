package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "jungle_lush_progress")
public class JungleLushProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "unlocked_level", nullable = false)
    private int unlockedLevel = 1;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "jungle_lush_stars", 
        joinColumns = @JoinColumn(name = "progress_id"))
    @MapKeyColumn(name = "level_id")
    @Column(name = "stars")
    private Map<Integer, Integer> stars = new HashMap<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public int getUnlockedLevel() { return unlockedLevel; }
    public void setUnlockedLevel(int unlockedLevel) { this.unlockedLevel = unlockedLevel; }

    public Map<Integer, Integer> getStars() { return stars; }
    public void setStars(Map<Integer, Integer> stars) { this.stars = stars; }
} 