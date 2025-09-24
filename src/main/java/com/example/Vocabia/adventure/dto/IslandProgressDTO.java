package com.example.Vocabia.adventure.dto;

import java.time.LocalDateTime;

public class IslandProgressDTO {
    
    private String islandName;
    private int completedLevel;
    private int totalStars;
    private LocalDateTime lastUpdated;

    // Constructors
    public IslandProgressDTO() {}

    public IslandProgressDTO(String islandName, int completedLevel) {
        this.islandName = islandName;
        this.completedLevel = completedLevel;
        this.totalStars = 0;
    }

    public IslandProgressDTO(String islandName, int completedLevel, int totalStars) {
        this.islandName = islandName;
        this.completedLevel = completedLevel;
        this.totalStars = totalStars;
    }

    public IslandProgressDTO(String islandName, int completedLevel, int totalStars, LocalDateTime lastUpdated) {
        this.islandName = islandName;
        this.completedLevel = completedLevel;
        this.totalStars = totalStars;
        this.lastUpdated = lastUpdated;
    }

    // Getters and Setters
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
    }

    public int getTotalStars() {
        return totalStars;
    }

    public void setTotalStars(int totalStars) {
        this.totalStars = totalStars;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    @Override
    public String toString() {
        return "IslandProgressDTO{" +
                "islandName='" + islandName + '\'' +
                ", completedLevel=" + completedLevel +
                ", totalStars=" + totalStars +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}
