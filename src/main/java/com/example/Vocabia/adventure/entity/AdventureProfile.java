package com.example.Vocabia.adventure.entity;

import com.example.Vocabia.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "adventure_profiles")
public class AdventureProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;

    private String adventurerName; // 🆕 ADD

    private String gender;         // 🆕 ADD

    private int experiencePoints;  // ✅ Better name instead of xp

    private int level;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAdventurerName() { return adventurerName; }
    public void setAdventurerName(String adventurerName) { this.adventurerName = adventurerName; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public int getExperiencePoints() { return experiencePoints; }
    public void setExperiencePoints(int experiencePoints) { this.experiencePoints = experiencePoints; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
}
