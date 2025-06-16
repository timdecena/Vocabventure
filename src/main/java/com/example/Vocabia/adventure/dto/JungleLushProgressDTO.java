package com.example.Vocabia.adventure.dto;

public class JungleLushProgressDTO {
    private String islandName;
    private int completedLevel;

    public JungleLushProgressDTO() {}

    public JungleLushProgressDTO(String islandName, int completedLevel) {
        this.islandName = islandName;
        this.completedLevel = completedLevel;
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
    }
}
