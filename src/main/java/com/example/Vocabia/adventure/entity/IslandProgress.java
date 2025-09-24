package com.example.Vocabia.adventure.entity;

import com.example.Vocabia.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "island_progress")
public class IslandProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "island_name", nullable = false)
    private String islandName;

    @Column(name = "completed_level", nullable = false)
    private int completedLevel = 0;

    @Column(name = "total_stars", nullable = false)
    private int totalStars = 0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    // Constructors
    public IslandProgress() {
        this.lastUpdated = LocalDateTime.now();
    }

    public IslandProgress(User user, String islandName, int completedLevel, int totalStars) {
        this.user = user;
        this.islandName = islandName;
        this.completedLevel = completedLevel;
        this.totalStars = totalStars;
        this.lastUpdated = LocalDateTime.now();
    }

    // Update method to automatically set lastUpdated
    @PreUpdate
    public void preUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.lastUpdated == null) {
            this.lastUpdated = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getIslandName() {
        return islandName;
    }

    public void setIslandName(String islandName) {
        this.islandName = islandName;
    }

    public int getCompletedLevel() {
        return completedLevel;
    }

    public void setCompletedLevel(int completedLevel) {
        this.completedLevel = completedLevel;
        this.lastUpdated = LocalDateTime.now();
    }

    public int getTotalStars() {
        return totalStars;
    }

    public void setTotalStars(int totalStars) {
        this.totalStars = totalStars;
        this.lastUpdated = LocalDateTime.now();
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    @Override
    public String toString() {
        return "IslandProgress{" +
                "id=" + id +
                ", islandName='" + islandName + '\'' +
                ", completedLevel=" + completedLevel +
                ", totalStars=" + totalStars +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}
