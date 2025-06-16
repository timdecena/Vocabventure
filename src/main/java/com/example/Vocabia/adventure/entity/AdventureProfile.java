package com.example.Vocabia.adventure.entity;

import com.example.Vocabia.entity.User;
import jakarta.persistence.*;

@Entity
public class AdventureProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;

    private int xp;
    private int level;
    @Column(name = "tutorial_completed")
    private boolean tutorialCompleted = false;


    public boolean isTutorialCompleted() { return tutorialCompleted; }
public void setTutorialCompleted(boolean tutorialCompleted) { this.tutorialCompleted = tutorialCompleted; }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }



}
