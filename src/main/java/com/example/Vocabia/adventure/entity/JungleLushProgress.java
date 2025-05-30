package com.example.Vocabia.adventure.entity;

import com.example.Vocabia.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "jungle_lush_progress")
public class JungleLushProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;

    private boolean dreamIntroSeen;
    private boolean wizardSceneSeen;
    private boolean villageSceneSeen;
    private boolean victorySceneSeen;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public boolean isDreamIntroSeen() { return dreamIntroSeen; }
    public void setDreamIntroSeen(boolean dreamIntroSeen) { this.dreamIntroSeen = dreamIntroSeen; }

    public boolean isWizardSceneSeen() { return wizardSceneSeen; }
    public void setWizardSceneSeen(boolean wizardSceneSeen) { this.wizardSceneSeen = wizardSceneSeen; }

    public boolean isVillageSceneSeen() { return villageSceneSeen; }
    public void setVillageSceneSeen(boolean villageSceneSeen) { this.villageSceneSeen = villageSceneSeen; }

    public boolean isVictorySceneSeen() { return victorySceneSeen; }
    public void setVictorySceneSeen(boolean victorySceneSeen) { this.victorySceneSeen = victorySceneSeen; }
}
