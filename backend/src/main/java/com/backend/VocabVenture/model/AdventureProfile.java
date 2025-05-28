package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "adventure_profile")
public class AdventureProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "adventurer_name", nullable = false)
    private String adventurerName;

    @Column(name = "gender")
    private String gender;

    @Column(name = "hearts")
    private int hearts;

    @Column(name = "scrolls_collected")
    private int scrollsCollected;

    @Column(name = "current_island")
    private int currentIsland;

    @Column(name = "stars_earned")
    private int starsEarned;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "tutorial_completed")
    private boolean tutorialCompleted;

    // Getters and setters
    public Long getProfileId() { return profileId; }
    public void setProfileId(Long profileId) { this.profileId = profileId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getAdventurerName() { return adventurerName; }
    public void setAdventurerName(String adventurerName) { this.adventurerName = adventurerName; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public int getHearts() { return hearts; }
    public void setHearts(int hearts) { this.hearts = hearts; }

    public int getScrollsCollected() { return scrollsCollected; }
    public void setScrollsCollected(int scrollsCollected) { this.scrollsCollected = scrollsCollected; }

    public int getCurrentIsland() { return currentIsland; }
    public void setCurrentIsland(int currentIsland) { this.currentIsland = currentIsland; }

    public int getStarsEarned() { return starsEarned; }
    public void setStarsEarned(int starsEarned) { this.starsEarned = starsEarned; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public boolean isTutorialCompleted() { return tutorialCompleted; }
    public void setTutorialCompleted(boolean tutorialCompleted) { this.tutorialCompleted = tutorialCompleted; }
} 