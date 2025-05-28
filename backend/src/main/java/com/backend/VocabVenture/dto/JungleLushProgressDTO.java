package com.backend.VocabVenture.dto;

import java.util.Map;

public class JungleLushProgressDTO {
    private int unlockedLevel;
    private Map<Integer, Integer> stars;

    public int getUnlockedLevel() { return unlockedLevel; }
    public void setUnlockedLevel(int unlockedLevel) { this.unlockedLevel = unlockedLevel; }

    public Map<Integer, Integer> getStars() { return stars; }
    public void setStars(Map<Integer, Integer> stars) { this.stars = stars; }
} 