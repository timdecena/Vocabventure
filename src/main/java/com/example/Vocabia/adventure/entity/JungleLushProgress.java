package com.example.Vocabia.adventure.entity;

import com.example.Vocabia.entity.User;
import jakarta.persistence.*;

@Entity
public class JungleLushProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String islandName;
    private int completedLevel;

    @ManyToOne
    private User user;

    public JungleLushProgress() {}

    public JungleLushProgress(User user, String islandName, int completedLevel) {
        this.user = user;
        this.islandName = islandName;
        this.completedLevel = completedLevel;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIslandName() { return islandName; }
    public void setIslandName(String islandName) { this.islandName = islandName; }

    public int getCompletedLevel() { return completedLevel; }
    public void setCompletedLevel(int completedLevel) { this.completedLevel = completedLevel; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
